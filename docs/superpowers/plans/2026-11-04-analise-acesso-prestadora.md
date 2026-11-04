# Análise: login por empresa e cadeia Prestadora > Condomínio > Funcionário (04/11/2026)

Somente análise. Nada foi alterado no plano mestre, no repo ou no Supabase. Base lida: main do repo Custelo (migrations 0000 a 0009, `.ai/modules/tenancy.md`, `auth-rbac.md`) e o plano mestre (D1 a D19, Fase 0, I11).

## 1. Como está hoje

| Pergunta                                                         | Resposta                                                                                                                                                                                                                                                     |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tenant                                                           | `organizacoes` (conta contratante) > `empreendimentos` (cada um pertence a UMA org via `org_id`) > dados. RLS por `app.current_org_id()` + `app.current_empreendimento_id()`.                                                                                |
| Administradora com vários condomínios                            | **Existe.** É a mesma org com escopo de org (sentinela `...0001` em `escopos_usuario`), papel `org_admin`. Prancha ORG-001..004 (I11).                                                                                                                       |
| Prestadora (Selva) que atende condomínios de OUTRAS organizações | **Lacuna.** Não há tipo de organização, contrato entre organizações, nem vínculo de funcionário via contrato. Grep por prestador/terceirizada/contrato de serviço: zero ocorrências no código, docs e plano.                                                 |
| Funcionário em vários locais                                     | **Parcial.** `escopos_usuario` tem `org_id` por linha, então um usuário pode ter escopos em orgs diferentes. `resolve_auth_claims` usa `contexto_ativo` (uma linha por usuário, no servidor) quando há mais de um escopo. Não achei teste e2e cruzando orgs. |
| Shopping                                                         | Já entra como `empreendimentos.tipo = 'shopping'` (Task 11.1). Sem mudança.                                                                                                                                                                                  |
| Login atual (AUTH-001)                                           | `/entrar` por e-mail + senha, convite, recuperação. `/contexto` escolhe entre escopos do usuário. Sem busca por empresa, sem lembrar local, sem lista de funcionários.                                                                                       |
| `dispositivos_conhecidos`                                        | Planejada na I11 (`usuario_id`, `aparelho_sha256`), mas é por usuário, não por local.                                                                                                                                                                        |

Conclusão: o modelo atual cobre "um condomínio" e "administradora com vários condomínios". A cadeia **Prestadora > Condomínio** e o login por empresa são novos.

## 2. Modelo recomendado (mínimo que respeita o LOCKED)

Princípio: **o dado pertence ao condomínio.** A RLS continua isolando por `(org_id, empreendimento_id)` do condomínio. A prestadora nunca vira dona de encomenda. Unidade continua destino primário e eventos continuam append-only.

1. `organizacoes.tipo` (`contratante` | `prestadora`).
2. `contratos_servico`: `prestadora_org_id`, `local_org_id`, `empreendimento_id`, `servico` (portaria, vigilância), `papeis_permitidos` (recepcionista, auditor; nunca gestor/org_admin), `inicio`, `fim`, `status`. Criado/aceito pelo gestor do condomínio (o dono do dado), não só pela prestadora.
3. `escopos_usuario.via_contrato_id` (nulo = vínculo direto). Quem atribui o funcionário ao contrato é o gestor da prestadora; uma função `SECURITY DEFINER` cria o escopo na org do condomínio com o papel permitido. Fim/suspensão do contrato desativa todos os escopos `via_contrato_id` na mesma transação. Revogação imediata segue o ADR-005 (checagem de status no servidor em toda escrita).
4. Auditoria grava o ator com a origem: `prestadora_org_id` + `contrato_id` em cada evento. O condomínio vê "Carlos (Selva)" na própria auditoria.
5. Contexto ativo **por aparelho/sessão**, não por usuário: hoje `contexto_ativo` tem uma linha por usuário, então dois aparelhos em condomínios diferentes brigam. Usar cookie assinado `pz-emp` validado contra `escopos_usuario` a cada requisição (o plano já faz isso para org_admin, Task 0.2). Estender para qualquer usuário com mais de um escopo. O claim do JWT não precisa carregar o local.

Sem mudança em: RLS das tabelas de domínio, custódia, FKs compostas.

## 3. O que muda, por área

| Área           | Mudança                                                                                                                                                                                                                                                                                                                             |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Banco          | Migration nova (após a 0011 da I3; sugiro entrar na Fase 0 ou logo após a I3): `organizacoes.tipo`, `contratos_servico`, `escopos_usuario.via_contrato_id`, funções de atribuir/encerrar, RLS própria do contrato (visível às duas pontas, escrita só pelo gestor do condomínio), teste negativo prestadora A não vê contrato da B. |
| Auth/JWT       | `resolve_auth_claims`: sem local no claim para multi-escopo; `list_escopos_acessiveis` passa a devolver `via_contrato`/`prestadora_nome`. `definir_contexto_ativo` vira cookie validado (ou tabela por `device_id`).                                                                                                                |
| Telas          | AUTH-001 ganha etapa "Local" (código/QR, ver risco 1). `/contexto` (AUTH-005) ganha agrupamento Prestadora > Condomínio. Gestão: tela de contratos e atribuição de funcionários (USR-001 estendida). Todas as telas novas precisam de prancha (D8): login por local, lista de funcionários do aparelho, contratos.                  |
| PWA/offline    | Dexie particionada por `(empreendimento_id, usuario_id)`; cadastro baixado por local; trocar de local não mistura filas; sair apaga o cache do usuário; contrato encerrado apaga o cache do local no próximo sync. Fila de pendências já é por usuário (plano 5019).                                                                |
| Plano mestre   | Nova decisão D20 (modelo de prestadora), ajuste das Tasks 0.2/0.3 (contexto), nova task na I3 ou I11 (contratos), AUTH-001 e AUTH-005 na Parte 1, tabela `dispositivos_conhecidos` redefinida (ver 4), cobrança D9/I11 (quem paga).                                                                                                 |
| Jurídico (D17) | Prestadora tende a ser operadora ou suboperadora de dados pessoais do condomínio. O contrato entre as partes e o DPA precisam prever isso.                                                                                                                                                                                          |

