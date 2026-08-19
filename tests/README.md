# Testes

Tres familias, fronteiras deliberadas. Nao misturar.

| Familia | Onde                                       | O que prova                                  | Quando       |
| ------- | ------------------------------------------ | -------------------------------------------- | ------------ |
| `unit`  | `src/domain`, `src/application`, `src/lib` | regra pura, sem rede e sem DOM               | com o codigo |
| `ui`    | `src/components`                           | componente em jsdom                          | com o codigo |
| `rls`   | `tests/rls`                                | isolamento cross-tenant em **Postgres real** | I2 em diante |
| `e2e`   | `tests/e2e`                                | fluxo na superficie (web viewport / Pixel 7) | com UI       |
| `a11y`  | `tests/a11y`                               | axe-core; serious/critical quebra o build    | com UI       |

O placeholder em `tests/rls` existe so para o pipeline nao falhar antes de I2.
Ele nao substitui o gate de isolamento de tenant.

Factories e fixtures nascem em I2, junto com a primeira tabela. MSW nao entra:
API de dominio e Route Handler interno, nao contrato publico no MVP.
