import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Tres projetos de teste, com fronteiras deliberadas:
 *
 * - `unit`    dominio puro + casos de uso. Sem rede, sem banco, sem DOM.
 * - `ui`      componentes React em jsdom.
 * - `rls`     testes negativos cross-tenant contra Postgres real.
 *             ADR-004 e o Implementation Roadmap (I2) tratam este projeto como
 *             "o gate mais importante do projeto" — ele nao roda em jsdom nem
 *             com banco mockado, por decisao.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: [
            "src/{domain,application,lib,ports,infrastructure}/**/*.test.ts",
          ],
        },
      },
      {
        extends: true,
        test: {
          name: "ui",
          environment: "jsdom",
          setupFiles: ["./src/tests/setup.ts"],
          include: ["src/components/**/*.test.{ts,tsx}"],
        },
      },
      {
        extends: true,
        test: {
          name: "rls",
          environment: "node",
          include: ["tests/rls/**/*.test.ts"],
          // Postgres real, nunca mock. Sem DATABASE_URL o projeto falha alto.
          testTimeout: 30_000,
        },
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/domain/**", "src/application/**"],
    },
  },
});
