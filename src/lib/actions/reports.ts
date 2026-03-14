"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ShipmentRow = Database["public"]["Tables"]["shipments"]["Row"];
type CarrierRow = Database["public"]["Tables"]["carriers"]["Row"];

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

export type ReportMetrics = {
  total_shipments: number;
  delivered_shipments: number;
  delayed_shipments: number;
  in_transit_shipments: number;
  on_time_delivery_rate: number;
  avg_cost_per_km: number;
};

export type CarrierPerformance = {
  carrier_id: string;
  carrier_name: string;
  total_shipments: number;
  delivered_shipments: number;
  delayed_shipments: number;
  on_time_rate: number;
};

export type MonthlyKpi = {
  month: string;
  shipments: number;
  delivered: number;
};

export type ReportingPayload = {
  metrics: ReportMetrics;
  status_distribution: Record<ShipmentRow["status"], number>;
  carrier_performance: CarrierPerformance[];
  monthly_kpis: MonthlyKpi[];
};

function getDeliveredAt(shipment: ShipmentRow) {
  if (shipment.actual_delivery) return shipment.actual_delivery;
  if (shipment.status === "delivered") return shipment.updated_at;
  return null;
}

function monthKey(dateValue: string) {
  const date = new Date(dateValue);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, 1)).toLocaleString("en-US", { month: "short", year: "numeric" });
}

export async function getReportingAnalytics(): Promise<ActionResult<ReportingPayload>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Unauthorized" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role ?? null;
  if (role !== "admin" && role !== "dispatcher") return { data: null, error: "Forbidden" };

  const [{ data: shipments, error: shipmentError }, { data: carriers, error: carrierError }] = await Promise.all([
    supabase
      .from("shipments")
      .select("id, status, carrier_id, freight_cost, distance_km, scheduled_delivery, actual_delivery, created_at, updated_at")
      .order("created_at", { ascending: false }),
    supabase.from("carriers").select("id, name").order("name"),
  ]);

  if (shipmentError) return { data: null, error: shipmentError.message };
  if (carrierError) return { data: null, error: carrierError.message };

  const rows = (shipments ?? []) as Pick<
    ShipmentRow,
    | "id"
    | "status"
    | "carrier_id"
    | "freight_cost"
    | "distance_km"
    | "scheduled_delivery"
    | "actual_delivery"
    | "created_at"
    | "updated_at"
  >[];

  const totalShipments = rows.length;
  const deliveredShipments = rows.filter((shipment) => shipment.status === "delivered");
  const delayedShipments = rows.filter((shipment) => shipment.status === "delayed");
  const inTransitShipments = rows.filter((shipment) => shipment.status === "in_transit");

  const onTimeDelivered = deliveredShipments.filter((shipment) => {
    if (!shipment.scheduled_delivery) return false;
    const deliveredAt = getDeliveredAt(shipment as ShipmentRow);
    if (!deliveredAt) return false;
    return new Date(deliveredAt).getTime() <= new Date(shipment.scheduled_delivery).getTime();
  }).length;

  const billedWithDistance = rows.filter(
    (shipment) => shipment.freight_cost !== null && shipment.distance_km !== null && Number(shipment.distance_km) > 0,
  );

  const avgCostPerKm =
    billedWithDistance.length === 0
      ? 0
      : Number(
          (
            billedWithDistance.reduce(
              (acc, shipment) => acc + Number(shipment.freight_cost ?? 0) / Number(shipment.distance_km ?? 1),
              0,
            ) / billedWithDistance.length
          ).toFixed(2),
        );

  const statusDistribution: Record<ShipmentRow["status"], number> = {
    draft: 0,
    confirmed: 0,
    assigned: 0,
    in_transit: 0,
    delivered: 0,
    delayed: 0,
    cancelled: 0,
  };

  for (const shipment of rows) {
    statusDistribution[shipment.status] += 1;
  }

  const carriersById = new Map((carriers ?? []).map((carrier) => [carrier.id, carrier as Pick<CarrierRow, "id" | "name">]));
  const carrierPerformance = Array.from(carriersById.values())
    .map((carrier) => {
      const carrierShipments = rows.filter((shipment) => shipment.carrier_id === carrier.id);
      const delivered = carrierShipments.filter((shipment) => shipment.status === "delivered");
      const delayed = carrierShipments.filter((shipment) => shipment.status === "delayed");
      const onTime = delivered.filter((shipment) => {
        if (!shipment.scheduled_delivery) return false;
        const deliveredAt = getDeliveredAt(shipment as ShipmentRow);
        if (!deliveredAt) return false;
        return new Date(deliveredAt).getTime() <= new Date(shipment.scheduled_delivery).getTime();
      }).length;

      return {
        carrier_id: carrier.id,
        carrier_name: carrier.name,
        total_shipments: carrierShipments.length,
        delivered_shipments: delivered.length,
        delayed_shipments: delayed.length,
        on_time_rate: delivered.length === 0 ? 0 : Math.round((onTime / delivered.length) * 100),
      };
    })
    .filter((row) => row.total_shipments > 0)
    .sort((a, b) => b.total_shipments - a.total_shipments);

  const months = new Map<string, { shipments: number; delivered: number }>();

  for (const shipment of rows) {
    const key = monthKey(shipment.created_at);
    const current = months.get(key) ?? { shipments: 0, delivered: 0 };
    current.shipments += 1;
    if (shipment.status === "delivered") current.delivered += 1;
    months.set(key, current);
  }

  const monthlyKpis = Array.from(months.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-6)
    .map(([key, value]) => ({
      month: monthLabel(key),
      shipments: value.shipments,
      delivered: value.delivered,
    }));

  return {
    data: {
      metrics: {
        total_shipments: totalShipments,
        delivered_shipments: deliveredShipments.length,
        delayed_shipments: delayedShipments.length,
        in_transit_shipments: inTransitShipments.length,
        on_time_delivery_rate: deliveredShipments.length === 0 ? 0 : Math.round((onTimeDelivered / deliveredShipments.length) * 100),
        avg_cost_per_km: avgCostPerKm,
      },
      status_distribution: statusDistribution,
      carrier_performance: carrierPerformance,
      monthly_kpis: monthlyKpis,
    },
    error: null,
  };
}
