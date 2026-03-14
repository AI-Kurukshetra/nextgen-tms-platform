"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createShipmentSchema, type CreateShipmentInput } from "@/lib/validations/shipment";
import type { Database } from "@/types/database";
import type { ShipmentStatus } from "@/types";

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

type ShipmentRow = Database["public"]["Tables"]["shipments"]["Row"];

const NEXT_STATUS_MAP: Record<ShipmentStatus, ShipmentStatus[]> = {
  draft: ["confirmed", "cancelled"],
  confirmed: ["assigned", "cancelled"],
  assigned: ["in_transit"],
  in_transit: ["delayed", "delivered"],
  delayed: ["in_transit"],
  delivered: [],
  cancelled: [],
};

function buildShipmentNumber() {
  return `TMS-${Date.now()}`;
}

function emptyToNull(value?: string) {
  if (!value) return null;
  return value;
}

async function getMyRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, role: null as string | null };
  }

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return { supabase, user, role: data?.role ?? null };
}

export async function getShipments(status?: string, search?: string): Promise<ActionResult<ShipmentRow[]>> {
  const supabase = await createClient();

  let query = supabase
    .from("shipments")
    .select(
      `
      *,
      carriers(name, rating, transport_mode),
      drivers(full_name)
    `,
    )
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status as ShipmentRow["status"]);
  }

  if (search) {
    query = query.or(
      `shipment_number.ilike.%${search}%,origin_city.ilike.%${search}%,destination_city.ilike.%${search}%`,
    );
  }

  const { data, error } = await query;

  return {
    data: (data as unknown as ShipmentRow[]) ?? [],
    error: error?.message ?? null,
  };
}

export async function getShipmentById(id: string): Promise<ActionResult<ShipmentRow & { tracking_events: Database["public"]["Tables"]["tracking_events"]["Row"][] }>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shipments")
    .select(
      `
      *,
      carriers(*),
      drivers(*),
      routes(*),
      origin_warehouse:warehouses!origin_warehouse_id(*),
      dest_warehouse:warehouses!destination_warehouse_id(*)
    `,
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? "Shipment not found" };
  }

  const { data: trackingEvents } = await supabase
    .from("tracking_events")
    .select("*")
    .eq("shipment_id", id)
    .order("created_at", { ascending: false });

  return {
    data: {
      ...(data as unknown as ShipmentRow),
      tracking_events: trackingEvents ?? [],
    },
    error: null,
  };
}

export async function createShipment(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = createShipmentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Invalid shipment data",
    };
  }

  const { supabase, user, role } = await getMyRole();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  if (role !== "admin" && role !== "dispatcher") {
    return { data: null, error: "Only admin/dispatcher can create shipments" };
  }

  const payload = parsed.data as CreateShipmentInput;

  const { data, error } = await supabase
    .from("shipments")
    .insert({
      shipment_number: buildShipmentNumber(),
      origin_city: payload.origin_city,
      origin_state: payload.origin_state,
      destination_city: payload.destination_city,
      destination_state: payload.destination_state,
      cargo_type: payload.cargo_type,
      weight_kg: payload.weight_kg,
      volume_cbm: payload.volume_cbm ?? null,
      carrier_id: emptyToNull(payload.carrier_id),
      driver_id: emptyToNull(payload.driver_id),
      route_id: emptyToNull(payload.route_id),
      customer_id: emptyToNull(payload.customer_id),
      origin_warehouse_id: emptyToNull(payload.origin_warehouse_id),
      destination_warehouse_id: emptyToNull(payload.destination_warehouse_id),
      scheduled_pickup: emptyToNull(payload.scheduled_pickup),
      scheduled_delivery: emptyToNull(payload.scheduled_delivery),
      freight_cost: payload.freight_cost ?? null,
      notes: payload.notes ?? null,
      created_by: user.id,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? "Unable to create shipment" };
  }

  revalidatePath("/shipments");

  return { data: { id: data.id }, error: null };
}

export async function updateShipmentStatus(id: string, status: ShipmentStatus): Promise<ActionResult<null>> {
  const { supabase, user, role } = await getMyRole();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  if (role !== "admin" && role !== "dispatcher") {
    return { data: null, error: "Forbidden" };
  }

  const { data: currentShipment, error: shipmentError } = await supabase
    .from("shipments")
    .select("status")
    .eq("id", id)
    .single();

  if (shipmentError || !currentShipment) {
    return { data: null, error: shipmentError?.message ?? "Shipment not found" };
  }

  const currentStatus = currentShipment.status;
  if (currentStatus === status) {
    return { data: null, error: null };
  }

  const allowedNext = NEXT_STATUS_MAP[currentStatus];
  if (!allowedNext.includes(status)) {
    return { data: null, error: `Invalid status transition from ${currentStatus} to ${status}` };
  }

  const { error } = await supabase.from("shipments").update({ status }).eq("id", id);

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath("/shipments");
  revalidatePath(`/shipments/${id}`);

  return { data: null, error: null };
}

export async function deleteShipment(id: string): Promise<ActionResult<null>> {
  const { supabase, user, role } = await getMyRole();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  if (role !== "admin") {
    return { data: null, error: "Only admins can delete shipments" };
  }

  const { error } = await supabase.from("shipments").delete().eq("id", id);

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath("/shipments");

  return { data: null, error: null };
}
