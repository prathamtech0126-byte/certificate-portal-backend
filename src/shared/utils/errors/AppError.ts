import { getErrorCodeFromStatus, type ErrorCode } from "./error-codes";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;

  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true, code?: ErrorCode) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code ?? getErrorCodeFromStatus(statusCode);
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
