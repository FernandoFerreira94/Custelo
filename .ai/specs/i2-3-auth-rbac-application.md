# I2.3 — Application Auth RBAC

## Status

Desenho aprovado em 22/08/2026. Este recorte implementa casos de uso e testes
unitarios, sem migration, adaptador de banco, Server Action, e-mail ou chamada
ao Supabase.

## Objetivo

Centralizar a decisao server-side de quem pode convidar, conceder ou revogar
escopo e desativar usuarios. O tenant do pedido nunca autoriza a acao: a
decisao compara o escopo solicitado com os escopos do ator ja resolvidos no
servidor.

## Matriz de autoridade

| Ator ativo                 | Pode gerir                                       | Limites                                                                                                           |
| -------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `org_admin`                | qualquer usuario e escopo da propria organizacao | nao gere outra organizacao nem papel `platform_super_admin`                                                       |
| `empreendimento_gestor`    | usuarios e escopos do proprio empreendimento     | nao cria escopo de organizacao, nao gere outro empreendimento, nao concede `org_admin` nem `platform_super_admin` |
| `recepcionista`, `auditor` | nenhum acesso                                    | acao rejeitada                                                                                                    |
| `platform_super_admin`     | fora deste caso de uso                           | acesso de suporte e JIT pertencem a SAAS-004                                                                      |
| usuario sem status `ativo` | nenhum acesso                                    | acao rejeitada                                                                                                    |

## Casos de uso

Os casos ficam em `src/application/auth` e recebem um ator autenticado, os
escopos efetivos desse ator e o pedido validado pelo adaptador. Eles devolvem
uma decisao tipada; nao recebem tenant de um cliente como fonte de autoridade.

- `authorizeInvite`: autoriza criar um usuario pendente e seu escopo inicial.
- `authorizeScopeChange`: autoriza conceder ou trocar um papel/escopo.
- `authorizeScopeRevocation`: autoriza revogar um escopo existente.
- `authorizeUserDeactivation`: autoriza desativar um usuario e exige revogacao
  de sessao na implementacao futura.

## Portas futuras

Adaptadores futuros implementarao transacao para `usuarios` e
`escopos_usuario`, disparo seguro de convite e revogacao do refresh token. O
convite real requer uma decisao propria de persistencia/token e integracao com
Supabase Auth; nao faz parte deste recorte.

## Testes

Testes unitarios cobrem o caminho permitido e as recusas por status, papel,
organizacao, empreendimento e tentativa de conceder papel acima da autoridade.
Toda persistencia futura exigira testes RLS negativos contra Postgres real.

## Fora de escopo

- migration ou mudanca de schema;
- uso de `service_role`;
- envio/aceite real de convite;
- UI USR-001, USR-002 e USR-003;
- suporte JIT e auditoria persistida.
