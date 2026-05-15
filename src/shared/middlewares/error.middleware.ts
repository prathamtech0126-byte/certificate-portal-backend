import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { env } from "../../config/env";
import { AppError } from "../utils/errors/AppError";
import { ERROR_CODES, getErrorCodeFromStatus } from "../utils/errors/error-codes";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      ok: false,
      error: {
        code: ERROR_CODES.BAD_REQUEST,
        message: "Validation failed",
        status: 400,
        details: err.flatten(),
      },
    });
    return;
  }

  if (err instanceof multer.MulterError) {
    res.status(400).json({
      ok: false,
      error: {
        code: ERROR_CODES.BAD_REQUEST,
        message: err.message,
        status: 400,
      },
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      ok: false,
      error: {
        code: err.code,
        message: err.message,
        status: err.statusCode,
      },
    });
    return;
  }

  const message = err instanceof Error ? err.message : "Could not complete the request";
  res.status(500).json({
    ok: false,
    error: {
      code: getErrorCodeFromStatus(500),
      message: "Could not complete the request",
      status: 500,
      ...(env.NODE_ENV === "development" && { details: message }),
    },
  });
}
