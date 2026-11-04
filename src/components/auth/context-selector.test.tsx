import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { selectContextAction } from "@/app/(auth)/contexto/actions";
import type { UserScope } from "@/application/auth/user-scope";
import { ContextSelector } from "@/components/auth/context-selector";

vi.mock("@/app/(auth)/contexto/actions", () => ({
  selectContextAction: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string | { src: string } }) => (
    // eslint-disable-next-line @next/next/no-img-element -- mock do next/image no jsdom
    <img alt={alt} src={typeof src === "string" ? src : src.src} />
  ),
}));

const scopes: UserScope[] = [
  {
    orgId: "org-1",
    orgNome: "Vila Verde",
    empreendimentoId: "emp-1",
    empreendimentoNome: "Portaria principal",
    isOrgScope: false,
    papelCodigo: "recepcionista",
    papelNome: "Porteiro",
  },
  {
    orgId: "org-1",
    orgNome: "Vila Verde",
    empreendimentoId: "emp-2",
    empreendimentoNome: "Portaria da garagem",
    isOrgScope: false,
    papelCodigo: "recepcionista",
    papelNome: "Porteiro",
  },
];

const assign = vi.fn();

beforeEach(() => {
  vi.mocked(selectContextAction).mockReset();
  assign.mockReset();
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { ...window.location, assign },
  });
});

describe("ContextSelector", () => {
  it("lista cada escopo com o papel e não escolhe nenhum sozinho", () => {
    render(<ContextSelector scopes={scopes} />);

    expect(
      screen.getByRole("radiogroup", { name: "Empreendimento" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(screen.getAllByText("Porteiro")).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: "Escolha um empreendimento" }),
    ).toBeDisabled();
  });

  it("escolhido o empreendimento, o botão diz onde a pessoa vai começar", () => {
    render(<ContextSelector scopes={scopes} />);

    fireEvent.click(screen.getByRole("radio", { name: /Portaria da garagem/ }));

    expect(
      screen.getByRole("button", {
        name: "Começar em Vila Verde · Portaria da garagem",
      }),
    ).toBeEnabled();
  });

  it("envia só os ids do escopo escolhido e segue para a rota do papel", async () => {
    vi.mocked(selectContextAction).mockResolvedValue({
      ok: true,
      redirectTo: "/receber",
    });
    render(<ContextSelector scopes={scopes} />);

    fireEvent.click(screen.getByRole("radio", { name: /Portaria da garagem/ }));
    fireEvent.click(screen.getByRole("button", { name: /Começar/ }));

    await waitFor(() => expect(assign).toHaveBeenCalledWith("/receber"));
    expect(selectContextAction).toHaveBeenCalledWith({
      orgId: "org-1",
      empreendimentoId: "emp-2",
    });
  });

  it("mostra o erro do servidor e deixa tentar de novo", async () => {
    vi.mocked(selectContextAction).mockResolvedValue({
      ok: false,
      code: "INVALID_SCOPE",
    });
    render(<ContextSelector scopes={scopes} />);

    fireEvent.click(screen.getByRole("radio", { name: /Portaria principal/ }));
    fireEvent.click(screen.getByRole("button", { name: /Começar/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Seu acesso a este empreendimento mudou",
    );
    expect(assign).not.toHaveBeenCalled();
    // A transição ainda pode estar pendente quando o alerta aparece.
    expect(
      await screen.findByRole("button", { name: /Começar/ }),
    ).toBeEnabled();
  });

  it("mostra o aviso vindo da entrada automática", () => {
    render(
      <ContextSelector
        scopes={scopes}
        initialError="Não conseguimos abrir o empreendimento sozinhos."
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não conseguimos abrir o empreendimento sozinhos.",
    );
  });
});
