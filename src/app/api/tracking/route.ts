import { z } from "zod";

import { requireApiAuth } from "@/lib/api-auth";

const querySchema = z.object({ shipment_id: z.string().uuid() });

export async function GET(request: Request) {
  const auth = await requireApiAuth();
  if (auth.response) return auth.response;
  if (!auth.context) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ shipment_id: searchParams.get("shipment_id") });

  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "shipment_id is required" }, { status: 400 });
  }

  const { data, error } = await auth.context.supabase
    .from("tracking_events")
    .select("*")
    .eq("shipment_id", parsed.data.shipment_id)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data: data ?? [] });
}
