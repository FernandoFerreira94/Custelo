import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MatrizDePapeis } from "@/components/equipe/matriz-de-papeis";

describe("MatrizDePapeis", () => {
  it("mostra só o que cada papel tem e não deixa editar", () => {
    render(
      <MatrizDePapeis
        papeis={[
          { id: "porteiro", label: "Porteiro" },
          { id: "gestor", label: "Gestor" },
        ]}
        grupos={[
          {
            id: "g",
            label: "Gestão",
            permissions: [{ id: "editar", label: "Editar cadastros" }],
          },
        ]}
        concedido={{ porteiro: [], gestor: ["editar"] }}
      />,
    );

    const caixas = screen.getAllByRole("checkbox");
    expect(caixas).toHaveLength(2);
    // Porteiro não edita; gestor edita. Nenhuma caixa aceita clique.
    expect(caixas[0]).not.toBeChecked();
    expect(caixas[1]).toBeChecked();
    for (const c of caixas) expect(c).toBeDisabled();
  });
});
