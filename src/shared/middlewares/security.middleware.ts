import type { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../../config/env";
import { AppError } from "../utils/errors/AppError";
import { ERROR_CODES } from "../utils/errors/error-codes";

export const leadRateLimiter = rateLimit({
  windowMs: 60_000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: {
      code: ERROR_CODES.TOO_MANY_REQUESTS,
      message: "Too many requests. Please try again later.",
      status: 429,
    },
  },
});

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: {
      code: ERROR_CODES.TOO_MANY_REQUESTS,
      message: "Too many requests. Please try again later.",
      status: 429,
    },
  },
});

export const publicReadRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: {
      code: ERROR_CODES.TOO_MANY_REQUESTS,
      message: "Too many requests. Please try again later.",
      status: 429,
    },
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: {
      code: ERROR_CODES.TOO_MANY_REQUESTS,
      message: "Too many login attempts. Please try again later.",
      status: 429,
    },
  },
});

export const adminApiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: {
      code: ERROR_CODES.TOO_MANY_REQUESTS,
      message: "Too many admin requests. Please try again later.",
      status: 429,
    },
  },
});

export function requireLeadApiKey(req: Request, _res: Response, next: NextFunction): void {
  if (!env.LEAD_API_KEY) return next();
  const provided = req.header("x-api-key")?.trim();
  if (!provided || provided !== env.LEAD_API_KEY) {
    next(new AppError("Unauthorized", 401));
    return;
  }
  next();
}
