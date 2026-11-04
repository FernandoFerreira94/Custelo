# ADR-021 — Identidade visual Névoa + Brasa

- **Status:** ACEITO
- **Data:** 2026-11-04
- **Supera:** paleta, fonte de titulo e escala de sombra da _Brand & UI
  Foundation_ (rev. 15/08/2026). O resto da Foundation continua valendo.

## Problema

O produto passou a se chamar **PacoteZap** e as pranchas de todas as telas do
MVP foram revisadas pelo Fernando entre 30/10 e 03/11/2026. A paleta Deep Blue
/ Floral White / Powder Blue com titulos em Bodoni Moda nao combina com a nova
marca (pino-caixa + raio, "Pacote" navy, "Zap" laranja) e o vermelho de erro
ficaria parecido com a cor da marca.

## Escolha

Tema **Névoa + Brasa**: navy `#0C2C55` como cor de texto e de acao principal,
fundo Névoa `#EEF1F5` com cartoes brancos, laranja Brasa `#D23B26` so em acoes
pequenas e na marca, erro em carmim `#B4123F`, titulos em **Plus Jakarta Sans**
e sombras navy em camadas (`--shadow-elevation-1..3`, `--shadow-primary`,
`--shadow-brasa`).

Regras de uso aprovadas nas pranchas (03/11/2026):

- Botao grande (acao primaria da tela, ex.: "Registrar encomenda") e card de
  destaque da portaria ficam **navy** (`variant="default"`).
- Botao pequeno de acao usa **brasa** (`variant="brasa"`).
- Laranja em todos os botoes foi testado e **rejeitado**.
- Erro e falha de notificacao usam carmim, sempre com icone e texto.
- Logo: simbolo e "Zap" em brasa, "Pacote" em navy; sobre navy, brasa clara.

## Alternativas

- **Manter Deep Blue / Floral White / Bodoni:** marca antiga, serifa pesada em
  tela operacional pequena.
- **Brasa como `--primary`:** todos os botoes laranja. Testado e rejeitado:
  cansa, compete com estados de alerta e perde a hierarquia da acao principal.
- **Erro continua vermelho:** fica proximo demais do brasa; o porteiro confunde
  "acao" com "falha".

## Motivo

Navy carrega confianca e leitura; brasa aparece pouco e por isso guia o olho
para a acao. Plus Jakarta Sans tem numerais legiveis e funciona em titulo
pequeno no celular. A sombra em camadas da profundidade sem vidro, respeitando o
LOCK de superficie solida.

## Trade-offs

- `--state-urgente` mudou de laranja (`#C2410C`) para vinho (`#8F1D4A`) porque
  laranja ficava indistinguivel do brasa (contraste 1,08 entre os dois).
- Dois tipos de acao colorida (navy e brasa) exigem criterio na hora de montar
  tela; a regra acima e o criterio.
- Sombra em camadas custa um pouco mais de pintura que a escala antiga.

## Riscos e mitigacao

- **Modo escuro** aprovado em prancha em 04/11/2026 (aba Modo escuro).
- **Borda de input (`#C6CFDA`) tem 1,57:1 sobre branco**, abaixo do 3:1 de
  WCAG 1.4.11. A sombra `elevation-1` delimita o campo; se a auditoria de
  acessibilidade reprovar, escurecer `--input`.
- **Brasa sobre navy da 2,9:1.** Sobre navy usar sempre a brasa clara do modo
  escuro (`#F4826D`).
- O vidro continua proibido, com uma unica excecao na barra inferior mobile
  (ADR-022).

## Gatilho de revisao

Teste de uso com porteiros mostrando confusao entre acao (brasa) e alerta
(carmim/vinho), ou auditoria de contraste reprovando bordas e estados.
