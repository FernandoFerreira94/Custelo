# I3 — Estrutura fisica e pessoas

## Status

Iniciado em 27/08/2026. Migration `0007_i3_estrutura_pessoas.sql` + schema Drizzle.

## Escopo deste recorte

Tabelas de dominio com RLS:

| Tabela               | Modulo           | Notas                                                         |
| -------------------- | ---------------- | ------------------------------------------------------------- |
| `areas`              | estrutura-fisica | Camada generica; arvore via `parent_id`                       |
| `unidades`           | estrutura-fisica | Destino operacional obrigatorio; `codigo` para matching       |
| `pontos_recebimento` | estrutura-fisica | Multiplos pontos por empreendimento                           |
| `pessoas`            | pessoas-vinculos | Escopo empreendimento; LGPD minimo (nome)                     |
| `vinculos`           | pessoas-vinculos | Vigencia `ativo`/`encerrado`; tipo titular/morador/dependente |

Config: `empreendimentos.rotulo_camada_intermediaria` — rotulo da camada generica.

## Fora deste recorte

- Telas UNI/PES (frontend)
- Commands/queries application layer
- Contatos (I7)
- Importacao (I10)

## Invariantes

- Toda tabela: `org_id` + `empreendimento_id` NOT NULL + RLS tenant isolation
- Vinculo encerrado nao recebe notificacao (regra aplicada em I7)
- Nunca cadastrar pessoa automaticamente

## Testes

`tests/rls/i3-estrutura-pessoas.test.ts` — negativo cross-tenant em `unidades`.
