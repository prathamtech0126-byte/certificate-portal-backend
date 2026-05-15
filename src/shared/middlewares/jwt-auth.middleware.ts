import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/errors/AppError";

export type JwtPayload = { userId: string; role: string };

declare global {
  namespace Express {
    interface Request {
      adminUser?: JwtPayload;
    }
  }
}

function getAccessSecret(): string {
  return process.env.JWT_ACCESS_SECRET ?? "dev-access-secret";
}

export function requireJwtAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Unauthorized", 401);
    }

    const token = authHeader.slice(7).trim();
    const decoded = jwt.verify(token, getAccessSecret()) as JwtPayload;
    req.adminUser = decoded;
    next();
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
      return;
    }
    next(new AppError("Unauthorized", 401));
  }
}

export function requireAdminOrHr(req: Request, _res: Response, next: NextFunction): void {
  if (!req.adminUser || !["ADMIN", "HR"].includes(req.adminUser.role)) {
    next(new AppError("Forbidden", 403));
    return;
  }
  next();
}
