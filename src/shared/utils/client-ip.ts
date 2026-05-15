import type { Request } from "express";

/**
 * Best-effort client IP for logs (respects `trust proxy` when set on the app).
 */
export function getClientIp(req: Request): string | null {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0]?.trim() ?? null;
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(",")[0]?.trim() ?? null;
  }
  return req.ip ?? req.socket?.remoteAddress ?? null;
}
