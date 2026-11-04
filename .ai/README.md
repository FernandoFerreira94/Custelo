# `.ai/` — contexto canonico do Custelo

Cache de implementacao. O Boot Protocol (Notion, ago/2026) manda carregar **so
o arquivo da tarefa**. Nao leia esta pasta inteira.

| Arquivo           | Quando                                            |
| ----------------- | ------------------------------------------------- |
| `scope.md`        | produto, atores, nao-objetivos                    |
| `architecture.md` | ADR / Freeze / topologia                          |
| `roadmap.md`      | fatia atual de entrega                            |
| `page-map.md`     | tela, rota, estados, navegacao                    |
| `memory.md`       | Summary no boot; log so de decisao duradoura      |
| `gotchas.md`      | erro que ja apareceu duas vezes                   |
| `rules/`          | desvio/constraint de stack deste produto          |
| `modules/`        | regra de negocio do bounded context               |
| `specs/`          | so feature complexa/arriscada (criar sob demanda) |

UI visual: `DESIGN.md` na raiz (cache do Penpot + `globals.css`).
Adaptadores de cliente: `.claude/` e `.cursor/` — nao sao fonte de produto.

Detalhe estendido continua em `docs/`. Se `.ai/` e `docs/` divergirem no
resumo, atualize o cache; a decisao LOCKED vive no ADR.
