import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("sonner", () => ({ toast }));

import type { Autorizado, PessoaBruta } from "@/application/pessoas/ports";
import { AbaDados } from "@/components/pessoas/aba-dados";
import { AbaVinculos } from "@/components/pessoas/aba-vinculos";
import { urlDasPessoas } from "@/components/pessoas/filtros";
import { FiltrosDePessoas } from "@/components/pessoas/filtros-de-pessoas";
import { ListaDePessoas } from "@/components/pessoas/lista-de-pessoas";
import { MoradorSheet } from "@/components/pessoas/morador-sheet";

const ok = async () => ({ ok: true as const, data: null });
const DATA = new Date("2026-10-01T12:00:00Z");

const pessoa = (extra: Partial<PessoaBruta> = {}): PessoaBruta => ({
  id: "p1",
  nome: "Helena Prado",
  cpf: "***.982.247-**",
  contatos: [
    {
      id: "c1",
      canal: "whatsapp",
      valor: "+5511987654321",
      status: "valido",
      ordem: 0,
      consentimentoEm: DATA,
    },
  ],
  vinculos: [
    {
      id: "v1",
      pessoaId: "p1",
      unidadeId: "u1",
      unidadeCodigo: "B-304",
      tipo: "titular",
      status: "ativo",
      recebeAviso: true,
      ordemAviso: 0,
      vigenciaFim: null,
    },
  ],
  ...extra,
});

const acoes = {
  definirAviso: ok,
  encerrar: ok,
  revogar: ok,
  vincular: ok,
  autorizar: ok,
};

describe("ListaDePessoas", () => {
  it("o nome leva ao detalhe e mostra as unidades", () => {
    render(
      <ListaDePessoas
        pessoas={[
          { id: "p1", nome: "Helena Prado", unidades: ["B-304"], ativo: true },
          { id: "p2", nome: "Sem Unidade", unidades: [], ativo: true },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "Helena Prado" })).toHaveAttribute(
      "href",
      "/gestao/pessoas/p1",
    );
    expect(screen.getByText("B-304")).toBeInTheDocument();
    expect(screen.getByText("Sem vínculo ativo")).toBeInTheDocument();
  });
});

describe("FiltrosDePessoas", () => {
  const contagens = {
    todas: 40,
    titulares: 10,
    moradores: 20,
    inquilinos: 5,
    autorizados: 3,
    semContato: 7,
  };

  it("monta a URL só com o que está ativo", () => {
    expect(urlDasPessoas(null, "")).toBe("/gestao/pessoas");
    expect(urlDasPessoas("inquilinos", " ana ")).toBe(
      "/gestao/pessoas?filtro=inquilinos&q=ana",
    );
  });

  it("clicar em um filtro leva para a URL dele; 'Todas' limpa", () => {
    render(<FiltrosDePessoas contagens={contagens} filtro={null} busca="" />);

    fireEvent.click(screen.getByRole("button", { name: /Sem contato/ }));
    expect(router.push).toHaveBeenLastCalledWith(
      "/gestao/pessoas?filtro=semContato",
    );

    fireEvent.click(screen.getByRole("button", { name: /Todas/ }));
    expect(router.push).toHaveBeenLastCalledWith("/gestao/pessoas");
  });
});

describe("MoradorSheet", () => {
  it("a unidade vem primeiro, e o consentimento explica o que o gestor está registrando", () => {
    render(
      <MoradorSheet unidades={[{ id: "u1", codigo: "B-304" }]} criar={ok} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Novo morador" }));

    const campos = screen
      .getAllByRole("textbox")
      .concat(screen.getAllByRole("combobox"));
    expect(campos.length).toBeGreaterThan(3);
    expect(screen.getAllByRole("combobox")[0]).toHaveAccessibleName("Unidade");
    expect(
      screen.getByLabelText("O morador autorizou receber avisos por WhatsApp"),
    ).not.toBeChecked();
    expect(
      screen.getByText(/Fica registrado quem marcou e quando/),
    ).toBeInTheDocument();
  });

  it("manda o consentimento só quando marcado e mostra o erro do campo", async () => {
    const criar = vi.fn(async () => ({
      ok: false as const,
      codigo: "ENTRADA_INVALIDA" as const,
      mensagem: "Confira os campos destacados.",
      campos: {
        whatsapp: "WhatsApp precisa ser celular com DDD (11 dígitos).",
      },
    }));
    render(
      <MoradorSheet unidades={[{ id: "u1", codigo: "B-304" }]} criar={criar} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Novo morador" }));
    fireEvent.change(screen.getByLabelText("Unidade"), {
      target: { value: "u1" },
    });
    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: "Helena" },
    });
    fireEvent.change(screen.getByLabelText("WhatsApp"), {
      target: { value: "119" },
    });
    fireEvent.click(
      screen.getByLabelText("O morador autorizou receber avisos por WhatsApp"),
    );

    fireEvent.click(screen.getByRole("button", { name: "Cadastrar morador" }));

    expect(
      await screen.findByText(
        "WhatsApp precisa ser celular com DDD (11 dígitos).",
      ),
    ).toBeInTheDocument();
    expect(criar).toHaveBeenCalledWith(
      expect.objectContaining({ unidadeId: "u1", moradorAutorizou: true }),
    );
  });
});

