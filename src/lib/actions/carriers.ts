"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type CarrierRow = Database["public"]["Tables"]["carriers"]["Row"];

type ActionResult<T> = {
  data: T;
  error: string | null;
};

export async function getCarriers(status?: string, mode?: string): Promise<ActionResult<CarrierRow[]>> {
  const supabase = await createClient();

  let query = supabase.from("carriers").select("*").order("name");

  if (status && status !== "all") {
    query = query.eq("status", status as CarrierRow["status"]);
  }

  if (mode && mode !== "all") {
    query = query.eq("transport_mode", mode as CarrierRow["transport_mode"]);
  }

  const { data, error } = await query;

  return {
    data: data ?? [],
    error: error?.message ?? null,
  };
}

export async function getActiveCarriers(): Promise<ActionResult<CarrierRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("carriers")
    .select("*")
    .eq("status", "active")
    .order("name");

  return {
    data: data ?? [],
    error: error?.message ?? null,
  };
}
