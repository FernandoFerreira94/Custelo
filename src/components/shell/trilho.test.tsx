import { render, screen } from "@testing-library/react";
import { HomeIcon, SettingsIcon } from "lucide-react";
import { describe, expect, it } from "vitest";

import { Trilho } from "@/components/shell/trilho";

const itens = [
  { label: "Hoje", href: "/gestao", icon: <HomeIcon aria-hidden /> },
  {
    label: "Configurações",
    href: "/gestao/config",
    icon: <SettingsIcon aria-hidden />,
    desabilitado: true,
  },
];

describe("Trilho", () => {
  it("marca o item ativo com aria-current", () => {
    render(<Trilho itens={itens} ativo="Hoje" />);
    expect(screen.getByRole("link", { name: "Hoje" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("item desabilitado não vira link", () => {
    render(<Trilho itens={itens} ativo="Hoje" />);
    expect(
      screen.queryByRole("link", { name: "Configurações" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Configurações" }),
    ).toBeDisabled();
  });
});
