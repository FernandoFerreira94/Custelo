# Seguranca — sempre ativo

Canonico: `.ai/rules/security.md` (manter os dois iguais). Sem `paths:` de
proposito: estas regras valem no momento em que o arquivo e **criado**.

## Multi-tenant (a classe de bug mais cara deste produto)

- Toda query que le ou muta um registro escopa por tenant, nao so por id. Um id
  vindo do request **nao e prova de acesso**.
- `org_id` e `empreendimento_id` derivam do contexto autenticado. Nunca de body,
  query string, header ou parametro de rota.
- Toda tabela de dominio nasce com RLS habilitada. Tabela sem policy e bug, nao
  pendencia.
- A service_role key ignora RLS: restrita a jobs especificos, nunca em codigo de
  request, nunca no cliente.
- Erro de autorizacao cross-tenant e sempre **alerta**, nunca ruido de log.

## Entrada e saida

- Toda entrada externa validada com Zod antes de chegar ao caso de uso.
- Nunca espalhar o corpo da requisicao direto em create/update. Apenas campos
  do schema chegam ao banco.
- SQL parametrizado sempre. Nenhuma interpolacao de string em query crua.
- Upload: validar MIME e tamanho no servidor **antes** de processar.
- Resposta de erro nunca vaza stack trace, id interno ou nome de tabela.

## Segredo e dado pessoal

- `.env` nunca commitado; `.env.example` sempre atualizado, sem valores.
- Nunca logar dado pessoal, imagem de etiqueta, texto bruto de OCR ou segredo.
- Analytics (PostHog) nunca recebe PII. O audit log vive no Postgres e nunca sai
  para ferramenta de produto.

## Evidencia

- Nao existe hard delete de evidencia operacional, por nenhum papel.
- Correcao gera evento novo e preserva o anterior — nunca sobrescreve.
- Acao de permissao elevada (trocar unidade apos notificacao, cancelar registro,
  alterar apos retirada, corrigir retirada/devolucao, enviar fora da janela)
  exige motivo e gera trilha.

## Dependencias

Depois de adicionar dependencia: `pnpm audit --prod`. Sinalizar high/critical.
Nunca rodar `audit fix --force` automaticamente.
