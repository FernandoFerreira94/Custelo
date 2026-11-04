import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ContextoAtivoView,
  rotuloPapel,
} from "@/components/shell/contexto-ativo";

describe("rotuloPapel", () => {
  it("traduz o código do papel", () => {
    expect(rotuloPapel("recepcionista")).toBe("Recepcionista");
    expect(rotuloPapel("empreendimento_gestor")).toBe(
      "Gestor do empreendimento",
    );
  });

  it("não inventa rótulo para papel desconhecido ou ausente", () => {
    expect(rotuloPapel("papel_novo")).toBeNull();
    expect(rotuloPapel(undefined)).toBeNull();
  });
});

describe("ContextoAtivoView", () => {
  it("mostra só o papel quando o claim não traz o nome do empreendimento", () => {
    render(<ContextoAtivoView papel="Gestor do empreendimento" />);
    expect(screen.getByText("Gestor do empreendimento")).toBeInTheDocument();
  });

  it("mostra nome e papel quando há nome", () => {
    render(
      <ContextoAtivoView
        empreendimento="Residencial Vila Verde"
        papel="Recepcionista"
      />,
    );
    expect(screen.getByText(/Residencial Vila Verde/)).toBeInTheDocument();
    expect(screen.getByText(/Recepcionista/)).toBeInTheDocument();
  });

  it("não renderiza nada sem papel nem nome", () => {
    const { container } = render(<ContextoAtivoView />);
    expect(container).toBeEmptyDOMElement();
  });
});
