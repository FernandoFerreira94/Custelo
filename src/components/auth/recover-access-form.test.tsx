import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RecoverAccessForm } from "@/components/auth/recover-access-form";

const { requestRecovery } = vi.hoisted(() => ({
  requestRecovery: vi.fn(),
}));

vi.mock("@/components/auth/request-recovery", () => ({
  RECOVERY_ACCEPTED:
    "Se existir uma conta com esse e-mail, o link será enviado. Por segurança, não confirmamos quais e-mails estão cadastrados.",
  requestRecovery,
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string | { src: string } }) => (
    // eslint-disable-next-line @next/next/no-img-element -- mock do next/image no jsdom
    <img alt={alt} src={typeof src === "string" ? src : src.src} />
  ),
}));

describe("RecoverAccessForm", () => {
  it("pede o e-mail quando o envio esta vazio", async () => {
    render(<RecoverAccessForm onBack={vi.fn()} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Enviar link de recuperação" }),
    );

    expect(await screen.findByText("Informe o e-mail.")).toBeInTheDocument();
  });

  it("mostra mensagem de sucesso sem revelar se o e-mail existe", async () => {
    requestRecovery.mockResolvedValue({
      ok: true,
      message:
        "Se existir uma conta com esse e-mail, o link será enviado. Por segurança, não confirmamos quais e-mails estão cadastrados.",
    });

    render(<RecoverAccessForm onBack={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "condominio@condominio.com.br" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Enviar link de recuperação" }),
    );

    expect(await screen.findByRole("heading", { name: "Link enviado" }));
    expect(
      screen.getByText(
        "Se existir uma conta com esse e-mail, o link será enviado. Por segurança, não confirmamos quais e-mails estão cadastrados.",
      ),
    ).toBeInTheDocument();
  });

  it("mostra erro retornado pela acao de recuperacao", async () => {
    requestRecovery.mockResolvedValue({
      ok: false,
      message:
        "Não foi possível enviar o link agora. Tente novamente em instantes.",
    });

    render(<RecoverAccessForm onBack={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "condominio@condominio.com.br" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Enviar link de recuperação" }),
    );

    expect(
      await screen.findByText(
        "Não foi possível enviar o link agora. Tente novamente em instantes.",
      ),
    ).toBeInTheDocument();
  });

  it("volta para o login", () => {
    const onBack = vi.fn();
    render(<RecoverAccessForm onBack={onBack} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Voltar para o login" }),
    );
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
