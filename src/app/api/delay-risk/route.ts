import { z } from "zod";

import { requireApiAuth } from "@/lib/api-auth";
import { calculateDelayRisk } from "@/lib/risk-engine";
import { CARGO_TYPES, SHIPMENT_STATUSES } from "@/types";

const riskInputSchema = z.object({
  status: z.enum(SHIPMENT_STATUSES),
  cargo_type: z.enum(CARGO_TYPES),
  carrier_rating: z.number().min(1).max(5),
  distance_km: z.number().positive().nullable(),
  scheduled_delivery: z.string().datetime({ offset: true }).nullable(),
  weight_kg: z.number().positive(),
});

export async function POST(request: Request) {
  const auth = await requireApiAuth();
  if (auth.response) return auth.response;
  if (!auth.context) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = riskInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }

  return Response.json(calculateDelayRisk(parsed.data));
}
