import { z } from "zod";
import { PUBLIC_REGISTER_ROLES, USER_ROLES } from "@/types";

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(USER_ROLES, {
    error: "Select your role",
  }),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
    email: emailSchema,
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
    role: z.enum(PUBLIC_REGISTER_ROLES, {
      error: "Select a role",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
