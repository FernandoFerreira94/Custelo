/**
 * Log estruturado. Nunca recebe payload livre — so campos da allowlist.
 * Dado pessoal, texto de OCR, imagem e segredo nao tem campo aqui de proposito.
 */
export type LogLevel = "info" | "warn" | "error";

export type LogRecord = {
  msg: string;
  request_id?: string;
  org_id?: string;
  empreendimento_id?: string;
};

const ALLOWED_KEYS = [
  "msg",
  "request_id",
  "org_id",
  "empreendimento_id",
] as const;

export function toLogLine(
  level: LogLevel,
  record: LogRecord,
  at: Date,
): string {
  const line: Record<string, string> = {
    ts: at.toISOString(),
    level,
  };

  for (const key of ALLOWED_KEYS) {
    const value = record[key];
    if (typeof value === "string" && value.length > 0) {
      line[key] = value;
    }
  }

  return JSON.stringify(line);
}

export function log(level: LogLevel, record: LogRecord, at = new Date()): void {
  const line = toLogLine(level, record, at);
  if (level === "info") {
    process.stdout.write(`${line}\n`);
    return;
  }
  // warn/error: permitido pelo ESLint (Gate 1).
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.error(line);
}
