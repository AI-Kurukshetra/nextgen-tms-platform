import { z } from "zod";

import { evaluateShipmentCompliance } from "@/lib/compliance-engine";
import { requireApiRole } from "@/lib/api-auth";

const schema = z.object({ shipment_id: z.string().uuid() });

export async function POST(request: Request) {
  const auth = await requireApiRole(["admin", "dispatcher"]);
  if (auth.response) return auth.response;
  if (!auth.context) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }

  const { data: shipment, error } = await auth.context.supabase
    .from("shipments")
    .select("*")
    .eq("id", parsed.data.shipment_id)
    .single();

  if (error || !shipment) {
    return Response.json({ error: error?.message ?? "Shipment not found" }, { status: 404 });
  }

  return Response.json(evaluateShipmentCompliance(shipment));
}
