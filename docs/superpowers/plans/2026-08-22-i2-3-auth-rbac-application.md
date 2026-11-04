# I2.3 Application Auth RBAC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralizar as decisoes de RBAC para convite, mudanca e revogacao de
escopo e desativacao de usuario, sem confiar em tenant informado pelo cliente.

**Architecture:** Uma politica pura em `src/application/auth` recebe o ator
autenticado e seus escopos efetivos, ambos resolvidos no servidor pelo futuro
adaptador. Cada operacao chama a mesma verificacao de autoridade por escopo; a
desativacao exige que todos os escopos do usuario-alvo estejam sob autoridade do
ator. Nenhuma escrita, chamada ao Supabase ou consulta ao banco ocorre aqui.

**Tech Stack:** TypeScript estrito, Vitest unitario.

**Spec:** `.ai/specs/i2-3-auth-rbac-application.md`

## Global Constraints

- Sem migration, schema, Server Action, UI, Supabase, e-mail ou `service_role`.
- Tenant nunca vem do cliente; os escopos do ator ja foram resolvidos no servidor.
- `org_admin` atua apenas na propria organizacao; `empreendimento_gestor` apenas
  no proprio empreendimento e nao concede `org_admin` ou `platform_super_admin`.
- Usuario com status diferente de `ativo`, `recepcionista` e `auditor` nao gerem acesso.
- Nao fazer stage ou commit: o working tree contem alteracoes locais de terceiros.

---

## File Structure

- Create: `src/application/auth/access-management.ts` — tipos de RBAC e
  autorizadores puros para as quatro operacoes.
- Create: `src/application/auth/access-management.test.ts` — matriz de
  permissoes e recusas de seguranca da politica.
- Modify: `.ai/roadmap.md` — registrar o recorte apenas apos validacao verde.

### Task 1: Politica comum de autoridade de escopo

**Files:**

- Create: `src/application/auth/access-management.ts`
- Test: `src/application/auth/access-management.test.ts`

**Interfaces:**

- Produces: `RoleCode`, `ManagedScope`, `AccessActor`, `AuthorizationResult` e
  `authorizeScopeManagement(actor, scope)`.
- Consumes: nenhum SDK, framework ou banco.

- [ ] **Step 1: Write the failing test**

```ts
it("permite org_admin na propria organizacao", () => {
  expect(
    authorizeScopeManagement(orgAdmin, {
      orgId: "org-a",
      empreendimentoId: "emp-b",
      isOrgScope: false,
      roleCode: "recepcionista",
    }),
  ).toEqual({ ok: true });
});

it("recusa gestor fora do proprio empreendimento", () => {
  expect(
    authorizeScopeManagement(gestorEmpA, {
      orgId: "org-a",
      empreendimentoId: "emp-b",
      isOrgScope: false,
      roleCode: "recepcionista",
    }),
  ).toEqual({ ok: false, code: "OUTSIDE_SCOPE" });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./node_modules/.bin/vitest.cmd run --project unit --dir src/application/auth`

Expected: FAIL because `access-management.ts` does not export
`authorizeScopeManagement`.

- [ ] **Step 3: Write minimal implementation**

```ts
export type RoleCode =
  | "platform_super_admin"
  | "org_admin"
  | "empreendimento_gestor"
  | "recepcionista"
  | "auditor";

export type ManagedScope = {
  orgId: string;
  empreendimentoId: string;
  isOrgScope: boolean;
  roleCode: RoleCode;
};

export type AccessActor = {
  userId: string;
  status: "ativo" | "desativado" | "convite_pendente" | "missing";
  scopes: ManagedScope[];
};

export type AuthorizationResult =
  | { ok: true }
  | { ok: false; code: "UNAUTHORIZED" | "OUTSIDE_SCOPE" | "ROLE_ESCALATION" };
```

Implement `authorizeScopeManagement` nesta ordem: recusar ator nao ativo;
permitir `org_admin` da mesma `orgId`, exceto papel `platform_super_admin`;
recusar gestor que solicite escopo de organizacao, outro empreendimento,
`org_admin` ou `platform_super_admin`; permitir gestor somente no proprio
empreendimento; recusar os demais atores.

- [ ] **Step 4: Run test to verify it passes**

Run: `./node_modules/.bin/vitest.cmd run --project unit --dir src/application/auth`

