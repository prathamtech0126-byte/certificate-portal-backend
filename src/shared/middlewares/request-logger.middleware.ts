import type { NextFunction, Request, Response } from "express";
import { sanitizeObjectForLogs } from "../utils/sanitize";

export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  if (process.env.NODE_ENV !== "production") {
    const payload = sanitizeObjectForLogs(req.body ?? {});
    console.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        ip: req.ip,
        method: req.method,
        path: req.originalUrl,
        body: payload,
      }),
    );
  }
  next();
}