## 4. Riscos e recomendação

### Risco 1: busca por nome de empresa, aberta, vaza a carteira de clientes

Quem digita "Selva" e vê a lista de condomínios descobre quem contrata a Selva (e qual condomínio usa o produto). Também confirma existência de contas.

- **Recomendado:** não buscar por nome na tela pública. O local é identificado por **código curto/slug** (ex.: `girassol-2` ou 6 caracteres) ou por **QR de pareamento** que o gestor gera para o aparelho da portaria. Depois de pareado, o aparelho lembra o local (guardado no aparelho) e a etapa some.
- **Para a prestadora:** o funcionário digita o código da Selva (ou entra direto com e-mail e senha); **a lista de condomínios só aparece depois da autenticação** e vem dos escopos dele (só os contratos dele, não todos da Selva).
- **Alternativa:** busca por nome com mínimo de 3 letras, rate limit, e resposta igual exista ou não (sem lista). Funciona para a UX, mas ainda permite adivinhar nomes. Pior segurança, UX melhor.
- Trade-off: código/QR exige uma vez o gestor entregar o código. É o preço de não vazar clientes. Para um piloto com poucos locais, o QR impresso na portaria resolve.

### Risco 2: lista de funcionários no login revela e-mails (enumeração) em aparelho compartilhado

- **Recomendado:** a lista vive **só no aparelho** (IndexedDB/localStorage), nunca vem do servidor. Entra quem **já fez login naquele aparelho**. Mostra nome e e-mail mascarado (`c****@selva.com`). Senha sempre obrigatória. Botão "Remover deste aparelho", expira após 30 dias sem uso e some no "Sair de todos os aparelhos". Tela de erro de senha com mensagem genérica.
- O servidor continua respondendo igual para e-mail existente ou não (já recomendado em auth).
- **Alternativa mais segura:** lista só com o nome (sem e-mail) e um PIN curto por aparelho. Menos atrito para a portaria, mas PIN fraco; só com limite de tentativas e travamento.
- **Biometria/passkey:** boa para o celular pessoal do funcionário; precisa conferir o suporte atual de WebAuthn/passkey no Supabase Auth antes de prometer (não verifiquei). Em tablet compartilhado da portaria, preferir senha: a digital de um não pode abrir a conta de outro.
- Risco residual: aparelho compartilhado mostra os colegas da portaria. Aceitável, são colegas do mesmo posto; documentar.

### Risco 3: funcionário em vários condomínios

- Já suportado em `escopos_usuario`. Pontos de atenção: contexto por aparelho (item 2.5), cache offline separado, logout apaga, e **auditoria sempre com o local no evento**. Trocar de condomínio no meio de um lote offline deve bloquear até sincronizar.
- Funcionário que sai da Selva: desativar na Selva desativa todos os escopos via contrato de uma vez; o condomínio vê o efeito imediatamente.

### Risco 4: o condomínio perde controle sobre quem entra

Se a Selva puder pôr qualquer pessoa no condomínio, o síndico responde por isso. Por isso o condomínio aprova o contrato e limita os papéis (nunca gestor), e pode suspender um funcionário específico.

### Risco 5: cobrança e escopo

Hoje a cobrança é por empreendimento (D9/I11). Quem paga na cadeia Selva: o condomínio ou a Selva (revenda)? Muda tudo em billing e na LGPD.

## 5. Ordem sugerida

1. Aprovação do modelo (esta análise).
2. D20 + ajuste de Task 0.2/0.3 (contexto por aparelho) já na Fase 0, porque mexe no que está em construção.
3. Pranchas novas (Fernando): login por local, lista de funcionários do aparelho, contratos e atribuição.
4. Migration de contratos e `via_contrato_id` junto da I3 ou antes da I11 (depende de querer vender a prestadora no piloto).
5. MVP do piloto pode ficar só com condomínio direto + administradora; prestadora entra como fase seguinte sem refazer nada, se o contexto por aparelho (item 2.5) e `via_contrato_id` já estiverem previstos.

## 6. Perguntas abertas ao Fernando

1. Quem paga: o condomínio contrata a PacoteZap e "convida" a Selva, ou a Selva contrata e inclui os condomínios?
2. O funcionário da Selva usa o celular pessoal, o tablet fixo da portaria, ou os dois? (muda biometria e lista no aparelho)
3. A Selva precisa de uma visão própria consolidada de todos os condomínios (supervisor)? Eu deixaria para depois do MVP.
4. O gestor do condomínio precisa aprovar cada funcionário da Selva, ou aprova só o contrato e a prestadora escolhe as pessoas?
5. O piloto inclui prestadora, ou entra só condomínio direto (e a prestadora vem depois)?
6. Código/QR de pareamento é aceitável no lugar da busca por nome?
