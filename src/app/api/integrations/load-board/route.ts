import { z } from "zod";

import { buildLoadBoardPost, type LoadBoardProvider } from "@/lib/integration-mappers";
import { requireApiRole } from "@/lib/api-auth";

const schema = z.object({
  shipment_id: z.string().uuid(),
  provider: z.enum(["nextgen_exchange", "freight_tiger", "trucksuvidha"]).optional(),
});

const querySchema = z.object({
  shipment_id: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  const auth = await requireApiRole(["admin", "dispatcher"]);
  if (auth.response) return auth.response;
  if (!auth.context) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    shipment_id: searchParams.get("shipment_id") ?? undefined,
  });

  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid query" }, { status: 400 });
  }

  let query = auth.context.supabase
    .from("tracking_events")
    .select("id, shipment_id, description, created_at")
    .eq("event_type", "note_added")
    .like("description", "LOAD_BOARD|%")
    .order("created_at", { ascending: false })
    .limit(20);

  if (parsed.data.shipment_id) {
    query = query.eq("shipment_id", parsed.data.shipment_id);
  }

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const history = (data ?? [])
    .map((event) => {
      const raw = event.description.replace("LOAD_BOARD|", "");
      try {
        return {
          id: event.id,
          shipment_id: event.shipment_id,
          created_at: event.created_at,
          payload: JSON.parse(raw) as Record<string, unknown>,
        };
      } catch {
        return null;
      }
    })
    .filter((row): row is { id: string; shipment_id: string; created_at: string; payload: Record<string, unknown> } => Boolean(row));

  return Response.json({ data: history });
}

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