describe("AbaDados", () => {
  it("o CPF aparece mascarado e 'Mostrar' pede o completo (auditado) à ação", async () => {
    const detalhe = vi.fn(async () => ({
      ok: true as const,
      data: { cpf: "52998224725" },
    }));
    render(
      <AbaDados
        pessoa={pessoa()}
        podeEditar
        detalhe={detalhe}
        consentir={ok}
        salvarContato={ok}
      />,
    );

    expect(screen.getByText("***.982.247-**")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mostrar" }));

    expect(await screen.findByText("529.982.247-25")).toBeInTheDocument();
    expect(detalhe).toHaveBeenCalledWith({ id: "p1", mostrarCpf: true });

    fireEvent.click(screen.getByRole("button", { name: "Ocultar" }));
    expect(screen.getByText("***.982.247-**")).toBeInTheDocument();
  });

  it("sem permissão de edição, não há 'Mostrar' nem cadastro de contato", () => {
    render(
      <AbaDados
        pessoa={pessoa()}
        podeEditar={false}
        detalhe={async () => ({ ok: true as const, data: { cpf: null } })}
        consentir={ok}
        salvarContato={ok}
      />,
    );

    expect(screen.queryByRole("button", { name: "Mostrar" })).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Adicionar contato" }),
    ).toBeNull();
  });

  it("contato sem autorização oferece registrar e chama a ação com o contato", async () => {
    const consentir = vi.fn(ok);
    render(
      <AbaDados
        pessoa={pessoa({
          contatos: [
            {
              id: "c9",
              canal: "email",
              valor: "h@x.com",
              status: "precisa_confirmacao",
              ordem: 0,
              consentimentoEm: null,
            },
          ],
        })}
        podeEditar
        detalhe={async () => ({ ok: true as const, data: { cpf: null } })}
        consentir={consentir}
        salvarContato={ok}
      />,
    );

    expect(screen.getByText("Sem autorização")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Registrar autorização" }),
    );

    await waitFor(() =>
      expect(consentir).toHaveBeenCalledWith({ contatoId: "c9" }),
    );
  });
});

describe("AbaVinculos", () => {
  const autorizados: Autorizado[] = [
    {
      vinculoId: "a1",
      pessoaId: "p9",
      nome: "Joana Prates",
      unidadeCodigo: "B-304",
      relacao: "irmã",
      validoAte: DATA,
    },
  ];

  it("o aviso fica desabilitado quando ninguém autorizou e liga quando há consentimento", () => {
    const semConsentimento = pessoa({
      contatos: [],
      vinculos: [{ ...pessoa().vinculos[0]!, recebeAviso: false }],
    });
    const { unmount } = render(
      <AbaVinculos
        pessoa={semConsentimento}
        autorizados={[]}
        unidadesDisponiveis={[]}
        unidadesDoMorador={[]}
        podeEditar
        acoes={acoes}
      />,
    );
    expect(screen.getByRole("switch", { name: "Recebe aviso" })).toBeDisabled();
    expect(
      screen.getByText("Registre a autorização antes"),
    ).toBeInTheDocument();
    unmount();

    render(
      <AbaVinculos
        pessoa={pessoa()}
        autorizados={[]}
        unidadesDisponiveis={[]}
        unidadesDoMorador={[]}
        podeEditar
        acoes={acoes}
      />,
    );
    expect(screen.getByRole("switch", { name: "Recebe aviso" })).toBeEnabled();
  });

  it("encerrar exige motivo: mostra o efeito e o erro do campo", async () => {
    const encerrar = vi.fn(async () => ({
      ok: false as const,
      codigo: "ENTRADA_INVALIDA" as const,
      mensagem: "Confira os campos destacados.",
      campos: {
        motivo:
          "Diga por que o vínculo terminou (mudou, vendeu, erro de cadastro).",
      },
    }));
    render(
      <AbaVinculos
        pessoa={pessoa()}
        autorizados={[]}
        unidadesDisponiveis={[]}
        unidadesDoMorador={[]}
        podeEditar
        acoes={{ ...acoes, encerrar }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Encerrar vínculo" }));
    expect(
      screen.getByText(/Encerrar não apaga o histórico/),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getAllByRole("button", { name: "Encerrar vínculo" }).at(-1)!,
    );

    expect(
      await screen.findByText(
        "Diga por que o vínculo terminou (mudou, vendeu, erro de cadastro).",
      ),
    ).toBeInTheDocument();
    expect(encerrar).toHaveBeenCalledWith({ vinculoId: "v1", motivo: "" });
  });

  it("lista os autorizados a retirar por ela, com Revogar", () => {
    render(
      <AbaVinculos
        pessoa={pessoa()}
        autorizados={autorizados}
        unidadesDisponiveis={[]}
        unidadesDoMorador={[{ id: "u1", codigo: "B-304" }]}
        podeEditar
        acoes={acoes}
      />,
    );

    expect(
      screen.getByText("Autorizados a retirar por Helena Prado"),
    ).toBeInTheDocument();
    expect(screen.getByText("Joana Prates")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Revogar" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Autorizar retirada" }),
    ).toBeInTheDocument();
  });

  it("vínculo encerrado mostra o selo e não oferece encerrar de novo", () => {
    render(
      <AbaVinculos
        pessoa={pessoa({
          vinculos: [
            {
              ...pessoa().vinculos[0]!,
              status: "encerrado",
              recebeAviso: false,
              vigenciaFim: DATA,
            },
          ],
        })}
        autorizados={[]}
        unidadesDisponiveis={[]}
        unidadesDoMorador={[]}
        podeEditar
        acoes={acoes}
      />,
    );

    expect(screen.getByText("Encerrado")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Encerrar vínculo" }),
    ).toBeNull();
    expect(screen.queryByRole("switch")).toBeNull();
  });

  it("só leitura: sem encerrar, sem aviso editável, sem novo vínculo", () => {
    render(
      <AbaVinculos
        pessoa={pessoa()}
        autorizados={autorizados}
        unidadesDisponiveis={[]}
        unidadesDoMorador={[]}
        podeEditar={false}
        acoes={acoes}
      />,
    );

    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("Recebe aviso")).toBeInTheDocument();
  });
});
