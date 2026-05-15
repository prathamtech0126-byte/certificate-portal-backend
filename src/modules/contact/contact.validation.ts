import { z } from "zod";

function normalizeContactBody(input: unknown): unknown {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return input;
  }
  const o = { ...(input as Record<string, unknown>) };

  const fullName = o.fullName ?? o.fullname;
  if (typeof fullName === "string") {
    o.fullName = fullName;
  }
  delete o.fullname;

  if (o.subject === "" || o.subject === null) {
    o.subject = undefined;
  }

  return o;
}

export const createContactSchema = z.preprocess(
  normalizeContactBody,
  z.object({
    fullName: z.string().trim().min(2, "Full name is required").max(200),
    email: z.string().trim().email("A valid email address is required").max(254),
    subject: z.string().trim().max(200).optional(),
    message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
  })
);

export type CreateContactInput = z.infer<typeof createContactSchema>;
