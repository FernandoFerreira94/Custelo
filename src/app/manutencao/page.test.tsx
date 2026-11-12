import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PaginaManutencao from "@/app/manutencao/page";

describe("/manutencao", () => {
  it("explica e orienta a portaria, sem botão de ação", () => {
    render(<PaginaManutencao />);

    expect(
      screen.getByRole("heading", { name: "Estamos melhorando o PacoteZap" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/caderno de contingência/)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
