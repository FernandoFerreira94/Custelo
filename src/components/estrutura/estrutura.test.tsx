import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

import type { NoArvore, UnidadeNaArvore } from "@/application/estrutura/ports";
import {
  ArvoreEstrutura,
  montarNos,
  totalDaArea,
} from "@/components/estrutura/arvore-estrutura";
import { BannerSemContato } from "@/components/estrutura/banner-sem-contato";
import {
  GerarUnidadesSheet,
  previaDaGeracao,
} from "@/components/estrutura/gerar-unidades-sheet";

const unidade = (extra: Partial<UnidadeNaArvore>): UnidadeNaArvore => ({
  id: "u1",
  codigo: "B-304",
  tipo: "apartamento",
  areaId: "a1",
  apelidos: ["BL B AP 304"],
  moradores: ["Mariana Souza", "Pedro Souza"],
  semContato: false,
  ...extra,
});

const bloco: NoArvore = {
  id: "a1",
  nome: "Bloco B",
  ordem: 0,
  unidadesAtivas: 2,
  filhos: [],
};

describe("previaDaGeracao", () => {
  it("3 blocos × 9 andares × 8 por andar: A-101 … C-908 · 216 unidades", () => {
    expect(
      previaDaGeracao({
        blocos: 3,
        andares: 9,
        porAndar: 8,
        numeracao: "andar",
      }),
    ).toEqual({ ok: true, total: 216, primeiro: "A-101", ultimo: "C-908" });
  });

  it("devolve a mensagem do domínio quando a entrada não serve", () => {
    expect(
      previaDaGeracao({
        blocos: 1,
        andares: 1,
        porAndar: 120,
        numeracao: "andar",
      }),
    ).toMatchObject({ ok: false });
  });
});

describe("GerarUnidadesSheet", () => {
  it("mostra a prévia ao vivo e o botão com o total", () => {
    render(
      <GerarUnidadesSheet gerar={async () => ({ ok: true, data: null })} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Novo bloco" }));

    expect(
      screen.getByText("A-101 … C-908 · 216 unidades"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Criar 216 unidades" }),
    ).toBeEnabled();
  });

  it("a prévia acompanha o que se digita", () => {
    render(
      <GerarUnidadesSheet gerar={async () => ({ ok: true, data: null })} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Novo bloco" }));

    fireEvent.change(screen.getByLabelText("Blocos"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText("Andares por bloco"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Unidades por andar"), {
      target: { value: "3" },
    });

    expect(screen.getByText("A-101 … A-203 · 6 unidades")).toBeInTheDocument();
  });

  it("entrada inválida desabilita o botão e explica", () => {
    render(
      <GerarUnidadesSheet gerar={async () => ({ ok: true, data: null })} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Novo bloco" }));

    fireEvent.change(screen.getByLabelText("Unidades por andar"), {
      target: { value: "120" },
    });

    expect(
      screen.getByRole("button", { name: "Criar unidades" }),
    ).toBeDisabled();
    expect(screen.getByText(/até 99 unidades por andar/)).toBeInTheDocument();
  });

  it("conflito mostra a lista de códigos que já existem e mantém o painel aberto", async () => {
    const falha = {
      ok: false as const,
      codigo: "CONFLITO" as const,
      mensagem: "Já existem: A-101, A-102. Ajuste e gere de novo.",
    };
    render(<GerarUnidadesSheet gerar={async () => falha} />);
    fireEvent.click(screen.getByRole("button", { name: "Novo bloco" }));

    fireEvent.click(screen.getByRole("button", { name: "Criar 216 unidades" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Já existem: A-101, A-102.",
    );
  });
});

describe("árvore da estrutura", () => {
  it("monta áreas com unidades e coloca a unidade sem área na raiz", () => {
    const nos = montarNos(
      [bloco],
      [unidade({}), unidade({ id: "u2", codigo: "Casa 1", areaId: null })],
    );

    expect(nos.map((n) => n.id)).toEqual(["a1", "u:u2"]);
    expect(nos[0]?.children?.map((n) => n.id)).toEqual(["u:u1"]);
  });

  it("mostra o selo de moradores ou 'Sem contato' e abre o painel da unidade", () => {
    render(
      <ArvoreEstrutura
        areas={[bloco]}
        unidades={[
          unidade({}),
          unidade({
            id: "u2",
            codigo: "B-305",
            moradores: [],
            semContato: true,
          }),
        ]}
      />,
    );

    expect(screen.getByText("2 moradores")).toBeInTheDocument();
    expect(screen.getByText("Sem contato")).toBeInTheDocument();

    fireEvent.click(screen.getByText("B-304"));

    expect(screen.getByText("Mariana Souza, Pedro Souza")).toBeInTheDocument();
    expect(screen.getByText("BL B AP 304")).toBeInTheDocument();
    // O nome do bloco aparece na árvore e no painel da unidade.
    expect(screen.getAllByText("Bloco B")).toHaveLength(2);
  });
});

describe("BannerSemContato", () => {
  it("aparece com o total e leva para as unidades sem contato", () => {
    render(<BannerSemContato total={14} />);

    expect(
      screen.getByText(/14 unidades sem ninguém com contato/),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver unidades" })).toHaveAttribute(
      "href",
      "/gestao/unidades?semContato=1",
    );
  });

  it("some quando não há nenhuma", () => {
    const { container } = render(<BannerSemContato total={0} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("totalDaArea", () => {
  it("o bloco soma as unidades dos andares dentro dele", () => {
    const andar = (id: string, n: number): NoArvore => ({
      id,
      nome: id,
      ordem: 0,
      unidadesAtivas: n,
      filhos: [],
    });
    const comAndares: NoArvore = {
      id: "b",
      nome: "Bloco A",
      ordem: 0,
      unidadesAtivas: 0,
      filhos: [andar("a1", 4), andar("a2", 4), andar("a3", 4)],
    };

    expect(totalDaArea(comAndares)).toBe(12);
  });
});
