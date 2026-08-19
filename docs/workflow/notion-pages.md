# Paginas Notion — Custelo

Fonte canonica fora do repo. URLs no workspace do Fernando. Esta sessao do
Cursor **nao tem o MCP Notion autenticado** — atualizar a mao ou numa sessao
Claude Code com `claude mcp add --transport http --scope user notion https://mcp.notion.com/mcp`.

Base: `https://www.notion.so/` + slug.

## Projeto Custelo

| Pagina                                         | Slug                                                                                |
| ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| Custelo — SaaS Gestao de Encomendas            | `Custelo-SaaS-Gest-o-de-Encomendas-3bbd66ddfe9381718277df7b5eaf1621`                |
| Architecture Freeze — ADRs e Technology Stack  | `Architecture-Freeze-ADRs-e-Technology-Stack-3bbd66ddfe93819e9513fd1978776fd9`      |
| Brand & UI Foundation                          | `Custelo-Brand-UI-Foundation-13-08-2026-3bbd66ddfe93814ca70cd4e5adf16593`           |
| Core User Flows                                | `Core-User-Flows-3bbd66ddfe9381cebeb3d73cb2a283de`                                  |
| System Surfaces & Module Map                   | `System-Surfaces-Module-Map-Dev-Skills-3bbd66ddfe93810cb02cc9c8750c46db`            |
| Implementation Roadmap                         | `Implementation-Roadmap-3bcd66ddfe9381f59d0ddf11b8e77c3b`                           |
| Roadmap Mestre de Telas & UX/UI                | `Roadmap-Mestre-de-Telas-UX-UI-3bbd66ddfe9381b9b023fc017e247f05`                    |
| Telas — Autenticacao & OPS                     | `Telas-Autentica-o-OPS-PWA-operacional-3bbd66ddfe938146b3a2cc6cc4bd46bc`            |
| Telas — Custodia, Notificacoes, Retirada, Dev. | `Telas-Cust-dia-Notifica-es-Retirada-e-Devolu-o-3bcd66ddfe9381dd93fffb63496b24a4`   |
| Telas — WEB                                    | `Telas-WEB-Gest-o-do-Empreendimento-3bcd66ddfe938172bb8dff891a9ec85c`               |
| Telas — Organizacao & SaaS Admin               | `Telas-Organiza-o-SaaS-Admin-3bcd66ddfe9381f89dbce9154983acf2`                      |
| 22 — UX/UI e Design System                     | `22-UX-UI-e-Design-System-3bbd66ddfe9381298b08c399827b9385`                         |
| 23–25 Performance, Testes e Roadmap            | `23-25-Performance-Testes-e-Roadmap-3bbd66ddfe938188902efa65a8dfb04f`               |
| 26–30 Architecture Freeze, Go-Live             | `26-30-Architecture-Freeze-Go-Live-e-Decision-Log-3bbd66ddfe9381ff9ebcc2e2a9858397` |

## Dev Hub (Boot Protocol)

| Pagina                    | Slug                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------- |
| Dev Hub — Fernando        | `Dev-Hub-Fernando-328d66ddfe9381f1bbecd9a16b170374`                                |
| Boot Protocol Claude Code | `Boot-Protocol-Claude-Code-34dd66ddfe93816aae0fc4e6b03654ed`                       |
| Quality Gates             | `Quality-Gates-DoD-Performance-Security-A11y-Git-37dd66ddfe93811b80d1fc498eda296d` |
| Skills / Plugins          | `Skills-Plugins-Refer-ncia-Global-341d66ddfe9381cb91f7db682e1c6b04`                |

## O que atualizar no Notion (pendente de auth MCP)

1. **Cabecalho do projeto:** G3 e o status "AGUARDANDO ARCHITECTURE FREEZE"
   estao desatualizados. Freeze concluido em 13/08/2026. Status correto:
   `VALIDACAO CONCLUIDA · ARCHITECTURE FREEZE LOCKED · BOOT PROTOCOL APLICADO ·
IMPLEMENTACAO NAO INICIADA (proxima: I1)`.
2. **Tracker:** importar `docs/product/screen-tracker.csv` na pagina
   _Roadmap Mestre de Telas_ (database ou tabela). Nao criar segunda database.
3. **Boot Protocol Status:** apontar para `docs/boot-protocol-status.md` no repo
   em vez de duplicar o checklist.
4. Reutilizar paginas existentes da lista acima. Nao criar "Architecture 2" nem
   "Design System 2".

## Como autenticar o MCP no Cursor

`.cursor/mcp.json` ja declara `https://mcp.notion.com/mcp`. Falta o OAuth desta
sessao: Cursor Settings → MCP → Notion → Connect. Sem isso o agente so le o
que ja esta no repo.
