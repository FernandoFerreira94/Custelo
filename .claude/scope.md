# Scope — Custelo

Contexto de negocio. Carregado sob demanda (`scope`), nao no boot.
Fonte canonica: Notion "Contexto Inicial Validado — 13-08-2026" (precedencia
maxima; decisoes DEFINED nele nao sao reabertas por pesquisa ou inferencia).

## Problema

Portarias operam encomendas em caderno, planilha ou modulo secundario de ERP.
Resultado: atraso de aviso, extravio, associacao errada, cadastro desatualizado,
ausencia de prova de retirada e baixa rastreabilidade quando ocorre erro.

## Resultado esperado

Registro em poucos segundos, custodia auditavel, notificacao confiavel na janela
correta, correcao sem apagar historico, retirada e devolucao comprovadas.

## Publico

Condominios residenciais verticais e horizontais, torres e condominios
comerciais, shopping centers, administradoras e empresas de facilities.
Brasil — LGPD (Lei 13.709/2018).

## Atores

| Ator                         | Objetivo                                      |
| ---------------------------- | --------------------------------------------- |
| Recepcionista / Porteiro     | registrar rapido no pico e entregar sem erro  |
| Gestor do Empreendimento     | reduzir reclamacao e ter prova do que ocorreu |
| Administrador da Organizacao | padronizar operacao em varios empreendimentos |
| Morador / Destinatario       | ser avisado e retirar sem atrito (sem login)  |
| Auditor / Consulta           | verificar historico e evidencias              |
| Super Admin (Webcodeff)      | operar a plataforma                           |

O morador **nao tem login no MVP**. Interage por WhatsApp e retirada presencial.

## Diferencial defensavel

Cadeia de custodia auditavel + correcao pos-notificacao sem apagar historico +
matching por unidade antes da pessoa + comunicacao resiliente + offline limitado

- devolucao formal.

## O que o produto NAO e

Nao e ERP condominial. Nao e transportadora. Nao e app obrigatorio do morador.
Nao e apenas OCR + WhatsApp. Nao assume custodia fisica. Nao promete eliminar
extravios.

## KPIs

Tempo medio por registro · % identificado sem digitacao manual · % de
notificacoes entregues na primeira tentativa · tempo medio ate retirada · volume
de correcoes pos-notificacao · % de nao identificadas resolvidas.

## Criterio de fracasso / pivot

Porteiro volta ao caderno por lentidao · matching erra unidade com frequencia
que gera desconfianca · custo de WhatsApp inviabiliza margem · ticket
residencial nao sustenta CAC.

## Volume de referencia

ASSUMPTION OPERACIONAL FORTE (shopping de referencia): ~30 encomendas/dia,
picos ~50, 5–10 min por lote em caderno. Nao ha validacao externa ainda — tratar
como hipotese, nao como fato.

## Questoes juridicas em aberto (nao inventar resposta)

Controlador x operador · prazos de retencao por categoria · DPA e lista de
subprocessadores · transferencia internacional (OCR, storage, PostHog, Meta).

O motor de retencao e construido parametrizavel **agora**; os prazos entram como
configuracao quando o juridico definir. O sistema nao vai a producao com prazo
inventado.
