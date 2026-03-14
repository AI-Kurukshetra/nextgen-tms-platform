import { z } from "zod";

import { requireApiRole } from "@/lib/api-auth";
import { sendShipmentNotification } from "@/lib/actions/tracking";

const schema = z.object({
  shipment_id: z.string().uuid(),
  channel: z.enum(["email", "sms"]),
  recipient: z.string().min(3),
  message: z.string().min(3),
});

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
