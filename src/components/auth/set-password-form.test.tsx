import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SetPasswordForm } from "@/components/auth/set-password-form";

const { requestSetPassword } = vi.hoisted(() => ({
  requestSetPassword: vi.fn(),
}));

vi.mock("@/components/auth/request-set-password", () => ({
  requestSetPassword,
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string | { src: string } }) => (
    // eslint-disable-next-line @next/next/no-img-element -- mock do next/image no jsdom
    <img alt={alt} src={typeof src === "string" ? src : src.src} />
  ),
}));

describe("SetPasswordForm", () => {
  it("pede as senhas quando o envio esta vazio", async () => {
    render(<SetPasswordForm onBack={vi.fn()} onSaved={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Salvar senha" }));

    expect(await screen.findByText("Informe a senha.")).toBeInTheDocument();
    expect(screen.getByText("Confirme a senha.")).toBeInTheDocument();
  });

  it("recusa confirmacao diferente", async () => {
    render(<SetPasswordForm onBack={vi.fn()} onSaved={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Nova senha"), {
      target: { value: "1234567890" },
    });
    fireEvent.change(screen.getByLabelText("Confirmar senha"), {
      target: { value: "0987654321" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar senha" }));

    expect(
      await screen.findByText("As senhas não coincidem."),
    ).toBeInTheDocument();
  });

  it("salva senha valida", async () => {
    requestSetPassword.mockResolvedValue({
      ok: true,
      redirectTo: "/contexto",
    });

    const onSaved = vi.fn();
    render(<SetPasswordForm onBack={vi.fn()} onSaved={onSaved} />);
    fireEvent.change(screen.getByLabelText("Nova senha"), {
      target: { value: "1234567890" },
    });
    fireEvent.change(screen.getByLabelText("Confirmar senha"), {
      target: { value: "1234567890" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar senha" }));

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith("/contexto"));
  });

  it("mostra erro retornado pela acao de definir senha", async () => {
    requestSetPassword.mockResolvedValue({
      ok: false,
      message: "Link expirado. Solicite um novo link de recuperação.",
    });

    render(<SetPasswordForm onBack={vi.fn()} onSaved={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Nova senha"), {
      target: { value: "1234567890" },
    });
    fireEvent.change(screen.getByLabelText("Confirmar senha"), {
      target: { value: "1234567890" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar senha" }));

    expect(
      await screen.findByText(
        "Link expirado. Solicite um novo link de recuperação.",
      ),
    ).toBeInTheDocument();
  });
});
