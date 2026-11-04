import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AcceptInviteForm } from "@/components/auth/accept-invite-form";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string | { src: string } }) => (
    // eslint-disable-next-line @next/next/no-img-element -- mock do next/image no jsdom
    <img alt={alt} src={typeof src === "string" ? src : src.src} />
  ),
}));

const { fetchPendingInvite, requestAcceptInvite } = vi.hoisted(() => ({
  fetchPendingInvite: vi.fn(),
  requestAcceptInvite: vi.fn(),
}));

vi.mock("@/components/auth/request-accept-invite", () => ({
  fetchPendingInvite,
  requestAcceptInvite,
}));

describe("AcceptInviteForm", () => {
  it("pede nome e senha quando o envio esta vazio", async () => {
    fetchPendingInvite.mockResolvedValue({
      inviter: "Admin Colinas",
      role: "Porteiro",
      properties: "Vila Verde",
    });

    render(<AcceptInviteForm onBack={vi.fn()} onActivated={vi.fn()} />);
    await screen.findByText("Porteiro");

    fireEvent.click(
      screen.getByRole("button", { name: "Criar acesso e entrar" }),
    );

    expect(
      await screen.findByText("Informe o nome completo."),
    ).toBeInTheDocument();
    expect(screen.getByText("Informe a senha.")).toBeInTheDocument();
  });

  it("mostra papel e empreendimentos do convite inicial", () => {
    render(
      <AcceptInviteForm
        onBack={vi.fn()}
        onActivated={vi.fn()}
        initialInvite={{
          inviter: "Admin Colinas",
          role: "Porteiro",
          properties: "Vila Verde",
        }}
      />,
    );
    expect(screen.getByText("Porteiro")).toBeInTheDocument();
    expect(screen.getByText("Empreendimentos: Vila Verde")).toBeInTheDocument();
  });

  it("mostra erro quando nao ha convite pendente", async () => {
    fetchPendingInvite.mockResolvedValue(null);

    render(<AcceptInviteForm onBack={vi.fn()} onActivated={vi.fn()} />);

    expect(
      await screen.findByText(
        "Convite não encontrado ou expirado. Abra novamente o link do convite.",
      ),
    ).toBeInTheDocument();
  });

  it("redireciona apos aceitar convite com sucesso", async () => {
    fetchPendingInvite.mockResolvedValue({
      inviter: "Admin Colinas",
      role: "Porteiro",
      properties: "Vila Verde",
    });
    requestAcceptInvite.mockResolvedValue({
      ok: true,
      redirectTo: "/contexto",
    });

    const onActivated = vi.fn();
    render(<AcceptInviteForm onBack={vi.fn()} onActivated={onActivated} />);
    await screen.findByText("Porteiro");

    fireEvent.change(screen.getByLabelText("Nome completo"), {
      target: { value: "Carla Souza" },
    });
    fireEvent.change(screen.getByLabelText("Criar senha"), {
      target: { value: "1234567890" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Criar acesso e entrar" }),
    );

    await vi.waitFor(() =>
      expect(onActivated).toHaveBeenCalledWith("/contexto"),
    );
  });

  it("mostra erro retornado pela acao de aceitar convite", async () => {
    fetchPendingInvite.mockResolvedValue({
      inviter: "Admin Colinas",
      role: "Porteiro",
      properties: "Vila Verde",
    });
    requestAcceptInvite.mockResolvedValue({
      ok: false,
      message: "Convite inválido ou já utilizado.",
    });

    render(<AcceptInviteForm onBack={vi.fn()} onActivated={vi.fn()} />);
    await screen.findByText("Porteiro");

    fireEvent.change(screen.getByLabelText("Nome completo"), {
      target: { value: "Carla Souza" },
    });
    fireEvent.change(screen.getByLabelText("Criar senha"), {
      target: { value: "1234567890" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Criar acesso e entrar" }),
    );

    expect(
      await screen.findByText("Convite inválido ou já utilizado."),
    ).toBeInTheDocument();
  });

  it("volta para o login", async () => {
    fetchPendingInvite.mockResolvedValue({
      inviter: "Admin Colinas",
      role: "Porteiro",
      properties: "Vila Verde",
    });

    const onBack = vi.fn();
    render(<AcceptInviteForm onBack={onBack} onActivated={vi.fn()} />);
    await screen.findByText("Porteiro");

    fireEvent.click(
      screen.getByRole("button", { name: "Voltar para o login" }),
    );
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
