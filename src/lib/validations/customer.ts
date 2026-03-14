import { z } from "zod";

export const customerUpdateSchema = z.object({
  full_name: z.string().trim().min(2),
  email: z.email(),
});

export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
