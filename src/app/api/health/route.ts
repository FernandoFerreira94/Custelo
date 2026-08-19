import { NextResponse } from "next/server";
import postgres from "postgres";

import { getDatabaseUrl } from "@/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Check = "ok" | "skipped" | "error";

/**
 * Publica de proposito: load balancer, CI e Better Stack precisam de
 * liveness sem sessao. Nao devolve host, SQL, stack nem nome de tabela.
 *
 * Saude de Meta/OCR/storage nasce em I11, quando essas integracoes existirem.
 */
export async function GET() {
  const checks: { app: Check; db: Check } = { app: "ok", db: "skipped" };
  const url = getDatabaseUrl();

  if (url) {
    const sql = postgres(url, { max: 1, connect_timeout: 3, prepare: false });
    try {
      await sql`select 1`;
      checks.db = "ok";
    } catch {
      checks.db = "error";
    } finally {
      await sql.end({ timeout: 1 });
    }
  }

  const degraded = checks.db === "error";
  return NextResponse.json(
    { status: degraded ? "degraded" : "ok", checks },
    { status: degraded ? 503 : 200 },
  );
}
