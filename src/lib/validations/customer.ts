import { z } from "zod";

export const USER_ROLES = ["admin", "dispatcher", "customer"] as const;
const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email");

export const customerUpdateSchema = z.object({
  full_name: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: emailSchema,
});

export const createUserSchema = z.object({
  full_name: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must include at least one letter")
    .regex(/\d/, "Password must include at least one number"),
  role: z.enum(USER_ROLES),
});

export const updateUserRoleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(USER_ROLES),
});

export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
