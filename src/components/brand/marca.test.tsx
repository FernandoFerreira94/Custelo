import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PzMarca, PzSimbolo } from "@/components/brand/marca";

describe("marca PacoteZap", () => {
  it("o símbolo tem nome acessível", () => {
    render(<PzSimbolo />);
    expect(screen.getByRole("img", { name: "PacoteZap" })).toBeInTheDocument();
  });

  it("a marca escreve Pacote + Zap", () => {
    render(<PzMarca />);
    expect(screen.getByText("Zap")).toBeInTheDocument();
    expect(screen.getByText(/Pacote/)).toBeInTheDocument();
  });

  it("sem nome mostra só o símbolo", () => {
    render(<PzMarca nome={false} />);
    expect(screen.queryByText("Zap")).not.toBeInTheDocument();
  });
});
