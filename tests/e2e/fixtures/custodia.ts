import postgres from "postgres";
import { uuidv7 } from "uuidv7";

import { codigoCurto } from "@/domain/custodia/codigo";

import { withRls } from "../../rls/helpers";

/**
 * Cria, no banco do ambiente (E2E_DATABASE_URL), uma unidade própria do teste com
 * 4 encomendas, uma por situação, e duas prateleiras (C2 e VG) num ponto novo.
 * Os eventos passam pelo trigger de custódia como na aplicação.
 */
export async function semearCustodia(emailDoGestor: string) {
  const url = process.env.E2E_DATABASE_URL;
  if (!url)
    throw new Error("E2E_DATABASE_URL obrigatório para o e2e da custódia");
  const sql = postgres(url, { prepare: false, max: 1 });
  try {
    const [escopo] = await sql<
      { org_id: string; empreendimento_id: string; usuario_id: string }[]
    >`
      select e.org_id, e.empreendimento_id, e.usuario_id
      from escopos_usuario e join usuarios u on u.id = e.usuario_id
      where u.email = ${emailDoGestor} and e.ativo and e.empreendimento_id is not null
      limit 1`;
    if (!escopo) throw new Error("gestor do seed sem escopo de empreendimento");
    const f = {
      orgId: escopo.org_id,
      empreendimentoId: escopo.empreendimento_id,
      userId: escopo.usuario_id,
    };
    const codigo = `E2E-${Date.now() % 1_000_000}`;
    const unidadeId = uuidv7();
    const pontoId = uuidv7();
    const c2 = uuidv7();
    const vg = uuidv7();
    const ids: string[] = [];

    await sql`insert into unidades (id, org_id, empreendimento_id, codigo)
      values (${unidadeId}, ${f.orgId}, ${f.empreendimentoId}, ${codigo})`;
    await sql`insert into pontos_recebimento (id, org_id, empreendimento_id, nome)
      values (${pontoId}, ${f.orgId}, ${f.empreendimentoId}, ${`Portaria ${codigo}`})`;
    await sql`insert into locais_guarda (id, org_id, empreendimento_id, ponto_id, codigo, capacidade)
      values (${c2}, ${f.orgId}, ${f.empreendimentoId}, ${pontoId}, 'C2', 24),
             (${vg}, ${f.orgId}, ${f.empreendimentoId}, ${pontoId}, 'VG', 8)`;

    // recebida, aguardando, pronta, falha: cada uma com a sequência de eventos real.
    const roteiros: [string, string | null, string][][] = [
      [],
      [["NOTIFICACAO_AGENDADA", "IDENTIFICADA", "AGUARDANDO_NOTIFICACAO"]],
      [
        ["NOTIFICACAO_AGENDADA", "IDENTIFICADA", "AGUARDANDO_NOTIFICACAO"],
        ["NOTIFICACAO_ENVIADA", "AGUARDANDO_NOTIFICACAO", "NOTIFICADA"],
      ],
      [
        ["NOTIFICACAO_AGENDADA", "IDENTIFICADA", "AGUARDANDO_NOTIFICACAO"],
        ["NOTIFICACAO_FALHOU", "AGUARDANDO_NOTIFICACAO", "FALHA_NOTIFICACAO"],
      ],
    ];
    for (const roteiro of roteiros) {
      const id = uuidv7();
      ids.push(id);
      await withRls(sql, f, async (tx) => {
        await tx`insert into encomendas (id, org_id, empreendimento_id, codigo_curto, ponto_id, origem, ocorrido_em, recebido_por)
          values (${id}, ${f.orgId}, ${f.empreendimentoId}, ${codigoCurto(id)}, ${pontoId}, 'online', now(), ${f.userId})`;
        const passos: [string, string | null, string, object, string][] = [
          ["RECEBIMENTO_REGISTRADO", null, "RECEBIDA", {}, "usuario"],
          [
            "IDENTIFICACAO_CONFIRMADA",
            "RECEBIDA",
            "IDENTIFICADA",
            { para: { unidade_id: unidadeId } },
            "usuario",
          ],
          [
            "LOCALIZACAO_ALTERADA",
            "IDENTIFICADA",
            "IDENTIFICADA",
            {
              de: { local_guarda_id: null },
              para: { local_guarda_id: c2, ponto_id: pontoId },
            },
            "usuario",
          ],
          ...roteiro.map(
            ([t, de, para]) =>
              [t, de, para, {}, "sistema"] as [
                string,
                string | null,
                string,
                object,
                string,
              ],
          ),
        ];
        for (const [i, [tipo, de, para, dados, ator]] of passos.entries()) {
          await tx`insert into custody_events (id, org_id, empreendimento_id, encomenda_id, sequencia, tipo,
              estado_anterior, estado_novo, dados, ator_tipo, ator_usuario_id, origem, ocorrido_em)
            values (${uuidv7()}, ${f.orgId}, ${f.empreendimentoId}, ${id}, ${i + 1}, ${tipo},
              ${de}::encomenda_estado, ${para}::encomenda_estado, ${tx.json(dados as never)}, ${ator},
              ${ator === "usuario" ? f.userId : null}, 'online', now())`;
        }
      });
    }
    return { codigo, ids, locais: { c2, vg } };
  } finally {
    await sql.end({ timeout: 5 });
  }
}
