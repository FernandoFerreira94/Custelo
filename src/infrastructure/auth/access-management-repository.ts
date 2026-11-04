import postgres from "postgres";

import type {
  AccessActor,
  ManagedScope,
  RoleCode,
} from "@/application/auth/access-management";
import { getDatabaseUrl } from "@/db/client";

type RawActorScope = {
  org_id: string;
  empreendimento_id: string;
  is_org_scope: boolean;
  papel_codigo: string;
};

type SqlResult = { result: { ok: boolean; code?: string } };

export type PendingInviteMetadata = {
  role: string;
  properties: string;
  inviter: string;
};

function mapActorScope(row: RawActorScope): ManagedScope {
  return {
    orgId: row.org_id,
    empreendimentoId: row.empreendimento_id,
    isOrgScope: row.is_org_scope,
    roleCode: row.papel_codigo as RoleCode,
  };
}

async function withSql<T>(fn: (sql: postgres.Sql) => Promise<T>): Promise<T> {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error("DATABASE_UNAVAILABLE");
  }

  const sql = postgres(url, { prepare: false, max: 1 });
  try {
    return await fn(sql);
  } finally {
    await sql.end({ timeout: 2 });
  }
}

export async function loadAccessActor(
  userId: string,
): Promise<AccessActor | null> {
  return withSql(async (sql) => {
    const rows = await sql<
      {
        status: AccessActor["status"] | null;
        scopes: RawActorScope[];
      }[]
    >`
      select
        u.status,
        coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'org_id', e.org_id,
                'empreendimento_id', e.empreendimento_id,
                'is_org_scope', e.empreendimento_id = '00000000-0000-0000-0000-000000000001'::uuid,
                'papel_codigo', p.codigo
              )
            )
            from escopos_usuario e
            join papeis p on p.id = e.papel_id
            where e.usuario_id = u.id and e.ativo = true
          ),
          '[]'::jsonb
        ) as scopes
      from usuarios u
      where u.id = ${userId}::uuid
    `;

    const row = rows[0];
    if (!row?.status) {
      return null;
    }

    return {
      userId,
      status: row.status,
      scopes: (row.scopes ?? []).map(mapActorScope),
    };
  });
}

export async function loadTargetScopes(
  targetUserId: string,
): Promise<ManagedScope[]> {
  return withSql(async (sql) => {
    const rows = await sql<{ scopes: RawActorScope[] }[]>`
      select coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'org_id', e.org_id,
              'empreendimento_id', e.empreendimento_id,
              'is_org_scope', e.empreendimento_id = '00000000-0000-0000-0000-000000000001'::uuid,
              'papel_codigo', p.codigo
            )
          )
          from escopos_usuario e
          join papeis p on p.id = e.papel_id
          where e.usuario_id = ${targetUserId}::uuid and e.ativo = true
        ),
        '[]'::jsonb
      ) as scopes
    `;

    return (rows[0]?.scopes ?? []).map(mapActorScope);
  });
}

export async function persistInviteRegistration(
  actorUserId: string,
  actorOrgId: string,
  actorEmpreendimentoId: string,
  userId: string,
  email: string,
  scope: ManagedScope,
): Promise<{ ok: true } | { ok: false; code: string }> {
  return withSql(async (sql) => {
    const rows = await sql.begin(async (tx) => {
      await tx`select set_config('app.current_user_id', ${actorUserId}, true)`;
      await tx`select set_config('app.current_org_id', ${actorOrgId}, true)`;
      await tx`select set_config('app.current_empreendimento_id', ${actorEmpreendimentoId}, true)`;

      return tx<SqlResult[]>`
        select app.registrar_convite_pendente(
          ${userId}::uuid,
          ${email},
          ${scope.orgId}::uuid,
          ${scope.empreendimentoId}::uuid,
          ${scope.roleCode}::papel_codigo
        ) as result
      `;
    });

    const result = rows[0]?.result;
    return result?.ok
      ? { ok: true }
      : { ok: false, code: result?.code ?? "INVALID_SCOPE" };
  });
}

