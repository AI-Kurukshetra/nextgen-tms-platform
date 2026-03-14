import { z } from "zod";

import { TRANSPORT_MODES } from "@/types";

export const carrierSchema = z.object({
  name: z.string().trim().min(1, "Carrier name is required"),
  code: z.string().trim().min(1, "Carrier code is required"),
  transport_mode: z.enum(TRANSPORT_MODES),
  contact_name: z.string().trim().optional(),
  contact_email: z.email("Enter a valid email").optional().or(z.literal("")),
  contact_phone: z.string().trim().optional(),
  rating: z.coerce.number().min(1).max(5).default(3),
  status: z.enum(["active", "inactive", "suspended"]),
  notes: z.string().trim().optional(),
});

export type CarrierInput = z.infer<typeof carrierSchema>;
