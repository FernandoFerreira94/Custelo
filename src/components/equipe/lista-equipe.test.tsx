import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ListaEquipe } from "@/components/equipe/lista-equipe";
import type { MembroEquipe } from "@/infrastructure/auth/equipe-repo";

const membros: MembroEquipe[] = [
  {
    usuarioId: "1",
    nome: "Carlos Reis",
    email: "carlos.porteiro@vilaverde.com.br",
    papel: "recepcionista",
    status: "ativo",
  },
  {
    usuarioId: "2",
    nome: "Rita Campos",
    email: "rita.c@gmail.com",
    papel: "recepcionista",
    status: "convite_pendente",
  },
];

describe("ListaEquipe", () => {
  it("mostra nome, papel em português e situação", () => {
    render(<ListaEquipe membros={membros} />);

    expect(screen.getByText("Carlos Reis")).toBeInTheDocument();
    expect(screen.getAllByText("Porteiro")).toHaveLength(2);
    expect(screen.getByText("Convite pendente")).toBeInTheDocument();
  });

  it("nunca mostra o e-mail inteiro na lista", () => {
    render(<ListaEquipe membros={membros} />);

    expect(screen.getByText("c***@vilaverde.com.br")).toBeInTheDocument();
    expect(screen.queryByText(/carlos\.porteiro/)).not.toBeInTheDocument();
  });
});
