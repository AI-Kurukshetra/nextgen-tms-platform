import { z } from "zod";

import { requireApiAuth, requireApiRole } from "@/lib/api-auth";

const querySchema = z.object({
  shipment_id: z.string().uuid(),
});

const upsertSchema = z.object({
  shipment_id: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speed_kmph: z.number().min(0).max(220).nullable().optional(),
  heading_degrees: z.number().min(0).max(360).nullable().optional(),
  accuracy_meters: z.number().min(0).max(1000).nullable().optional(),
  recorded_at: z.string().datetime({ offset: true }).optional(),
});

export async function GET(request: Request) {
  const auth = await requireApiAuth();
  if (auth.response) return auth.response;
  if (!auth.context) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ shipment_id: searchParams.get("shipment_id") });

  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid query" }, { status: 400 });
  }

  const { data, error } = await auth.context.supabase
    .from("gps_locations")
    .select("id, shipment_id, latitude, longitude, speed_kmph, heading_degrees, accuracy_meters, recorded_at")
    .eq("shipment_id", parsed.data.shipment_id)
    .order("recorded_at", { ascending: false })
    .limit(10);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    latest: data?.[0] ?? null,
    points: data ?? [],
  });
}

export async function POST(request: Request) {
  const auth = await requireApiRole(["admin", "dispatcher"]);
  if (auth.response) return auth.response;
  if (!auth.context) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = upsertSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }

  const payload = parsed.data;

  const { error } = await auth.context.supabase.from("gps_locations").insert({
    shipment_id: payload.shipment_id,
    latitude: payload.latitude,
    longitude: payload.longitude,
    speed_kmph: payload.speed_kmph ?? null,
    heading_degrees: payload.heading_degrees ?? null,
    accuracy_meters: payload.accuracy_meters ?? null,
    recorded_at: payload.recorded_at ?? new Date().toISOString(),
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  await auth.context.supabase.from("tracking_events").insert({
    shipment_id: payload.shipment_id,
    event_type: "location_update",
    location: `${payload.latitude.toFixed(5)}, ${payload.longitude.toFixed(5)}`,
    description: `Live GPS ping at ${payload.latitude.toFixed(5)}, ${payload.longitude.toFixed(5)}`,
    created_by: auth.context.userId,
  });

  return Response.json({ success: true });
}
