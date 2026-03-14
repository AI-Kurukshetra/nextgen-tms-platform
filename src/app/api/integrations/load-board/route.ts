import { z } from "zod";

import { buildLoadBoardPost, type LoadBoardProvider } from "@/lib/integration-mappers";
import { requireApiRole } from "@/lib/api-auth";

const schema = z.object({
  shipment_id: z.string().uuid(),
  provider: z.enum(["nextgen_exchange", "freight_tiger", "trucksuvidha"]).optional(),
});

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

  const provider: LoadBoardProvider = parsed.data.provider ?? "nextgen_exchange";
  const payload = buildLoadBoardPost(shipment, provider);

  await auth.context.supabase.from("tracking_events").insert({
    shipment_id: shipment.id,
    event_type: "note_added",
    description: `LOAD_BOARD|${JSON.stringify(payload)}`,
    created_by: auth.context.userId,
  });

  return Response.json({ success: true, payload });
}
