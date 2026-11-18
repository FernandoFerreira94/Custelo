import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("sonner", () => ({ toast }));

import type { LocalGuarda } from "@/application/custodia/ports";
import type { Ponto } from "@/application/estrutura/ports";
import { AreasEPontos } from "@/components/estrutura/areas-e-pontos";
import { PontoSheet } from "@/components/estrutura/ponto-sheet";
import { MSG_CUSTODIA } from "@/lib/mensagens";

const ponto: Ponto = {
  id: "t1",
  nome: "Portaria principal",
  funcionamento: "24 h",
  ativo: true,
};
const local = (id: string, codigo: string, usado = 0): LocalGuarda => ({
  id,
  codigo,
  pontoId: "t1",
  capacidade: 24,
  volumeGrande: false,
  ativo: true,
  usado,
});

describe("prateleiras do ponto", () => {
  it("cria o ponto e depois salva 3 prateleiras com o id novo", async () => {
    const salvar = vi.fn(async () => ({
      ok: true as const,
      data: { id: "novo" },
    }));
    const salvarPrateleiras = vi.fn(async () => ({
      ok: true as const,
      data: null,
    }));
    render(
      <PontoSheet salvar={salvar} salvarPrateleiras={salvarPrateleiras} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Ponto" }));
    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: "Portaria da garagem" },
    });
    for (const [i, codigo, cap] of [
      [1, "A1", "24"],
      [2, "B2", "24"],
      [3, "VG", ""],
    ] as const) {
      fireEvent.click(
        screen.getByRole("button", { name: "Adicionar prateleira" }),
      );
      fireEvent.change(screen.getByLabelText(`Prateleira ${i}, nome`), {
        target: { value: codigo },
      });
      fireEvent.change(screen.getByLabelText(`Prateleira ${i}, capacidade`), {
        target: { value: cap },
      });
    }
    fireEvent.click(screen.getByRole("button", { name: "Salvar ponto" }));

    await waitFor(() => expect(salvarPrateleiras).toHaveBeenCalled());
    expect(salvarPrateleiras).toHaveBeenCalledWith({
      pontoId: "novo",
      prateleiras: [
        { codigo: "A1", capacidade: 24, volumeGrande: false },
        { codigo: "B2", capacidade: 24, volumeGrande: false },
        { codigo: "VG", capacidade: null, volumeGrande: false },
      ],
    });
  });

  it("prateleira com encomenda não tem remover; a vazia sai da lista", async () => {
    const salvarPrateleiras = vi.fn(async () => ({
      ok: true as const,
      data: null,
    }));
    render(
      <PontoSheet
        ponto={ponto}
        salvar={async () => ({ ok: true as const, data: null })}
        prateleiras={[local("l1", "A1", 3), local("l2", "B2")]}
        salvarPrateleiras={salvarPrateleiras}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    expect(
      screen.queryByRole("button", { name: "Remover prateleira A1" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("3 encomendas")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Remover prateleira B2" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Salvar ponto" }));

    await waitFor(() =>
      expect(salvarPrateleiras).toHaveBeenCalledWith({
        pontoId: "t1",
        prateleiras: [
          { id: "l1", codigo: "A1", capacidade: 24, volumeGrande: false },
        ],
      }),
    );
  });

  it("mostra a recusa do servidor e não fecha", async () => {
    render(
      <PontoSheet
        ponto={ponto}
        salvar={async () => ({ ok: true as const, data: null })}
        prateleiras={[local("l2", "B2")]}
        salvarPrateleiras={async () => ({
          ok: false as const,
          codigo: "CONFLITO" as const,
          mensagem: MSG_CUSTODIA.prateleiraComEncomenda(1),
        })}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Remover prateleira B2" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Salvar ponto" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      MSG_CUSTODIA.prateleiraComEncomenda(1),
    );
    expect(
      await screen.findByRole("button", { name: "Salvar ponto" }),
    ).toBeVisible();
  });

  it("a lista de pontos mostra a ocupação de cada prateleira", () => {
    render(
      <AreasEPontos
        areas={[]}
        pontos={[ponto]}
        pessoas={[]}
        prateleiras={{ t1: [local("l1", "A1", 11)] }}
      />,
    );
    expect(
      screen.getByRole("meter", { name: "Prateleira A1" }),
    ).toHaveAttribute("aria-valuetext", "11 de 24");
  });
});
