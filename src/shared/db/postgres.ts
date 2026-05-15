import { Pool } from "pg";
import { AppError } from "../utils/errors/AppError";

let pool: Pool | null = null;

function withPgSslCompatibility(url: string): string {
  try {
    const parsed = new URL(url);
    const sslmode = parsed.searchParams.get("sslmode");
    if ((sslmode === "require" || sslmode === "prefer" || sslmode === "verify-ca") && !parsed.searchParams.has("uselibpqcompat")) {
      parsed.searchParams.set("uselibpqcompat", "true");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new AppError("DATABASE_URL is not configured", 503);
  }
  if (!pool) {
    pool = new Pool({ connectionString: withPgSslCompatibility(process.env.DATABASE_URL) });
  }
  return pool;
}

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function checkDatabaseConnection(): Promise<void> {
  const db = getPool();
  await db.query("SELECT 1");
}
