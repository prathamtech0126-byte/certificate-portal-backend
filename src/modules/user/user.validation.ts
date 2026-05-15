import { z } from "zod";
import { USER_ROLES } from "./user.model";

export const registerUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(6).max(200),
  role: z.enum(USER_ROLES).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const changePasswordSchema = z
  .object({
    email: z.string().trim().email(),
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6).max(200),
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
