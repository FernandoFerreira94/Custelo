import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

import {
  DetalheEncomenda,
  type DetalheDto,
  type ItemLinhaDto,
} from "@/components/custodia/detalhe-encomenda";
import { MoverSheet } from "@/components/custodia/mover-sheet";
import { MSG_CUSTODIA } from "@/lib/mensagens";

const AGORA = new Date("2026-11-18T15:00:00Z");
const d = (extra: Partial<DetalheDto> = {}): DetalheDto => ({
  id: "e-1",
  codigoCurto: "7F3A",
  estado: "NOTIFICADA",
  badge: "pronta",
  ocorridoEm: "2026-11-18T13:00:00Z",
  volumes: 1,
  transportadora: "Mercado Livre",
  unidade: { id: "u1", codigo: "B-304" },
  destinatario: "Mariana Souza",
  local: { id: "c2", codigo: "C2" },
  ponto: { id: "p1", nome: "Portaria principal" },
  outrasAtivas: [{ id: "e-2", codigoCurto: "9K2B", badge: "recebida" }],
  ...extra,
});
const linha: ItemLinhaDto[] = [
  {
    id: "ev-3",
    tipo: "LOCALIZACAO_ALTERADA",
    titulo: "Guardada na C2",
    descricao: "Carlos · Portaria principal",
    ocorridoEm: "2026-11-18T14:44:00Z",
    corrigido: false,
  },
  {
    id: "ev-1",
    tipo: "RECEBIMENTO_REGISTRADO",
    titulo: "Recebida com foto da etiqueta",
    descricao: "Sugestão lida: B-304 · confirmada por Carlos",
    ocorridoEm: "2026-11-18T14:42:00Z",
    corrigido: true,
  },
];

describe("DetalheEncomenda", () => {
  it("card, linha do tempo com o mais novo atual e as outras da unidade", () => {
    render(
      <DetalheEncomenda
        d={d()}
        linha={linha}
        agora={AGORA}
        hrefDe={(id) => `/encomendas/${id}`}
        acoes={<button type="button">Mover</button>}
      />,
    );
    expect(screen.getByText("Mariana Souza")).toBeInTheDocument();
    expect(
      screen.getByText("Mercado Livre · 1 volume · há 2 h"),
    ).toBeInTheDocument();
    expect(screen.getByText("Pronta p/ retirada")).toBeInTheDocument();
    expect(screen.getByText("11:44")).toBeInTheDocument();
    expect(screen.getByText("Corrigido")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /PZ-9K2B/ })).toHaveAttribute(
      "href",
      "/encomendas/e-2",
    );
    expect(screen.getByRole("button", { name: "Mover" })).toBeInTheDocument();
  });

  it("terminal é só leitura com o aviso neutro", () => {
    render(
      <DetalheEncomenda
        d={d({ estado: "RETIRADA", badge: "retirada" })}
        linha={[{ ...linha[0]!, ocorridoEm: "2026-11-03T17:32:00Z" }]}
        agora={AGORA}
        hrefDe={(id) => id}
        acoes={<button type="button">Mover</button>}
      />,
    );
    expect(
      screen.getByText(
        "Entregue em 03/11 às 14:32. Encomenda entregue não volta para a fila.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Mover" }),
    ).not.toBeInTheDocument();
  });
});

describe("MoverSheet", () => {
  const locais = [
    { id: "c2", codigo: "C2", usado: 11, capacidade: 24 },
    { id: "vg", codigo: "VG", usado: 5, capacidade: 8 },
  ];

  it("local atual desabilitado, botão segue a escolha e envia de/para com o motivo", async () => {
    const mover = vi.fn(async () => ({
      ok: true as const,
      data: null,
      mensagem: MSG_CUSTODIA.movida("C2", "VG"),
    }));
    const aoMover = vi.fn();
    render(
      <MoverSheet
        lado="bottom"
        localAtual={{ id: "c2", codigo: "C2" }}
        locais={locais}
        operador="você"
        mover={mover}
        aoMover={aoMover}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Mover" }));
    expect(screen.getByText(/Está na C2\./)).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /C2/ })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Escolha o novo local" }),
    ).toBeDisabled();

    fireEvent.click(screen.getByRole("radio", { name: /VG/ }));
    fireEvent.click(screen.getByRole("radio", { name: "Prateleira cheia" }));
    fireEvent.click(screen.getByRole("button", { name: "Mover para VG" }));

    await waitFor(() => expect(aoMover).toHaveBeenCalled());
    expect(mover).toHaveBeenCalledWith({
      eventoId: expect.any(String),
      paraLocalId: "vg",
      motivoRapido: "Prateleira cheia",
    });
    expect(toast.success).toHaveBeenCalledWith(MSG_CUSTODIA.movida("C2", "VG"));
  });

  it("conflito mostra o alerta na folha e pede para recarregar", async () => {
    const aoMover = vi.fn();
    render(
      <MoverSheet
        lado="right"
        localAtual={{ id: "c2", codigo: "C2" }}
        locais={locais}
        operador="você"
        mover={async () => ({
          ok: false as const,
          codigo: "CONFLITO" as const,
          mensagem: MSG_CUSTODIA.foraDeOrdem,
        })}
        aoMover={aoMover}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Mover" }));
    fireEvent.click(screen.getByRole("radio", { name: /VG/ }));
    fireEvent.click(screen.getByRole("button", { name: "Mover para VG" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      MSG_CUSTODIA.foraDeOrdem,
    );
    expect(aoMover).toHaveBeenCalled();
  });
});
