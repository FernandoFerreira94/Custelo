import { NextResponse } from "next/server";

import {
  mergeHookClaims,
  resolveAuthClaimsForUser,
} from "@/infrastructure/auth/resolve-auth-claims";
import { env } from "@/lib/env";

type AuthHookBody = {
  user_id?: string;
  claims?: Record<string, unknown>;
};

function verifyHookSecret(request: Request): boolean {
  const secret = env.SUPABASE_AUTH_HOOK_SECRET;
  if (!secret) {
    return false;
  }

  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!verifyHookSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: AuthHookBody;
  try {
    body = (await request.json()) as AuthHookBody;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!body.user_id) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  const customClaims = await resolveAuthClaimsForUser(body.user_id);

  return NextResponse.json({
    claims: mergeHookClaims(body.claims ?? {}, customClaims),
  });
}
