import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RecoverAccessForm } from "@/components/auth/recover-access-form";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string | { src: string } }) => (
    // eslint-disable-next-line @next/next/no-img-element -- mock do next/image no jsdom
    <img alt={alt} src={typeof src === "string" ? src : src.src} />
  ),
}));

describe("RecoverAccessForm", () => {
  it("pede o e-mail quando o envio esta vazio", async () => {
    const onSent = vi.fn();
    render(<RecoverAccessForm onBack={vi.fn()} onSent={onSent} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Enviar link de recuperação" }),
    );

    expect(await screen.findByText("Informe o e-mail.")).toBeInTheDocument();
    expect(onSent).not.toHaveBeenCalled();
  });

  it("avanca apos envio sem revelar se o e-mail existe", async () => {
    const onSent = vi.fn();
    render(<RecoverAccessForm onBack={vi.fn()} onSent={onSent} />);
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "condominio@condominio.com.br" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Enviar link de recuperação" }),
    );

    await vi.waitFor(() => expect(onSent).toHaveBeenCalledTimes(1));
  });

  it("volta para o login", () => {
    const onBack = vi.fn();
    render(<RecoverAccessForm onBack={onBack} onSent={vi.fn()} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Voltar para o login" }),
    );
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
