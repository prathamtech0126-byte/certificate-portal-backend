import { z } from "zod";

/** Accepts common Postman mistakes: `fullname` → `fullName`, `"true"`/`"false"` → boolean for `isVerified`. */
function normalizeCreateStudentBody(input: unknown): unknown {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return input;
  }
  const o = { ...(input as Record<string, unknown>) };

  const fullName = o.fullName ?? o.fullname;
  if (typeof fullName === "string") {
    o.fullName = fullName;
  }
  delete o.fullname;

  if (typeof o.isVerified === "string") {
    const s = o.isVerified.trim().toLowerCase();
    if (s === "true" || s === "1" || s === "yes") {
      o.isVerified = true;
    } else if (s === "false" || s === "0" || s === "no") {
      o.isVerified = false;
    }
  }

  if (o.email === "" || o.email === null) {
    o.email = undefined;
  }

  return o;
}

export const createStudentSchema = z.preprocess(
  normalizeCreateStudentBody,
  z.object({
    studentId: z.string().trim().min(4).max(64).optional(),
    fullName: z.string().trim().min(2).max(200),
    mobile: z.string().trim().max(30).optional(),
    /** Omit or use a valid address; `test@123` is not a valid email. */
    email: z.string().trim().email().optional(),
    courseName: z.string().trim().max(200).optional(),
    instituteName: z.string().trim().max(200).optional(),
    isVerified: z.boolean().optional(),
  })
);

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
