import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import jwt from "jsonwebtoken";
import { AppError } from "../../shared/utils/errors/AppError";
import type { PublicUser, UserRole } from "./user.model";
import { userRepository } from "./user.repository";
import type { ChangePasswordInput, LoginInput, RegisterUserInput } from "./user.validation";

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

function getAccessTokenSecret(): string {
  return process.env.JWT_ACCESS_SECRET || "dev-access-secret";
}

function getRefreshTokenSecret(): string {
  return process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";
}

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export const userService = {
  async register(input: RegisterUserInput): Promise<PublicUser> {
    const email = input.email.toLowerCase().trim();
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AppError("Email already exists", 400);
    }

    const password = await bcrypt.hash(input.password, 10);
    return userRepository.createUser({
      name: input.name.trim(),
      email,
      password,
      role: (input.role as UserRole | undefined) ?? "HR",
    });
  },

  async login(input: LoginInput): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    const email = input.email.toLowerCase().trim();
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    if (!user.isActive) {
      throw new AppError("User is inactive. Contact admin.", 401);
    }

    const passwordMatches = await bcrypt.compare(input.password, user.password);
    if (!passwordMatches) {
      throw new AppError("Invalid credentials", 401);
    }

    const publicUser = userRepository.toPublicUser(user);
    const tokens = this.generateTokens({ id: user.id, role: user.role });
    const refreshTokenHash = this.hashToken(tokens.refreshToken);

    await userRepository.revokeAllRefreshTokensForUser(user.id);
    await userRepository.createRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { user: publicUser, tokens };
  },

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const decoded = jwt.verify(refreshToken, getRefreshTokenSecret()) as {
        userId: string;
        role: UserRole;
      };

      const tokenHash = this.hashToken(refreshToken);
      const tokenRecord = await userRepository.findRefreshTokenByHash(tokenHash);
      if (!tokenRecord) {
        throw new AppError("Refresh token not found", 401);
      }

      if (tokenRecord.revoked) {
        throw new AppError("Refresh token has been revoked", 401);
      }

      if (new Date(tokenRecord.expiresAt) <= new Date()) {
        throw new AppError("Refresh token has expired", 401);
      }

      if (tokenRecord.userId !== decoded.userId) {
        throw new AppError("Refresh token does not match user", 401);
      }

      return jwt.sign(
        { userId: decoded.userId, role: decoded.role },
        getAccessTokenSecret(),
        { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
      );
    } catch {
      throw new AppError("Invalid or expired refresh token", 401);
    }
  },

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;
    const tokenHash = this.hashToken(refreshToken);
    await userRepository.revokeRefreshTokenByHash(tokenHash);
  },

  async changePassword(input: ChangePasswordInput): Promise<void> {
    const email = input.email.toLowerCase().trim();
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    if (!user.isActive) {
      throw new AppError("User is inactive. Contact admin.", 401);
    }

    const isCurrentPasswordValid = await bcrypt.compare(input.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new AppError("Current password is incorrect", 401);
    }

    const newPasswordHash = await bcrypt.hash(input.newPassword, 10);
    await userRepository.updateUserPassword(user.id, newPasswordHash);
    await userRepository.revokeAllRefreshTokensForUser(user.id);
  },

  generateTokens(payload: { id: string; role: UserRole }): AuthTokens {
    return {
      accessToken: jwt.sign(
        { userId: payload.id, role: payload.role },
        getAccessTokenSecret(),
        { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
      ),
      refreshToken: jwt.sign(
        { userId: payload.id, role: payload.role },
        getRefreshTokenSecret(),
        { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
      ),
    };
  },

  hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  },
};
