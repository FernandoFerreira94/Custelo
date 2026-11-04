import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/components/auth/login-form";
import {
  AUTH_UNAVAILABLE,
  requestSession,
} from "@/components/auth/request-session";

vi.mock("@/components/auth/request-session", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/components/auth/request-session")>();
  return {
    ...actual,
    requestSession: vi.fn(),
  };
});

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string | { src: string } }) => (
    // eslint-disable-next-line @next/next/no-img-element -- mock do next/image no jsdom
    <img alt={alt} src={typeof src === "string" ? src : src.src} />
  ),
}));

describe("LoginForm", () => {
  it("nao preenche credenciais de desenvolvimento", () => {
    render(<LoginForm onInvite={vi.fn()} onRecover={vi.fn()} />);

    expect(screen.getByLabelText("E-mail")).toHaveValue("");
    expect(screen.getByLabelText("Senha")).toHaveValue("");
  });

  it("explica quando o link de autenticacao e invalido", () => {
    render(
      <LoginForm
        onInvite={vi.fn()}
        onRecover={vi.fn()}
        initialError="Link inválido ou expirado. Solicite um novo link."
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Link inválido ou expirado. Solicite um novo link.",
    );
  });

  it("mostra erros de validacao quando o envio esta vazio", async () => {
    render(<LoginForm onInvite={vi.fn()} onRecover={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Informe o e-mail.")).toBeInTheDocument();
    expect(screen.getByText("Informe a senha.")).toBeInTheDocument();
  });

  it("mostra erro quando o e-mail e invalido", async () => {
    render(<LoginForm onInvite={vi.fn()} onRecover={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "nao-e-email" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "uma-senha" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(
      await screen.findByText("Informe um e-mail válido."),
    ).toBeInTheDocument();
  });

  it("alterna visibilidade da senha e abre recuperar acesso", async () => {
    const onRecover = vi.fn();
    render(<LoginForm onInvite={vi.fn()} onRecover={onRecover} />);

    const password = screen.getByLabelText("Senha");
    expect(password).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(password).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(password).toHaveAttribute("type", "password");

    fireEvent.click(
      screen.getByRole("button", { name: "Esqueci minha senha" }),
    );
    expect(onRecover).toHaveBeenCalledTimes(1);
  });

  it("abre aceitar convite", () => {
    const onInvite = vi.fn();
    render(<LoginForm onInvite={onInvite} onRecover={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Aceitar convite" }));
    expect(onInvite).toHaveBeenCalledTimes(1);
  });

  it("informa quando a sessao ainda nao existe", async () => {
    vi.mocked(requestSession).mockResolvedValue({
      ok: false,
      message: AUTH_UNAVAILABLE,
    });

    render(<LoginForm onInvite={vi.fn()} onRecover={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "carla.souza@vilaverde.com.br" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "uma-senha" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      AUTH_UNAVAILABLE,
    );
  });
});
