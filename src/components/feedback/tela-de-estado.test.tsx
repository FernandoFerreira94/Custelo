import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TelaDeEstado } from "@/components/feedback/tela-de-estado";

describe("TelaDeEstado", () => {
  it("mostra título, descrição, código e ação", () => {
    render(
      <TelaDeEstado
        status="500"
        titulo="Algo deu errado do nosso lado"
        descricao="Tente de novo."
        codigo="PZ-500-8F2A"
        acoes={<button type="button">Tentar de novo</button>}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Algo deu errado do nosso lado" }),
    ).toBeInTheDocument();
    expect(screen.getByText("PZ-500-8F2A")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Tentar de novo" }),
    ).toBeInTheDocument();
  });
});
