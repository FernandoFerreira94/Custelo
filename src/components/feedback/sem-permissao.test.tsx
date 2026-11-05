import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SemPermissao } from "@/components/feedback/sem-permissao";
import { MSG } from "@/lib/mensagens";

describe("SemPermissao", () => {
  it("mostra título, motivo e as duas ações", () => {
    render(<SemPermissao voltarPara="/gestao" />);

    expect(
      screen.getByRole("heading", {
        name: "Seu perfil não pode abrir esta tela",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(MSG.semPermissao)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute(
      "href",
      "/gestao",
    );
    expect(
      screen.getByRole("link", { name: "Falar com o gestor" }),
    ).toBeInTheDocument();
  });
});
