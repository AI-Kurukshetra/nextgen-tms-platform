import { z } from "zod";

import { requireApiAuth } from "@/lib/api-auth";
import { calculateFreightQuote } from "@/lib/rate-engine";
import { CARGO_TYPES, TRANSPORT_MODES } from "@/types";

const quoteInputSchema = z.object({
  distance_km: z.number().positive(),
  weight_kg: z.number().positive(),
  cargo_type: z.enum(CARGO_TYPES),
  transport_mode: z.enum(TRANSPORT_MODES),
  carrier_rating: z.number().min(1).max(5),
});

export async function POST(request: Request) {
  const auth = await requireApiAuth();
  if (auth.response) return auth.response;
  if (!auth.context) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = quoteInputSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }

  return Response.json(calculateFreightQuote(parsed.data));
}
