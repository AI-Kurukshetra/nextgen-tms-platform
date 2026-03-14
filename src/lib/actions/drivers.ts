"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type DriverRow = Database["public"]["Tables"]["drivers"]["Row"];

type ActionResult<T> = {
  data: T;
  error: string | null;
};

export async function getDrivers(status?: string): Promise<ActionResult<DriverRow[]>> {
  const supabase = await createClient();
  let query = supabase
    .from("drivers")
    .select("*, carriers(name)")
    .order("full_name");

  if (status && status !== "all") {
    query = query.eq("status", status as DriverRow["status"]);
  }

  const { data, error } = await query;

  return {
    data: (data as unknown as DriverRow[]) ?? [],
    error: error?.message ?? null,
  };
}

export async function getDriversByCarrier(carrierId: string): Promise<ActionResult<DriverRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drivers")
    .select("*")
    .eq("carrier_id", carrierId)
    .order("full_name");

  return {
    data: data ?? [],
    error: error?.message ?? null,
  };
}

export async function getAvailableDrivers(): Promise<ActionResult<DriverRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drivers")
    .select("*")
    .eq("status", "available")
    .order("full_name");

  return {
    data: data ?? [],
    error: error?.message ?? null,
  };
}

export async function updateDriverStatus(driverId: string, status: DriverRow["status"]): Promise<ActionResult<null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  const { error } = await supabase.from("drivers").update({ status }).eq("id", driverId);

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath("/drivers");
  revalidatePath("/drivers/mobile");

  return { data: null, error: null };
}

export async function getDriverAssignments(driverId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("shipments")
    .select("id, shipment_number, origin_city, destination_city, status, driver_id, scheduled_delivery")
    .in("status", ["assigned", "in_transit", "delayed"])
    .order("scheduled_delivery", { ascending: true });

  if (driverId) {
    query = query.eq("driver_id", driverId);
  }

  const { data, error } = await query;

  return {
    data: data ?? [],
    error: error?.message ?? null,
  };
}
