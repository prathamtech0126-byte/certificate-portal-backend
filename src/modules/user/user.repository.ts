import type { Pool } from "pg";
import { randomUUID } from "crypto";
import type { PublicUser, UserRecord } from "./user.model";
import { getPool } from "../../shared/db/postgres";

function pool(): Pool {
  return getPool();
}

type UserRow = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type RefreshTokenRow = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
};

function mapRowToUser(row: UserRow): UserRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role as UserRecord["role"],
    isActive: Boolean(row.isActive),
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

export const userRepository = {
  async findByEmail(email: string): Promise<UserRecord | null> {
    const result = await pool().query<UserRow>(
      `SELECT id, name, email, password, role, "isActive", "createdAt", "updatedAt"
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [email]
    );
    const row = result.rows[0];
    if (!row) return null;
    return mapRowToUser(row);
  },

  async createUser(input: {
    name: string;
    email: string;
    password: string;
    role: "ADMIN" | "HR";
  }): Promise<PublicUser> {
    const id = randomUUID();
    const result = await pool().query<UserRow>(
      `INSERT INTO users (id, name, email, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, password, role, "isActive", "createdAt", "updatedAt"`,
      [id, input.name, input.email, input.password, input.role]
    );
    const row = result.rows[0];
    if (!row) {
      throw new Error("Failed to create user");
    }
    return this.toPublicUser(mapRowToUser(row));
  },

  async revokeAllRefreshTokensForUser(userId: string): Promise<void> {
    await pool().query(
      `UPDATE refresh_tokens
       SET revoked = true
       WHERE "userId" = $1 AND revoked = false`,
      [userId]
    );
  },

  async createRefreshToken(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await pool().query(
      `INSERT INTO refresh_tokens (id, "userId", "tokenHash", "expiresAt", revoked)
       VALUES ($1, $2, $3, $4, false)`,
      [randomUUID(), input.userId, input.tokenHash, input.expiresAt]
    );
  },

  async findRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenRow | null> {
    const result = await pool().query<RefreshTokenRow>(
      `SELECT id, "userId", "tokenHash", "expiresAt", revoked, "createdAt"
       FROM refresh_tokens
       WHERE "tokenHash" = $1
       LIMIT 1`,
      [tokenHash]
    );
    return result.rows[0] ?? null;
  },

  async revokeRefreshTokenByHash(tokenHash: string): Promise<void> {
    await pool().query(
      `UPDATE refresh_tokens
       SET revoked = true
       WHERE "tokenHash" = $1`,
      [tokenHash]
    );
  },

  async updateUserPassword(userId: string, passwordHash: string): Promise<void> {
    await pool().query(
      `UPDATE users
       SET password = $2, "updatedAt" = NOW()
       WHERE id = $1`,
      [userId, passwordHash]
    );
  },

  toPublicUser(user: UserRecord): PublicUser {
    const { password: _password, ...rest } = user;
    return rest;
  },
};
