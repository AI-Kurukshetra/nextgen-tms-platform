import { z } from "zod";

import { CARGO_TYPES } from "@/types";

const optionalUuid = z.union([z.literal(""), z.uuid()]).optional();

const optionalDateTime = z
  .string()
  .optional()
  .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), "Invalid datetime value");

export const createShipmentSchema = z.object({
  origin_city: z.string().trim().min(1, "Origin city is required"),
  origin_state: z.string().trim().min(1, "Origin state is required"),
  destination_city: z.string().trim().min(1, "Destination city is required"),
  destination_state: z.string().trim().min(1, "Destination state is required"),
  cargo_type: z.enum(CARGO_TYPES),
  weight_kg: z.coerce.number().positive("Weight must be greater than 0"),
  volume_cbm: z.coerce.number().positive("Volume must be greater than 0").optional(),
  carrier_id: optionalUuid,
  driver_id: optionalUuid,
  route_id: optionalUuid,
  origin_warehouse_id: optionalUuid,
  destination_warehouse_id: optionalUuid,
  scheduled_pickup: optionalDateTime,
  scheduled_delivery: optionalDateTime,
  freight_cost: z.coerce.number().min(0, "Freight cost cannot be negative").optional(),
  notes: z.string().trim().optional(),
});

export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;
