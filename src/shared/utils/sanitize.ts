import validator from "validator";

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "");
}

export function sanitizeText(value: string): string {
  return validator.escape(stripHtml(normalizeWhitespace(value)));
}

export function sanitizeMultilineText(value: string): string {
  return validator.escape(stripHtml(value)).trim();
}

export function sanitizeEmail(value: string): string {
  const normalized = validator.normalizeEmail(value.trim(), { gmail_remove_dots: false });
  if (!normalized || typeof normalized !== "string") {
    return value.trim().toLowerCase();
  }
  return normalized;
}

export function sanitizePhone(value: string): string {
  return normalizeWhitespace(value).replace(/[^\d+\-()\s]/g, "");
}

export function sanitizeObjectForLogs<T>(payload: T): T {
  const asJson = JSON.stringify(payload);
  return JSON.parse(asJson) as T;
}
