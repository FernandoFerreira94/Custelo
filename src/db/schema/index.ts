/**
 * Ponto de entrada do schema Drizzle.
 *
 * VAZIO POR DECISAO. As tabelas de dominio nascem na fase I2 do Implementation
 * Roadmap — depois da RLS, nunca antes:
 *
 *   "I2 antes de qualquer coisa com dado. Escrever tabela de dominio antes da
 *    RLS estar de pe significa retrofit de seguranca — o pior tipo de divida
 *    neste produto."
 *
 * Invariantes que qualquer tabela criada aqui tera de respeitar (ADR-004/007):
 *   - toda tabela de dominio carrega `org_id` e `empreendimento_id`;
 *   - RLS habilitada, sem excecao;
 *   - indices lideram por `empreendimento_id`;
 *   - `custody_events` e append-only: UPDATE e DELETE revogados no Postgres
 *     para o role da aplicacao.
 */

export {};
