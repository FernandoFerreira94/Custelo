# Scope — Custelo

Carregar sob demanda (`scope`), nao no boot inteiro.
Fonte de negocio: Notion _Contexto Inicial Validado — 13/08/2026_ + o que o
**repo** ja consolidou depois. A pagina-mae do projeto no Notion (19/08) ainda
cita React Native/Expo e apps separados — isso foi **superseded** (ADR-001,
ADR-012). Nao reabrir.

## Product

SaaS B2B multi-tenant de recebimento e cadeia de custodia para portarias e
operacoes prediais. Substitui caderno/planilha: registro rapido, custodia
auditavel, notificacao na janela, correcao sem apagar historico, retirada e
devolucao comprovadas.

O diferencial defensavel e a **evidencia**. Se um evento pode ser apagado ou
reescrito, o produto perde a razao de existir.

## Users

| Ator                         | Objetivo                                      |
| ---------------------------- | --------------------------------------------- |
| Recepcionista / Porteiro     | registrar rapido no pico e entregar sem erro  |
| Gestor do Empreendimento     | reduzir reclamacao e ter prova do que ocorreu |
| Administrador da Organizacao | padronizar operacao em varios empreendimentos |
| Morador / Destinatario       | ser avisado e retirar sem atrito (sem login)  |
| Auditor / Consulta           | verificar historico e evidencias              |
| Super Admin (Webcodeff)      | operar a plataforma                           |

O morador **nao tem login no MVP**. Interage por WhatsApp e retirada presencial.

## Modules

Hierarquia e regra fina: `.ai/modules/<nome>.md`.

`tenancy` · `auth-rbac` · `estrutura-fisica` · `pessoas-vinculos` ·
`recebimento` · `ocr-matching` · `custodia-eventos` · `correcoes` · `whatsapp` ·
`offline-sync` · `retirada` · `devolucao` · `auditoria` · `importacao` ·
`billing-entitlements` · `retencao-lgpd` · `observabilidade` · `ui-ops-pwa` ·
`relatorios`

`tenancy`, `auth-rbac` e `custodia-eventos` sao pre-requisito de qualquer outro.

## Critical business rules

As 12 invariantes em `AGENTS.md` / `docs/product/invariantes.md` sao stop-ship.
Alem delas:

- Unidade e o destino operacional primario; nome da pessoa e sinal secundario.
- Foto da etiqueta permanece privada e nao vai por WhatsApp no MVP.
- WhatsApp: Cloud API oficial, texto minimo necessario.
- Retirada exige nome do retirante + assinatura + operador + data/hora + lista.
- Custodia fisica e do cliente; o SaaS registra, processa e prova.
- Motor de retencao nasce parametrizavel; prazo inventado nao vai a producao.

## Integrations

| Porta               | Autoridade no MVP              |
| ------------------- | ------------------------------ |
| `LabelExtractor`    | OCR de texto (fornecedor OPEN) |
| `MessagingProvider` | WhatsApp Cloud API direta      |
| `EvidenceStorage`   | Supabase Storage privado       |
| `JobScheduler`      | Inngest                        |
| `Clock`             | relogio injetavel              |

Billing previsto: Asaas. E-mail transacional previsto: Resend. Analytics:
PostHog sem PII. Erros: Sentry.

## Explicit non-goals

Nao e ERP condominial. Nao e transportadora. Nao e app obrigatorio do morador.
Nao e apenas OCR + WhatsApp. Nao assume custodia fisica. Nao promete eliminar
extravios. Nao ha realtime no MVP. Nao ha Redis/cache distribuido no MVP.

## KPIs / failure

Tempo por registro · % identificado sem digitacao · % notificado na 1a tentativa
· tempo ate retirada · volume de correcoes pos-notificacao.

Fracasso: porteiro volta ao caderno · matching erra unidade com frequencia ·
custo de WhatsApp come a margem · ticket residencial nao paga o CAC.

Volume de referencia (HIPOTESE, shopping): ~30/dia, pico ~50. Nao e fato.

## Open legal (nao inventar)

Controlador x operador · prazos de retencao · DPA/subprocessadores ·
transferencia internacional (OCR, storage, PostHog, Meta).