export async function persistScopeGrant(
  actorUserId: string,
  actorOrgId: string,
  actorEmpreendimentoId: string,
  targetUserId: string,
  scope: ManagedScope,
): Promise<{ ok: true } | { ok: false; code: string }> {
  return withSql(async (sql) => {
    const rows = await sql.begin(async (tx) => {
      await tx`select set_config('app.current_user_id', ${actorUserId}, true)`;
      await tx`select set_config('app.current_org_id', ${actorOrgId}, true)`;
      await tx`select set_config('app.current_empreendimento_id', ${actorEmpreendimentoId}, true)`;

      return tx<SqlResult[]>`
        select app.conceder_escopo(
          ${targetUserId}::uuid,
          ${scope.orgId}::uuid,
          ${scope.empreendimentoId}::uuid,
          ${scope.roleCode}::papel_codigo
        ) as result
      `;
    });

    const result = rows[0]?.result;
    return result?.ok
      ? { ok: true }
      : { ok: false, code: result?.code ?? "INVALID_SCOPE" };
  });
}

export async function persistScopeRevocation(
  actorUserId: string,
  actorOrgId: string,
  actorEmpreendimentoId: string,
  scopeId: string,
): Promise<{ ok: true } | { ok: false; code: string }> {
  return withSql(async (sql) => {
    const rows = await sql.begin(async (tx) => {
      await tx`select set_config('app.current_user_id', ${actorUserId}, true)`;
      await tx`select set_config('app.current_org_id', ${actorOrgId}, true)`;
      await tx`select set_config('app.current_empreendimento_id', ${actorEmpreendimentoId}, true)`;

      return tx<SqlResult[]>`
        select app.revogar_escopo(${scopeId}::uuid) as result
      `;
    });

    const result = rows[0]?.result;
    return result?.ok
      ? { ok: true }
      : { ok: false, code: result?.code ?? "INVALID_SCOPE" };
  });
}

export async function persistUserDeactivation(
  actorUserId: string,
  actorOrgId: string,
  actorEmpreendimentoId: string,
  targetUserId: string,
): Promise<{ ok: true } | { ok: false; code: string }> {
  return withSql(async (sql) => {
    const rows = await sql.begin(async (tx) => {
      await tx`select set_config('app.current_user_id', ${actorUserId}, true)`;
      await tx`select set_config('app.current_org_id', ${actorOrgId}, true)`;
      await tx`select set_config('app.current_empreendimento_id', ${actorEmpreendimentoId}, true)`;

      return tx<SqlResult[]>`
        select app.desativar_usuario(${targetUserId}::uuid) as result
      `;
    });

    const result = rows[0]?.result;
    return result?.ok
      ? { ok: true }
      : { ok: false, code: result?.code ?? "INVALID_SCOPE" };
  });
}

export async function acceptPendingInvite(
  userId: string,
  fullName: string,
): Promise<{ ok: true } | { ok: false; code: string }> {
  return withSql(async (sql) => {
    const rows = await sql.begin(async (tx) => {
      await tx`select set_config('app.current_user_id', ${userId}, true)`;

      return tx<SqlResult[]>`
        select app.aceitar_convite(${fullName}) as result
      `;
    });

    const result = rows[0]?.result;
    return result?.ok
      ? { ok: true }
      : { ok: false, code: result?.code ?? "INVALID_INVITE" };
  });
}

export async function fetchPendingInviteMetadata(
  userId: string,
): Promise<
  { ok: true; metadata: PendingInviteMetadata } | { ok: false; code: string }
> {
  return withSql(async (sql) => {
    const rows = await sql.begin(async (tx) => {
      await tx`select set_config('app.current_user_id', ${userId}, true)`;

      return tx<
        { result: PendingInviteMetadata & { ok: boolean; code?: string } }[]
      >`
        select app.obter_convite_pendente() as result
      `;
    });

    const result = rows[0]?.result;
    if (!result?.ok) {
      return { ok: false, code: result?.code ?? "INVALID_INVITE" };
    }

    return {
      ok: true,
      metadata: {
        role: result.role,
        properties: result.properties,
        inviter: result.inviter,
      },
    };
  });
}
