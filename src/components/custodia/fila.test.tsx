import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/fila",
}));

import { EstadoBadge } from "@/components/custodia/estado-badge";
import {
  FilaPortaria,
  type RespostaFila,
} from "@/components/custodia/fila-portaria";
import { ListaDeEncomendas } from "@/components/custodia/lista-de-encomendas";

const CONTA = { todas: 3, prontas: 1, falha: 1, prazo: 0, naoIdent: 1 };
const resposta = (extra: Partial<RespostaFila> = {}): RespostaFila => ({
  proximo: null,
  contadores: CONTA,
  itens: [
    {
      chave: "u1",
      unidadeCodigo: "B-304",
      destinatario: "Ana Souza",
      encomendas: 2,
      volumes: 3,
      localMaisAntiga: "C2",
      idMaisAntiga: "e-1",
      ocorridoEmMaisAntiga: new Date(Date.now() - 2 * 3_600_000).toISOString(),
      badge: "falha",
    },
    {
      chave: "e-9",
      unidadeCodigo: null,
      destinatario: null,
      encomendas: 1,
      volumes: 1,
      localMaisAntiga: null,
      idMaisAntiga: "e-9",
      ocorridoEmMaisAntiga: new Date().toISOString(),
      badge: "naoIdent",
    },
  ],
  ...extra,
});

function mockFetch(...respostas: unknown[]) {
  const fila = [...respostas];
  const f = vi.fn(async () => {
    const r = fila.length > 1 ? fila.shift() : fila[0];
    if (r instanceof Error) throw r;
    return { json: async () => r } as Response;
  });
  vi.stubGlobal("fetch", f);
  return f;
}

function renderizar() {
  const cliente = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={cliente}>
      <FilaPortaria />
    </QueryClientProvider>,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("FilaPortaria", () => {
  it("mostra os contadores e uma linha por unidade, que abre a mais antiga", async () => {
    mockFetch({ ok: true, data: resposta() });
    renderizar();

    expect(await screen.findByText("B-304")).toBeInTheDocument();
    expect(screen.getByText("3 em custódia")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Falha no aviso.*1/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("Ana Souza · 3 volumes")).toBeInTheDocument();
    expect(screen.getByText("C2 · há 2 h · 2 encomendas")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /B-304/ })).toHaveAttribute(
      "href",
      "/encomendas/e-1",
    );
    expect(
      screen.getByText("Sem destino identificado · 1 volume"),
    ).toBeInTheDocument();
  });

  it("busca sem resultado diz o que fazer e limpa", async () => {
    const f = mockFetch(
      { ok: true, data: resposta() },
      { ok: true, data: resposta({ itens: [] }) },
    );
    renderizar();
    await screen.findByText("B-304");
    fireEvent.change(
      screen.getByRole("searchbox", { name: "Buscar encomenda" }),
      {
        target: { value: "B-90" },
      },
    );

    expect(
      await screen.findByText('Nenhuma encomenda com "B-90".'),
    ).toBeInTheDocument();
    expect(f).toHaveBeenLastCalledWith(
      "/api/ops/fila?busca=B-90",
      expect.anything(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Limpar" }));
    await waitFor(() =>
      expect(
        screen.getByRole("searchbox", { name: "Buscar encomenda" }),
      ).toHaveValue(""),
    );
  });

  it("primeiro uso sem nada na portaria", async () => {
    mockFetch({
      ok: true,
      data: resposta({ itens: [], contadores: { ...CONTA, todas: 0 } }),
    });
    renderizar();
    expect(
      await screen.findByText("Nenhuma encomenda na portaria agora."),
    ).toBeInTheDocument();
  });

  it("falha de rede mostra o alerta e tenta de novo", async () => {
    const f = mockFetch(new Error("offline"), { ok: true, data: resposta() });
    renderizar();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não deu para carregar a fila",
    );
    fireEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));
    expect(await screen.findByText("B-304")).toBeInTheDocument();
    expect(f).toHaveBeenCalledTimes(2);
  });
});

describe("EstadoBadge e lista da gestão", () => {
  it("cancelada tem rótulo e ícone (estado nunca só por cor)", () => {
    const { container } = render(<EstadoBadge estado="cancelada" />);
    expect(screen.getByText("Cancelada")).toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("linha da tabela leva ao detalhe", () => {
    render(
      <ListaDeEncomendas
        itens={[
          {
            id: "e-1",
            codigoCurto: "7F3A",
            estado: "NOTIFICADA",
            badge: "pronta",
            unidadeCodigo: "B-304",
            destinatario: "Ana Souza",
            local: "C2",
            ocorridoEm: new Date("2026-11-03T17:32:00Z"),
            recebidoPor: "Carlos",
          },
        ]}
      />,
    );
    const links = screen.getAllByRole("link", { name: /B-304/ });
    expect(links[0]).toHaveAttribute("href", "/gestao/encomendas/e-1");
    expect(screen.getAllByText(/03\/11 às 14:32/).length).toBeGreaterThan(0);
  });
});
