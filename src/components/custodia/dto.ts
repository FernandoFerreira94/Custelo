import type { Detalhe } from "@/application/custodia/consultas";
import type { ItemLinhaDoTempo } from "@/application/custodia/linha-do-tempo";
import type { LocalComOcupacao } from "@/application/custodia/ports";
import { lerSituacao, PRAZOS_PADRAO } from "@/domain/custodia/situacao";

import type { DetalheDto, ItemLinhaDto } from "./detalhe-encomenda";
import type { LocalDto } from "./mover-sheet";

/** Converte a leitura do servidor no que a tela recebe (mesmo formato no JSON e no RSC). */
export function paraDetalheDto(d: Detalhe): DetalheDto {
  const agora = new Date();
  return {
    id: d.id,
    codigoCurto: d.codigoCurto,
    estado: d.estado,
    badge: d.situacao.badge,
    ocorridoEm: d.ocorridoEm.toISOString(),
    volumes: d.volumes,
    transportadora: d.transportadora,
    unidade: d.unidade,
    destinatario: d.destinatario,
    local: d.local,
    ponto: d.ponto,
    // Só o estado: a urgência das outras aparece quando a pessoa abre cada uma.
    outrasAtivas: d.outrasAtivas.map((o) => ({
      id: o.id,
      codigoCurto: o.codigoCurto,
      badge: lerSituacao(
        { estado: o.estado, ocorridoEm: agora },
        agora,
        PRAZOS_PADRAO,
      ).badge,
    })),
  };
}

export const paraLinhaDto = (itens: ItemLinhaDoTempo[]): ItemLinhaDto[] =>
  itens.map((i) => ({ ...i, ocorridoEm: i.ocorridoEm.toISOString() }));

/** Locais do ponto da encomenda (ou todos, se ela ainda não tem ponto). */
export const paraLocaisDto = (
  locais: LocalComOcupacao[],
  pontoId: string | undefined,
): LocalDto[] =>
  locais
    .filter((l) => !pontoId || l.pontoId === pontoId)
    .map((l) => ({
      id: l.id,
      codigo: l.codigo,
      usado: l.usado,
      capacidade: l.capacidade,
    }));
