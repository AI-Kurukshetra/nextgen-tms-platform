import { requireApiRole } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireApiRole(["admin", "dispatcher"]);
  if (auth.response) return auth.response;
  if (!auth.context) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: shipments, error: shipmentsError }, activeCarriers] = await Promise.all([
    auth.context.supabase
      .from("shipments")
      .select("id, status, freight_cost, distance_km, scheduled_delivery, actual_delivery, updated_at"),
    auth.context.supabase.from("carriers").select("id", { count: "exact", head: true }).eq("status", "active"),
  ]);

  if (shipmentsError) {
    return Response.json({ error: shipmentsError.message }, { status: 500 });
  }

  const rows = shipments ?? [];
  const deliveredRows = rows.filter((row) => row.status === "delivered");
  const delayedRows = rows.filter((row) => row.status === "delayed");
  const inTransitRows = rows.filter((row) => row.status === "in_transit");

  const onTimeDelivered = deliveredRows.filter((row) => {
    if (!row.scheduled_delivery) return false;
    const deliveredAt = row.actual_delivery ?? row.updated_at;
    return new Date(deliveredAt).getTime() <= new Date(row.scheduled_delivery).getTime();
  });

  const costRows = rows.filter((row) => row.freight_cost !== null && row.distance_km !== null && Number(row.distance_km) > 0);
  const avgCostPerKm =
    costRows.length === 0
      ? 0
      : Number(
          (
            costRows.reduce((acc, row) => acc + Number(row.freight_cost ?? 0) / Number(row.distance_km ?? 1), 0) /
            costRows.length
          ).toFixed(2),
        );

  return Response.json({
    total_shipments: rows.length,
    delivered_shipments: deliveredRows.length,
    delayed_shipments: delayedRows.length,
    in_transit_shipments: inTransitRows.length,
    on_time_delivery_rate: deliveredRows.length === 0 ? 0 : Math.round((onTimeDelivered.length / deliveredRows.length) * 100),
    avg_cost_per_km: avgCostPerKm,
    active_carriers: activeCarriers.count ?? 0,
  });
}
