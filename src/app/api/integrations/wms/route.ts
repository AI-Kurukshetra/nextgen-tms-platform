import { z } from "zod";

import { requireApiRole } from "@/lib/api-auth";
import type { Database } from "@/types/database";

type ShipmentStatus = Database["public"]["Tables"]["shipments"]["Row"]["status"];

const postSchema = z.object({
  shipment_id: z.string().uuid(),
  warehouse_code: z.string().trim().min(2),
  movement: z.enum(["inbound_received", "outbound_dispatched"]),
  note: z.string().trim().max(300).optional(),
});

const querySchema = z.object({
  shipment_id: z.string().uuid().optional(),
  warehouse_code: z.string().trim().min(2).optional(),
});

function nextStatusForMovement(current: ShipmentStatus, movement: "inbound_received" | "outbound_dispatched"): ShipmentStatus {
  if (movement === "outbound_dispatched") {
    if (current === "confirmed" || current === "assigned" || current === "delayed") return "in_transit";
    return current;
  }

  if (current === "in_transit" || current === "delayed") return "delivered";
  return current;
}

export async function GET(request: Request) {
  const auth = await requireApiRole(["admin", "dispatcher"]);
  if (auth.response) return auth.response;
  if (!auth.context) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    shipment_id: searchParams.get("shipment_id") ?? undefined,
    warehouse_code: searchParams.get("warehouse_code") ?? undefined,
  });

  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid query" }, { status: 400 });
  }

  let eventQuery = auth.context.supabase
    .from("tracking_events")
    .select("id, shipment_id, description, created_at")
    .eq("event_type", "location_update")
    .like("description", "WMS|%")
    .order("created_at", { ascending: false })
    .limit(25);

  if (parsed.data.shipment_id) {
    eventQuery = eventQuery.eq("shipment_id", parsed.data.shipment_id);
  }

  const { data: events, error: eventsError } = await eventQuery;
  if (eventsError) {
    return Response.json({ error: eventsError.message }, { status: 500 });
  }

  const logs = (events ?? [])
    .map((event) => {
      const raw = event.description.replace("WMS|", "");
      try {
        return {
          id: event.id,
          shipment_id: event.shipment_id,
          created_at: event.created_at,
          payload: JSON.parse(raw) as {
            warehouse_code: string;
            movement: "inbound_received" | "outbound_dispatched";
            note: string | null;
            status_before: ShipmentStatus;
            status_after: ShipmentStatus;
            recorded_at: string;
          },
        };
      } catch {
        return null;
      }
    })
    .filter(
      (
        row,
      ): row is {
        id: string;
        shipment_id: string;
        created_at: string;
        payload: {
          warehouse_code: string;
          movement: "inbound_received" | "outbound_dispatched";
          note: string | null;
          status_before: ShipmentStatus;
          status_after: ShipmentStatus;
          recorded_at: string;
        };
      } => Boolean(row),
    )
    .filter((row) =>
      parsed.data.warehouse_code ? row.payload.warehouse_code.toLowerCase() === parsed.data.warehouse_code.toLowerCase() : true,
    );

  let pending_manifest: {
    shipment_id: string;
    shipment_number: string;
    status: ShipmentStatus;
    origin_city: string;
    destination_city: string;
  }[] = [];

  if (parsed.data.warehouse_code) {
    const { data: warehouse } = await auth.context.supabase
      .from("warehouses")
      .select("id")
      .eq("code", parsed.data.warehouse_code.toUpperCase())
      .maybeSingle();

    if (warehouse) {
      const { data: shipments } = await auth.context.supabase
        .from("shipments")
        .select("id, shipment_number, status, origin_city, destination_city")
        .or(`origin_warehouse_id.eq.${warehouse.id},destination_warehouse_id.eq.${warehouse.id}`)
        .in("status", ["confirmed", "assigned", "in_transit", "delayed"])
        .order("created_at", { ascending: false })
        .limit(20);

      pending_manifest = (shipments ?? []).map((shipment) => ({
        shipment_id: shipment.id,
        shipment_number: shipment.shipment_number,
        status: shipment.status,
        origin_city: shipment.origin_city,
        destination_city: shipment.destination_city,
      }));
    }
  }

  return Response.json({ data: { logs, pending_manifest } });
}

export async function POST(request: Request) {
  const auth = await requireApiRole(["admin", "dispatcher"]);
  if (auth.response) return auth.response;
  if (!auth.context) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = postSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }

  const payload = parsed.data;
  const normalizedWarehouseCode = payload.warehouse_code.toUpperCase();

  const [{ data: shipment, error: shipmentError }, { data: warehouse, error: warehouseError }] = await Promise.all([
    auth.context.supabase
      .from("shipments")
      .select("id, shipment_number, status, origin_warehouse_id, destination_warehouse_id")
      .eq("id", payload.shipment_id)
      .single(),
    auth.context.supabase.from("warehouses").select("id, code, name").eq("code", normalizedWarehouseCode).maybeSingle(),
  ]);

  if (shipmentError || !shipment) {
    return Response.json({ error: shipmentError?.message ?? "Shipment not found" }, { status: 404 });
  }

  if (warehouseError || !warehouse) {
    return Response.json({ error: warehouseError?.message ?? "Warehouse code not found" }, { status: 404 });
  }

  if (shipment.origin_warehouse_id !== warehouse.id && shipment.destination_warehouse_id !== warehouse.id) {
    return Response.json({ error: "Shipment is not linked to the provided warehouse" }, { status: 400 });
  }

  const statusBefore = shipment.status;
  const statusAfter = nextStatusForMovement(shipment.status, payload.movement);

  const updatePayload: Partial<Database["public"]["Tables"]["shipments"]["Update"]> = {};
  if (statusAfter !== statusBefore) {
    updatePayload.status = statusAfter;
  }
  if (payload.movement === "outbound_dispatched") {
    updatePayload.actual_pickup = new Date().toISOString();
  }
  if (payload.movement === "inbound_received" && statusAfter === "delivered") {
    updatePayload.actual_delivery = new Date().toISOString();
  }

  if (Object.keys(updatePayload).length > 0) {
    const { error: updateError } = await auth.context.supabase
      .from("shipments")
      .update(updatePayload)
      .eq("id", shipment.id);

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 });
    }
  }

  const auditPayload = {
    warehouse_code: normalizedWarehouseCode,
    movement: payload.movement,
    note: payload.note ?? null,
    status_before: statusBefore,
    status_after: statusAfter,
    recorded_at: new Date().toISOString(),
  };

  const { error: logError } = await auth.context.supabase.from("tracking_events").insert({
    shipment_id: shipment.id,
    event_type: "location_update",
    description: `WMS|${JSON.stringify(auditPayload)}`,
    location: warehouse.name,
    created_by: auth.context.userId,
  });

  if (logError) {
    return Response.json({ error: logError.message }, { status: 500 });
  }

  return Response.json({
    success: true,
    data: {
      shipment_id: shipment.id,
      shipment_number: shipment.shipment_number,
      status_before: statusBefore,
      status_after: statusAfter,
    },
  });
}
