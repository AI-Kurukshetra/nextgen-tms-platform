import { buildEdi214 } from "@/lib/integration-mappers";
import { requireApiRole } from "@/lib/api-auth";

export async function GET(request: Request) {
  const auth = await requireApiRole(["admin", "dispatcher"]);
  if (auth.response) return auth.response;
  if (!auth.context) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const shipmentId = searchParams.get("shipment_id");

  if (!shipmentId) {
    return Response.json({ error: "shipment_id is required" }, { status: 400 });
  }

  const { data: shipment, error } = await auth.context.supabase
    .from("shipments")
    .select("*")
    .eq("id", shipmentId)
    .single();

  if (error || !shipment) {
    return Response.json({ error: error?.message ?? "Shipment not found" }, { status: 404 });
  }

  return Response.json({ message_type: "214", payload: buildEdi214(shipment) });
}
