import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("sonner", () => ({ toast }));

import type { AreaComum, Ponto } from "@/application/estrutura/ports";
import { AreaComumSheet } from "@/components/estrutura/area-comum-sheet";
import { AreasEPontos } from "@/components/estrutura/areas-e-pontos";
import { PontoAtivo } from "@/components/estrutura/ponto-ativo";

const ok = async () => ({ ok: true as const, data: null });
const pessoas = [{ id: "p1", nome: "Marta Andrade" }];

const area = (extra: Partial<AreaComum> = {}): AreaComum => ({
  id: "a1",
  codigo: "Administração",
  responsavelPessoaId: "p1",
  responsavelNome: "Marta Andrade",
  avisarResponsavel: true,
  ativo: true,
  ...extra,
});

const ponto: Ponto = {
  id: "t1",
  nome: "Portaria principal",
  funcionamento: "24 h",
  ativo: true,
};

describe("AreasEPontos", () => {
  it("mostra 'Avisa' só com responsável e aviso ligados; o resto é 'Sem aviso'", () => {
    render(
      <AreasEPontos
        areas={[
          area(),
          area({
            id: "a2",
            codigo: "Garagem",
            responsavelNome: null,
            responsavelPessoaId: null,
          }),
          area({ id: "a3", codigo: "Academia", avisarResponsavel: false }),
        ]}
        pontos={[]}
        pessoas={pessoas}
      />,
    );

    expect(screen.getAllByText("Avisa")).toHaveLength(1);
    expect(screen.getAllByText("Sem aviso")).toHaveLength(2);
    expect(screen.getAllByText("Responsável: Marta Andrade")).toHaveLength(2);
    expect(screen.getByText("Sem responsável")).toBeInTheDocument();
  });

  it("estados vazios dizem o que fazer", () => {
    render(<AreasEPontos areas={[]} pontos={[]} pessoas={[]} />);

    expect(
      screen.getByText(/Nenhuma área comum cadastrada/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Nenhum ponto de recebimento/)).toBeInTheDocument();
  });

  it("só leitura: sem botões de cadastro quando não há como salvar", () => {
    render(
      <AreasEPontos areas={[area()]} pontos={[ponto]} pessoas={pessoas} />,
    );

    expect(
      screen.queryByRole("button", { name: /Área|Ponto|Editar/ }),
    ).toBeNull();
    expect(screen.queryByRole("switch")).toBeNull();
  });

  it("com permissão, mostra cadastro, edição e o interruptor do ponto", () => {
    render(
      <AreasEPontos
        areas={[area()]}
        pontos={[ponto]}
        pessoas={pessoas}
        salvarArea={{ criar: ok, editar: ok }}
        salvarPonto={{ criar: ok, editar: ok }}
        alternarPonto={ok}
      />,
    );

    expect(screen.getByRole("button", { name: "Área" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ponto" })).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: "Portaria principal ativo" }),
    ).toBeChecked();
  });
});

describe("AreaComumSheet", () => {
  it("avisar sem responsável mostra o erro no campo do responsável", async () => {
    const falha = {
      ok: false as const,
      codigo: "ENTRADA_INVALIDA" as const,
      mensagem: "Confira os campos destacados.",
      campos: { responsavel: "Escolha quem recebe o aviso desta área." },
    };
    render(<AreaComumSheet pessoas={pessoas} salvar={async () => falha} />);
    fireEvent.click(screen.getByRole("button", { name: "Área" }));
    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: "Salão" },
    });
    fireEvent.click(
      screen.getByRole("switch", { name: "Avisar o responsável" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Salvar área" }));

    expect(
      await screen.findByText("Escolha quem recebe o aviso desta área."),
    ).toBeInTheDocument();
  });

  it("criar manda a área como unidade do tipo área comum", async () => {
    const salvar = vi.fn(ok);
    render(<AreaComumSheet pessoas={pessoas} salvar={salvar} />);
    fireEvent.click(screen.getByRole("button", { name: "Área" }));
    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: "Academia" },
    });
    fireEvent.change(screen.getByLabelText("Responsável"), {
      target: { value: "p1" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Salvar área" }));

    await waitFor(() =>
      expect(salvar).toHaveBeenCalledWith({
        numero: "Academia",
        tipo: "area_comum",
        responsavelPessoaId: "p1",
        avisarResponsavel: false,
      }),
    );
  });
});

describe("PontoAtivo", () => {
  it("desfaz o interruptor quando a ação falha e avisa", async () => {
    const falha = {
      ok: false as const,
      codigo: "INDISPONIVEL" as const,
      mensagem: "O PacoteZap está instável agora.",
    };
    render(<PontoAtivo ponto={ponto} alternar={async () => falha} />);
    const chave = screen.getByRole("switch", {
      name: "Portaria principal ativo",
    });

    fireEvent.click(chave);

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(falha.mensagem),
    );
    await waitFor(() => expect(chave).toBeChecked());
  });
});
