import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BotaoAjuda } from "@/components/auth/botao-ajuda";

describe("BotaoAjuda", () => {
  it("abre o diálogo com a lista de problemas", async () => {
    render(<BotaoAjuda />);
    fireEvent.click(
      screen.getByRole("button", { name: "Precisa de ajuda para entrar?" }),
    );
    expect(
      await screen.findByRole("dialog", {
        name: "Precisa de ajuda para entrar?",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Esqueci a senha ou ela não funciona"),
    ).toBeInTheDocument();
  });

  it("sem contato configurado não mostra botões de envio", async () => {
    render(<BotaoAjuda />);
    fireEvent.click(
      screen.getByRole("button", { name: "Precisa de ajuda para entrar?" }),
    );
    await screen.findByRole("dialog");
    expect(
      screen.queryByRole("link", { name: /Enviar pelo WhatsApp/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Enviar por e-mail/ }),
    ).not.toBeInTheDocument();
  });

  it("não leva e-mail nem senha junto com o pedido", async () => {
    render(<BotaoAjuda />);
    fireEvent.click(
      screen.getByRole("button", { name: "Precisa de ajuda para entrar?" }),
    );
    await screen.findByRole("dialog");
    expect(screen.getByText("Aparelho")).toBeInTheDocument();
    expect(screen.getByText("Página")).toBeInTheDocument();
    expect(screen.queryByText("E-mail digitado")).not.toBeInTheDocument();
  });
});
