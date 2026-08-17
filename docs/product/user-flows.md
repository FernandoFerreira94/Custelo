# Fluxos criticos e navegacao

Oito fluxos criticos. Detalhe tela a tela: Notion, _Core User Flows_ e as quatro
subpaginas de telas.

## F1 — Recebimento por foto da etiqueta

Trigger: chegada fisica. Ator: Recepcionista.

```
REC-001 fila/inicio
  → REC-002 captura da etiqueta
    → REC-003 confirmacao de identificacao
        ├─ Sheet/UnitPicker   (REC-004)
        ├─ Sheet/PersonPicker (REC-005)
        └─ Sheet/ManualEntry  (REC-006)
      → REC-007/008 localizacao fisica e conclusao
        → CUS-001 fila de custodia
```

Caminho feliz: fotografar **somente a etiqueta** → OCR extrai o minimo → sistema
identifica unidade/endereco, nome e tracking → **unidade recebe maior peso** →
lista pessoas daquela unidade → operador confirma → registro criado → QR gerado →
custodia iniciada → notificacao automatica ou em fila.

Excecoes que sao caminho normal: OCR ilegivel → fallback manual · pessoa nao
cadastrada → associa a unidade sem criar cadastro · nenhum match →
`NAO_IDENTIFICADA` (CUS-007) · sem internet → registro local (REC-009/010).

## F2 — Notificacao

```
evento de dominio → job (espera ate a janela do empreendimento)
  → consolidacao por unidade → envio → webhook de status
     ├─ sucesso → NOTIFICADA
     └─ falha  → proximo contato → nova tentativa → alerta (NOT-002/003)
```

Fora da janela, o registro aguarda o proximo horario permitido. Envio manual fora
da janela exige permissao elevada (`Sheet/ManualSend`, NOT-004) e permanece
auditavel.

Apos duas tentativas sem sucesso: **nao bloquear a encomenda** e gerar alerta
para confirmar/atualizar o contato.

## F3 — Correcao apos notificacao incorreta

```
CUS-002 detalhe da encomenda
  → Sheet/CriticalFix (CUS-004)   [permissao elevada + motivo obrigatorio]
    → novo evento ASSOCIACAO_CORRIGIDA
    → aviso ao operador de que houve notificacao anterior
    → mensagem neutra de correcao ao contato errado
    → AUD-001 trilha
```

A mensagem neutra **nunca revela** o destinatario correto.

## F4 — Retirada

```
CUS-001 fila  →  RET-001 selecionar encomendas da unidade (1:N)
  → RET-002 quem recebeu
    → RET-003 assinatura (Capture/SignaturePad)
      → RET-004 comprovante (Cards/ReceiptSummary)
        → RET-005/006 historico e correcao de retirada [permissao elevada]
```

Uma assinatura pode cobrir varias encomendas da mesma retirada. Se a pessoa nao
estiver cadastrada e o vinculo for confirmado, o sistema **sugere** cadastro.

## F5 — Devolucao

```
CUS-002 → DEV-001 registrar devolucao
            → Sheet (DEV-002) motivo, transportadora/retirante, evidencia
              → DEV-003 confirmacao
```

Nao remove a encomenda do historico.

## F6 — Recebimento offline

```
REC-002 (sem rede) → registro local  [LOCAL]
  → REC-009 fila local visivel
    → reconexao → [SINCRONIZANDO] → [SINCRONIZADO]
                                  └→ [CONFLITO] → REC-010 resolucao humana
```

OCR, WhatsApp e servicos externos aguardam reconexao. Conflito mostra **os dois
lados** e nunca descarta.

## F7 — Importacao assistida

```
IMP-001 upload → IMP-002 preview e normalizacao
  → IMP-003 inconsistencias e duplicidades → correcao
    → confirmacao humana → IMP-004 relatorio de importacao
```

A IA nunca grava silenciosamente.

## F8 — Offboarding

```
CFG-008 / ORG  → bloquear novos lancamentos na data acordada
  → exportacao estruturada em janela limitada
    → retencao / exclusao / anonimizacao por categoria
      → evidencia do encerramento (AUD-002)
```

## Mapa de navegacao — WEB

```
DASH-001 dashboard
  ├→ CUS-001 fila de custodia → CUS-002 detalhe → CUS-003 timeline
  │                                             → CUS-004 correcao critica
  │                                             → RET-001 retirada
  │                                             → DEV-001 devolucao
  ├→ CUS-007 nao identificadas → CUS-002
  ├→ NOT-001 notificacoes → NOT-002 detalhe/tentativas
  ├→ UNI-001 estrutura → UNI-002 unidades → PES-001 pessoas → PES-002 vinculos
  ├→ IMP-001 importacao
  ├→ USR-001 usuarios → USR-002 papeis e escopo
  ├→ CFG-001..008 configuracoes (janelas, aging, templates, retencao)
  ├→ REL-001..005 relatorios
  └→ AUD-001 auditoria → AUD-002 acessos e exportacoes

ORG-001 (escopo organizacao) → ORG-002 empreendimentos → ORG-003 usuarios
                             → ORG-004 exportacao/offboarding

SAAS-001 contas → SAAS-002 planos → SAAS-003 limites
                → SAAS-004 acesso JIT (aparece na auditoria do cliente)
                → SAAS-005 saude de integracoes → SAAS-006 metering → BIL-003
```

## Mapa de navegacao — OPS

```
AUTH-001 entrar → AUTH-005 selecionar contexto
  → BottomNav (4 abas + acao central de captura)
      ├─ Fila       CUS-001 → CUS-002 → CUS-003 · CUS-005 · CUS-008
      ├─ Capturar   REC-002 → REC-003 → REC-007 → REC-008
      ├─ Retirada   RET-001 → RET-002 → RET-003 → RET-004
      └─ Pendencias REC-009 fila local · REC-010 conflito · CUS-007 nao identificadas
```

Regra do OPS: **nunca forcar navegacao ao dashboard entre recebimentos de lote.**
Estados (`offline`, `sync pending`, `partial sync`, `retry`) sao variantes, nao
telas.
