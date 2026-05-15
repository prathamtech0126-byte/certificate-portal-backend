import type { Pool } from "pg";
import { randomUUID } from "crypto";
import { getPool } from "../../shared/db/postgres";

function pool(): Pool {
  return getPool();
}

export const verificationLogsRepository = {
  async insert(input: { studentInternalId: string; ipAddress: string | null }): Promise<void> {
    await pool().query(
      `INSERT INTO verification_logs (id, "studentId", "checkedAt", "ipAddress")
       VALUES ($1, $2, NOW(), $3)`,
      [randomUUID(), input.studentInternalId, input.ipAddress]
    );
  },
};
