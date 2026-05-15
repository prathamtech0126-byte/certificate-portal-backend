import { z } from "zod";

if (!process.env.FRONTEND_URL && process.env.FRONTEND_ORIGIN) {
  process.env.FRONTEND_URL = process.env.FRONTEND_ORIGIN;
}

if (process.env.NODE_ENV !== "production") {
  process.env.FRONTEND_URL ??= "http://localhost:5173";
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  FRONTEND_URL: z.string().min(1),
  FRONTEND_ORIGIN: z.string().min(1).optional(),
  LEAD_API_KEY: z.string().min(1).optional(),

  SERVER_URL: z.string().url().optional(),

  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASS: z.string().min(1).optional(),
  SMTP_FROM: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
