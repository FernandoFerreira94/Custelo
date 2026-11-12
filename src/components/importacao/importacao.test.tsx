import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

import type { LinhaDoLote } from "@/application/importacao/ports";
import { ConferirLote } from "@/components/importacao/conferir-lote";

const linha = (
  n: number,
  situacao: LinhaDoLote["situacao"],
  problemas: string[] = [],
): LinhaDoLote => ({
  id: `00000000-0000-4000-8000-00000000000${n}`,
  numeroLinha: n,
  dados: { _entrada: { Número: String(n) } },
  situacao,
  problemas,
  decisao: null,
  registroId: null,
});

const ok = vi.fn(async () => ({ ok: true as const, data: null }));
const props = {
  loteId: "lote",
  cabecalhos: ["Número"],
  voltarPara: "/gestao/unidades",
  corrigir: ok,
  decidir: ok,
  confirmar: ok,
  cancelar: ok,
};

describe("ConferirLote", () => {
  it("mostra os problemas e só libera a importação com a autorização marcada", async () => {
    render(
      <ConferirLote
        {...props}
        linhas={[linha(1, "ok"), linha(2, "erro", ["Número vazio."])]}
      />,
    );
    expect(screen.getByText("Número vazio.")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Continuar para a confirmação" }),
    );
    const importar = screen.getByRole("button", {
      name: "Importar 1 cadastros",
    });
    expect((importar as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(importar);
    await waitFor(() =>
      expect(ok).toHaveBeenCalledWith({ loteId: "lote", confirmou: true }),
    );
  });

  it("sem nenhuma linha pronta, oferece o relatório de erros", () => {
    render(<ConferirLote {...props} linhas={[linha(1, "erro", ["x"])]} />);
    expect(screen.getByText("Nenhuma linha pronta.")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /Baixar relatório de erros/ }),
    ).toBeTruthy();
  });
});
