import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

import type { UnidadeResumo } from "@/application/estrutura/ports";
import { DesativarUnidade } from "@/components/estrutura/desativar-unidade";
import {
  FiltrosDeUnidades,
  urlDaLista,
} from "@/components/estrutura/filtros-de-unidades";
import { ListaDeUnidades } from "@/components/estrutura/lista-de-unidades";
import {
  codigoAoVivo,
  UnidadeSheet,
} from "@/components/estrutura/unidade-sheet";

const unidade: UnidadeResumo = {
  id: "u1",
  codigo: "B-304",
  tipo: "apartamento",
  areaId: null,
  ativo: true,
  apelidos: ["BL B AP 304"],
};

const ok = async () => ({ ok: true as const, data: null });

describe("codigoAoVivo", () => {
  it.each([
    [{ bloco: "B", numero: "304", tipo: "apartamento" as const }, "B-304"],
    [{ bloco: "", numero: "23", tipo: "casa" as const }, "Casa 23"],
    [
      { bloco: "Térreo", numero: "1", tipo: "apartamento" as const },
      "Terreo-1",
    ],
    [{ bloco: "B", numero: " ", tipo: "apartamento" as const }, ""],
  ])("%j → %s", (entrada, esperado) => {
    expect(codigoAoVivo(entrada)).toBe(esperado);
  });
});

describe("UnidadeSheet", () => {
  it("mostra o código montado ao vivo", () => {
    render(<UnidadeSheet salvar={ok} />);
    fireEvent.click(screen.getByRole("button", { name: "Nova unidade" }));

    fireEvent.change(screen.getByLabelText("Bloco (opcional)"), {
      target: { value: "B" },
    });
    fireEvent.change(screen.getByLabelText("Número"), {
      target: { value: "304" },
    });

    expect(screen.getByText("B-304")).toBeInTheDocument();
    expect(screen.getByText(/Vai aparecer como/)).toBeInTheDocument();
  });

  it("número vazio mostra o erro do servidor no campo", async () => {
    const falha = {
      ok: false as const,
      codigo: "ENTRADA_INVALIDA" as const,
      mensagem: "Confira os campos destacados.",
      campos: { numero: "Informe o número da unidade." },
    };
    render(<UnidadeSheet salvar={async () => falha} />);
    fireEvent.click(screen.getByRole("button", { name: "Nova unidade" }));

    fireEvent.click(screen.getByRole("button", { name: "Criar unidade" }));

    expect(
      await screen.findByText("Informe o número da unidade."),
    ).toBeInTheDocument();
  });

  it("duplicada avisa e oferece abrir a que já existe", async () => {
    const falha = {
      ok: false as const,
      codigo: "DUPLICADO" as const,
      mensagem: "Já existe a unidade B-304. Abra ela para editar.",
    };
    render(<UnidadeSheet salvar={async () => falha} />);
    fireEvent.click(screen.getByRole("button", { name: "Nova unidade" }));
    fireEvent.change(screen.getByLabelText("Bloco (opcional)"), {
      target: { value: "B" },
    });
    fireEvent.change(screen.getByLabelText("Número"), {
      target: { value: "304" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Criar unidade" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Já existe a unidade B-304.",
    );
    expect(screen.getByRole("link", { name: "Abrir B-304" })).toHaveAttribute(
      "href",
      "/gestao/unidades?q=B-304",
    );
  });

  it("edição parte do código atual e dos apelidos", () => {
    render(<UnidadeSheet unidade={unidade} salvar={ok} />);
    fireEvent.click(screen.getByRole("button", { name: /Editar/ }));

    expect(screen.getByLabelText("Código")).toHaveValue("B-304");
    expect(screen.getByText("BL B AP 304")).toBeInTheDocument();
  });
});

describe("FiltrosDeUnidades", () => {
  const contagens = { todas: 216, semContato: 14, areasComuns: 4, inativas: 2 };

  it("monta a URL só com o que está ativo", () => {
    expect(urlDaLista(null, "")).toBe("/gestao/unidades");
    expect(urlDaLista("semContato", " B-30 ")).toBe(
      "/gestao/unidades?filtro=semContato&q=B-30",
    );
  });

  it("mostra as contagens e clicar filtra pela URL", () => {
    render(<FiltrosDeUnidades contagens={contagens} filtro={null} busca="" />);

    fireEvent.click(screen.getByRole("button", { name: /Sem contato/ }));

    expect(router.push).toHaveBeenCalledWith(
      "/gestao/unidades?filtro=semContato",
    );
    expect(
      screen.getByRole("button", { name: /Áreas comuns/ }),
    ).toHaveTextContent("4");
  });

  it("buscar leva o texto para a URL", () => {
    render(
      <FiltrosDeUnidades contagens={contagens} filtro="inativas" busca="" />,
    );

    fireEvent.change(screen.getByLabelText("Buscar por código ou apelido"), {
      target: { value: "B-90" },
    });
    fireEvent.submit(screen.getByRole("search"));

    expect(router.push).toHaveBeenCalledWith(
      "/gestao/unidades?filtro=inativas&q=B-90",
    );
  });
});

describe("ListaDeUnidades", () => {
  it("só leitura: sem coluna de ações quando não há como editar", () => {
    render(<ListaDeUnidades unidades={[unidade]} />);
    const tabela = within(screen.getByRole("table"));

    expect(tabela.getByText("B-304")).toBeInTheDocument();
    expect(tabela.getByText("BL B AP 304")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Desativar/ })).toBeNull();
  });

  it("inativa não oferece desativar de novo", () => {
    render(
      <ListaDeUnidades
        unidades={[{ ...unidade, ativo: false }]}
        editar={ok}
        desativar={ok}
      />,
    );

    expect(screen.queryByRole("button", { name: "Desativar" })).toBeNull();
    const tabela = within(screen.getByRole("table"));
    expect(tabela.getByRole("button", { name: /Editar/ })).toBeInTheDocument();
  });

  it("no celular cada unidade vira um cartão com tipo e ações", () => {
    render(<ListaDeUnidades unidades={[unidade]} editar={ok} desativar={ok} />);
    const cartoes = within(screen.getByRole("list", { name: "Unidades" }));
    expect(cartoes.getByText("B-304")).toBeInTheDocument();
    expect(cartoes.getByText("Apartamento")).toBeInTheDocument();
    expect(
      cartoes.getByRole("button", { name: "Desativar" }),
    ).toBeInTheDocument();
  });
});

describe("DesativarUnidade", () => {
  it("explica o efeito e mostra a recusa quando há vínculo ativo", async () => {
    const recusa = {
      ok: false as const,
      codigo: "CONFLITO" as const,
      mensagem: "Encerre os vínculos de B-304 antes de desativar.",
    };
    render(
      <DesativarUnidade
        id="u1"
        codigo="B-304"
        desativar={async () => recusa}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Desativar" }));

    expect(
      screen.getByText(/deixa de ser destino de encomenda/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Desativar unidade" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Encerre os vínculos de B-304 antes de desativar.",
    );
  });
});
