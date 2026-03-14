"use server";

import { createClient } from "@/lib/supabase/server";

export interface WarehouseInventorySummary {
  warehouse_id: string;
  warehouse_name: string;
  city: string;
  state: string;
  inbound_shipments: number;
  outbound_shipments: number;
  in_transit_related: number;
}

export async function getInventoryVisibility() {
  const supabase = await createClient();

  const [{ data: warehouses }, { data: shipments }] = await Promise.all([
    supabase.from("warehouses").select("id, name, city, state").order("name"),
    supabase
      .from("shipments")
      .select("id, status, origin_warehouse_id, destination_warehouse_id")
      .in("status", ["confirmed", "assigned", "in_transit", "delivered", "delayed"]),
  ]);

  const summary: WarehouseInventorySummary[] = (warehouses ?? []).map((warehouse) => {
    const inbound = (shipments ?? []).filter(
      (shipment) => shipment.destination_warehouse_id === warehouse.id && shipment.status !== "delivered",
    ).length;

    const outbound = (shipments ?? []).filter(
      (shipment) => shipment.origin_warehouse_id === warehouse.id && shipment.status !== "delivered",
    ).length;

    const transitRelated = (shipments ?? []).filter(
      (shipment) =>
        shipment.status === "in_transit" &&
        (shipment.origin_warehouse_id === warehouse.id || shipment.destination_warehouse_id === warehouse.id),
    ).length;

    return {
      warehouse_id: warehouse.id,
      warehouse_name: warehouse.name,
      city: warehouse.city,
      state: warehouse.state,
      inbound_shipments: inbound,
      outbound_shipments: outbound,
      in_transit_related: transitRelated,
    };
  });

  return { data: summary, error: null as string | null };
}
