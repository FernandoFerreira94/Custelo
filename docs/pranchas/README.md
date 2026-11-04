# Pranchas do PacoteZap (referência visual)

As pranchas são as telas aprovadas pelo Fernando, feitas com a WebCode UI.

- **Aqui no repo:** código-fonte e fotos de referência, para que um agente consiga comparar a tela implementada com a prancha sem acesso ao claude.ai.
- **Ao vivo:** https://claude.ai/artifact/62ToCCANhT2uCNvvi4eWoD. Cada aba é um hash, por exemplo `#entrada`.
- **Fonte de trabalho:** `/mnt/project-files/pacotezap/pranchas-src/` (projeto PacoteZap) e o branch `pranchas/pacotezap` do repo `webcode-design`.
- **As pranchas ainda estão sendo construídas.** Quando uma prancha mudar, atualize esta pasta junto: `.tsx` e fotos.

> Esta pasta é só referência: fica fora de typecheck, lint, prettier e build. Nunca importe nada daqui no app.

## Abas e telas

| Aba (artifact) | Fonte | Telas | Fotos |
| --- | --- | --- | --- |
| `#entrada` | `pz-entrada/entrada.tsx` | Splash, AUTH-001 (celular e desktop), AUTH-002/004, AUTH-003, AUTH-006, ajuda | `telas/entrada/` |
| `#portaria` | `pranchas/pranchas.tsx` | AUTH-005, REC-002, REC-003, CUS-001, RET-004 | `telas/portaria/` |
| `#fluxo` | `pz-fluxo/fluxo.tsx` | REC-004/006/008/009/010, CUS-002/003/004/007, RET-001..004 | `telas/fluxo/` |
| `#painel` | `pz-dash/painel.tsx` | DASH-001 (Dash A, trilho + aba de ações), REC-001 (Mob C, barra da portaria) | `telas/painel/` |
| `#cadastros` | `pz-telas/telas.tsx` | UNI-002, PES-001/003, NOT-001/002, DEV-001..003 | `telas/cadastros/` |
| `#estrutura` | `pz-estrutura/estrutura.tsx` | UNI-001, UNI-003/004, PES-002 | `telas/estrutura/` |
| `#gestao` | `pz-gestao/gestao.tsx` | USR-001..003, CFG-002/003/004/008, NOT-003, AUD-001 | `telas/gestao/` |
| `#formularios` | `pz-forms/forms.tsx` | formulários de cadastro (UNI, PES, USR, CFG, SAAS) | `telas/formularios/` |
| `#estados` | `pz-estados/estados.tsx` | avisos (toast/banner), erros 404/403/500, sessão, offline, manutenção, esqueletos, vazios | `telas/estados/` |
| `#importacao` | `pz-escala/escala.tsx` | IMP-001..004, REL-001..005 | `telas/importacao/` |
| `#importar` | `pz-importar/importar.tsx` | IMP-010..015 | `telas/importar/` |
| `#config` | `pz-config/config.tsx` | CFG-001/005/006/007, AUD-002, ORG-001..004 | `telas/config/` |
| `#plataforma` | `pz-plataforma/plataforma.tsx` | SAAS-001..006, BIL-003 | `telas/plataforma/` |
| `#escuro` | `pz-escuro/escuro.tsx` | Modo escuro (Dash A + Mob C), **aguarda revisão do Fernando**: não implementar ainda | — |
| `#laranja` | `pz-laranja/laranja.tsx` | paleta e logos | — |

`telas/index.json` lista cada foto com aba, ID e título. As fotos são de 04/11/2026.

- **Moldura desktop:** 1280 px de conteúdo.
- **Celular:** 390 × 844.

## Atualizar depois que uma prancha mudar

1. Copie as pastas alteradas de `pranchas-src/` para cá, sem `_scripts`.
2. No `webcode-design`, copie as mesmas pastas para `site/app/` e rode `cd site && npm run build:artifact`.
3. Sirva `site/out/pz-todas.html` como `index.html`, com `site/out/_next` em `assets/_next`, em `http://localhost:8790`.
4. Gere as fotos: `node capturar-pranchas.cjs <saida>` e depois `node capturar-pranchas-blocos.cjs <saida>`.
5. Converta para `.webp` (qualidade 82) e substitua `telas/`.
