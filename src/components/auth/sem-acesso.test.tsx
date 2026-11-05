import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SemAcesso } from "@/components/auth/sem-acesso";

describe("SemAcesso", () => {
  it("explica o motivo e quem libera o acesso", () => {
    render(<SemAcesso email={null} signOutAction={async () => {}} />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Você ainda não tem acesso aqui",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Quem libera é o gestor/)).toBeInTheDocument();
  });

  it("oferece trocar de conta num botão de envio", () => {
    render(<SemAcesso email={null} signOutAction={async () => {}} />);
    expect(
      screen.getByRole("button", { name: "Entrar com outra conta" }),
    ).toHaveAttribute("type", "submit");
  });

  it("mostra a conta conectada só quando há e-mail", () => {
    const { rerender } = render(
      <SemAcesso email={null} signOutAction={async () => {}} />,
    );
    expect(screen.queryByText(/Conectado como/)).not.toBeInTheDocument();
    rerender(
      <SemAcesso
        email="carlos@vilaverde.com.br"
        signOutAction={async () => {}}
      />,
    );
    expect(
      screen.getByText("Conectado como carlos@vilaverde.com.br"),
    ).toBeInTheDocument();
  });

  it("mostra o aviso e mantém o botão quando sair falha", async () => {
    const falha = {
      ok: false as const,
      codigo: "INDISPONIVEL" as const,
      mensagem: "Sem conexão. Verifique a internet e tente de novo.",
    };
    render(<SemAcesso email={null} signOutAction={async () => falha} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Entrar com outra conta" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(falha.mensagem);
    expect(
      screen.getByRole("button", { name: "Entrar com outra conta" }),
    ).toBeEnabled();
  });
});
