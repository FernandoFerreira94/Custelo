import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AcceptInviteForm } from "@/components/auth/accept-invite-form";
import { PREVIEW_INVITE } from "@/components/auth/request-accept-invite";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string | { src: string } }) => (
    // eslint-disable-next-line @next/next/no-img-element -- mock do next/image no jsdom
    <img alt={alt} src={typeof src === "string" ? src : src.src} />
  ),
}));

describe("AcceptInviteForm", () => {
  it("pede nome e senha quando o envio esta vazio", async () => {
    render(<AcceptInviteForm onBack={vi.fn()} onActivated={vi.fn()} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Criar acesso e entrar" }),
    );

    expect(
      await screen.findByText("Informe o nome completo."),
    ).toBeInTheDocument();
    expect(screen.getByText("Informe a senha.")).toBeInTheDocument();
  });

  it("mostra papel e empreendimentos do convite", () => {
    render(<AcceptInviteForm onBack={vi.fn()} onActivated={vi.fn()} />);
    expect(screen.getByText(PREVIEW_INVITE.role)).toBeInTheDocument();
    expect(
      screen.getByText(`Empreendimentos: ${PREVIEW_INVITE.properties}`),
    ).toBeInTheDocument();
  });

  it("volta para o login", () => {
    const onBack = vi.fn();
    render(<AcceptInviteForm onBack={onBack} onActivated={vi.fn()} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Voltar para o login" }),
    );
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
