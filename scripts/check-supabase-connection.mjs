/* eslint-disable no-console -- script CLI de diagnostico local */
import { readFileSync } from "node:fs";
import postgres from "postgres";

function loadEnv(path) {
  try {
    const raw = readFileSync(path, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
    return true;
  } catch {
    return false;
  }
}

function describeDbUrl(raw) {
  if (!raw) return { set: false };
  const scheme = raw.split(":", 1)[0];
  try {
    const parsed = new URL(raw);
    return {
      set: true,
      scheme,
      host: parsed.hostname,
      port: parsed.port || "(default)",
      user: parsed.username || "(none)",
      database: parsed.pathname.replace(/^\//, "") || "(none)",
      validPostgres: scheme === "postgresql" || scheme === "postgres",
    };
  } catch {
    return { set: true, scheme, validPostgres: false, parseError: true };
  }
}

const hasEnv = loadEnv(".env");
console.log(`ENV_FILE: ${hasEnv ? "found (.env)" : "missing"}`);

const envKeys = [
  "DATABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

for (const key of envKeys) {
  console.log(`${key}: ${process.env[key] ? "SET" : "NOT SET"}`);
}

const dbInfo = describeDbUrl(process.env.DATABASE_URL);
if (dbInfo.set) {
  console.log(`DATABASE_SCHEME: ${dbInfo.scheme}`);
  if (dbInfo.parseError) {
    console.log("DATABASE_PARSE: INVALID URL");
  } else if (!dbInfo.validPostgres) {
    console.log(
      "DATABASE_FORMAT: WRONG — deve ser postgresql://... (nao URL https do Supabase)",
    );
  } else {
    console.log(
      `DATABASE_TARGET: host=${dbInfo.host} port=${dbInfo.port} db=${dbInfo.database} user=${dbInfo.user}`,
    );
  }
}

const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supaUrl) {
  try {
    const ref = new URL(supaUrl).hostname.split(".")[0];
    console.log(`SUPABASE_PROJECT_REF: ${ref}`);
  } catch {
    console.log("SUPABASE_URL_PARSE: INVALID");
  }
}

if (dbInfo.validPostgres && process.env.DATABASE_URL) {
  const sql = postgres(process.env.DATABASE_URL, {
    max: 1,
    connect_timeout: 8,
    prepare: false,
  });
  try {
    const rows = await sql`
      select current_database() as db, current_user as usr
    `;
    console.log("DB_CONNECT: OK");
    console.log(`DB_NAME: ${rows[0].db}`);
    console.log(`DB_USER: ${rows[0].usr}`);
  } catch (error) {
    console.log("DB_CONNECT: FAIL");
    console.log(
      `DB_ERROR: ${error instanceof Error ? error.message : String(error)}`,
    );
    if (dbInfo.port === "5432") {
      console.log(
        "DB_HINT: Supabase recomenda pooler na porta 6543 (Transaction mode) para serverless.",
      );
    }
  } finally {
    await sql.end({ timeout: 2 });
  }
} else if (process.env.DATABASE_URL) {
  console.log("DB_CONNECT: SKIPPED (formato invalido)");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (supabaseUrl && anonKey) {
  const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  });
  console.log(`SUPABASE_AUTH_HEALTH: HTTP ${res.status}`);
} else {
  console.log(
    "SUPABASE_API: SKIPPED (faltam NEXT_PUBLIC_SUPABASE_URL e/ou ANON_KEY)",
  );
}
