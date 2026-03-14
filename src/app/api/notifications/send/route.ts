import { z } from "zod";

import { requireApiRole } from "@/lib/api-auth";
import { sendShipmentNotification } from "@/lib/actions/tracking";

const schema = z.object({
  shipment_id: z.string().uuid(),
  channel: z.enum(["email", "sms"]),
  recipient: z.string().min(3),
  message: z.string().min(3),
});

const querySchema = z.object({
  shipment_id: z.string().uuid(),
});

export async function GET(request: Request) {
  const auth = await requireApiRole(["admin", "dispatcher"]);
  if (auth.response) return auth.response;
  if (!auth.context) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ shipment_id: searchParams.get("shipment_id") });
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "shipment_id is required" }, { status: 400 });
  }

  const { data, error } = await auth.context.supabase
    .from("tracking_events")
    .select("id, description, created_at")
    .eq("shipment_id", parsed.data.shipment_id)
    .eq("event_type", "note_added")
    .like("description", "NOTIF|%")
    .order("created_at", { ascending: false })
    .limit(15);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const notifications = (data ?? [])
    .map((event) => {
      const payloadText = event.description.replace("NOTIF|", "");
      try {
        const payload = JSON.parse(payloadText) as { channel: "email" | "sms"; recipient: string; message: string };
        return {
          id: event.id,
          channel: payload.channel,
          recipient: payload.recipient,
          message: payload.message,
          created_at: event.created_at,
        };
      } catch {
        return null;
      }
    })
    .filter(
      (
        item,
      ): item is { id: string; channel: "email" | "sms"; recipient: string; message: string; created_at: string } =>
        Boolean(item),
    );

  return Response.json({ data: notifications });
}

export async function POST(request: Request) {
  const auth = await requireApiRole(["admin", "dispatcher"]);
  if (auth.response) return auth.response;
  if (!auth.context) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }

  const result = await sendShipmentNotification(
    parsed.data.shipment_id,
    parsed.data.channel,
    parsed.data.recipient,
    parsed.data.message,
  );

  if (result.error) {
    return Response.json({ error: result.error }, { status: 403 });
  }

  return Response.json({ success: true });
}
