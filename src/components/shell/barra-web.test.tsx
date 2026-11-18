import { fireEvent, render, screen } from "@testing-library/react";
import { HomeIcon } from "lucide-react";
import { describe, expect, it } from "vitest";

import { BarraWeb } from "@/components/shell/barra-web";

const item = (label: string, desabilitado = false) => ({
  label,
  href: `/gestao/${label.toLowerCase()}`,
  icon: <HomeIcon aria-hidden />,
  desabilitado,
});
const SETE = [
  "Hoje",
  "Encomendas",
  "Estrutura",
  "Unidades",
  "Pessoas",
  "Equipe",
]
  .map((l) => item(l))
  .concat(item("Configurações", true));

describe("BarraWeb", () => {
  it("com mais de 5 itens mostra 4 e manda o resto para Mais", () => {
    render(<BarraWeb itens={SETE} ativo="Pessoas" />);
    expect(screen.getByRole("link", { name: "Hoje" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Pessoas" })).toBeNull();
    const mais = screen.getByRole("button", { name: "Mais" });
    fireEvent.click(mais);
    expect(screen.getByRole("link", { name: "Pessoas" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.queryByRole("link", { name: "Configurações" })).toBeNull();
  });

  it("até 5 itens cabem todos na barra", () => {
    render(<BarraWeb itens={SETE.slice(0, 5)} ativo="Hoje" />);
    expect(screen.queryByRole("button", { name: "Mais" })).toBeNull();
    expect(screen.getByRole("link", { name: "Hoje" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
