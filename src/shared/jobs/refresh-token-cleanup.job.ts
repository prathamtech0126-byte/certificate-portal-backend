import { getPool } from "../db/postgres";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

async function deleteExpiredRefreshTokens(): Promise<void> {
  const pool = getPool();
  await pool.query(`DELETE FROM refresh_tokens WHERE "expiresAt" < NOW()`);
}

/**
 * Removes expired refresh token rows once on startup and every 24 hours.
 */
export function scheduleDailyRefreshTokenCleanup(): ReturnType<typeof setInterval> {
  void deleteExpiredRefreshTokens().catch((err) => {
    console.error("Refresh token cleanup (initial) failed:", err);
  });
  return setInterval(() => {
    void deleteExpiredRefreshTokens().catch((err) => {
      console.error("Refresh token cleanup failed:", err);
    });
  }, ONE_DAY_MS);
}
