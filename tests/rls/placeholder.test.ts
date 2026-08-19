import { describe, it } from "vitest";

/**
 * Gate de isolamento de tenant (ADR-004 / Implementation Roadmap I2).
 *
 * Ate existir tabela de dominio com RLS, nao ha o que provar. Este arquivo
 * segura o job `tenant-isolation` do CI. A primeira tabela real substitui
 * o todo por testes negativos contra Postgres — nunca mock.
 */
describe("isolamento de tenant", () => {
  it.todo(
    "rejeita leitura e escrita cross-tenant em toda tabela de dominio — nasce em I2",
  );
});