Expected: PASS para todos os testes de `src/application/auth`.

### Task 2: Casos de uso de convite, escopo, revogacao e desativacao

**Files:**

- Modify: `src/application/auth/access-management.ts`
- Modify: `src/application/auth/access-management.test.ts`

**Interfaces:**

- Consumes: `AccessActor`, `ManagedScope`, `AuthorizationResult` e
  `authorizeScopeManagement` da Task 1.
- Produces: `authorizeInvite`, `authorizeScopeChange`,
  `authorizeScopeRevocation` e `authorizeUserDeactivation`.

- [ ] **Step 1: Write the failing test**

```ts
it("recusa convite por usuario pendente", () => {
  expect(authorizeInvite(pendingOrgAdmin, scopeInOrgA)).toEqual({
    ok: false,
    code: "UNAUTHORIZED",
  });
});

it("recusa gestor que tenta conceder org_admin", () => {
  expect(
    authorizeScopeChange(gestorEmpA, {
      ...scopeInEmpA,
      roleCode: "org_admin",
    }),
  ).toEqual({ ok: false, code: "ROLE_ESCALATION" });
});

it("recusa desativar usuario com escopo fora da autoridade do ator", () => {
  expect(
    authorizeUserDeactivation(orgAdminA, [scopeInOrgA, scopeInOrgB]),
  ).toEqual({ ok: false, code: "OUTSIDE_SCOPE" });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./node_modules/.bin/vitest.cmd run --project unit --dir src/application/auth`

Expected: FAIL because os quatro casos de uso ainda nao existem.

- [ ] **Step 3: Write minimal implementation**

```ts
export function authorizeInvite(
  actor: AccessActor,
  initialScope: ManagedScope,
): AuthorizationResult {
  return authorizeScopeManagement(actor, initialScope);
}

export function authorizeScopeChange(
  actor: AccessActor,
  requestedScope: ManagedScope,
): AuthorizationResult {
  return authorizeScopeManagement(actor, requestedScope);
}

export function authorizeScopeRevocation(
  actor: AccessActor,
  existingScope: ManagedScope,
): AuthorizationResult {
  return authorizeScopeManagement(actor, existingScope);
}

export function authorizeUserDeactivation(
  actor: AccessActor,
  targetScopes: ManagedScope[],
): AuthorizationResult {
  if (targetScopes.length === 0) {
    return { ok: false, code: "OUTSIDE_SCOPE" };
  }

  for (const scope of targetScopes) {
    const result = authorizeScopeManagement(actor, scope);
    if (!result.ok) return result;
  }

  return { ok: true };
}
```

Adicione os testes de sucesso para `org_admin` e `empreendimento_gestor`, de
recusa para `recepcionista` e `auditor`, e de revogacao dentro e fora da
autoridade do ator.

- [ ] **Step 4: Run test to verify it passes**

Run: `./node_modules/.bin/vitest.cmd run --project unit --dir src/application/auth`

Expected: PASS para convite, troca, revogacao e desativacao, incluindo todas as
recusas descritas na especificacao.

### Task 3: Validacao final e contexto

**Files:**

- Modify: `.ai/roadmap.md`

**Interfaces:**

- Consumes: testes verdes das Tasks 1 e 2.
- Produces: estado documentado do recorte application/auth-rbac.

- [ ] **Step 1: Run the complete quality gate**

Run: `pnpm verify`

Expected: typecheck, lint, format check e projetos unit/ui sem falhas.

- [ ] **Step 2: Record evidence in the roadmap**

Atualize apenas a linha de I2.3 para registrar a politica application/auth-rbac
e os testes unitarios. Mantenha convite real, revogacao de refresh token e UI
USR-001..003 como pendencias de adaptador/integracao.

- [ ] **Step 3: Inspect the scoped diff**

Run: `git diff --check -- src/application/auth/access-management.ts src/application/auth/access-management.test.ts .ai/roadmap.md`

Expected: sem erro de whitespace.

## Self-Review

- Cobertura: Tasks 1 e 2 implementam toda a matriz, os quatro autorizadores e
  suas recusas; Task 3 registra somente evidencia validada.
- Placeholders: nenhum.
- Tipos: todas as operacoes usam `AccessActor`, `ManagedScope` e
  `AuthorizationResult` definidos na Task 1.
