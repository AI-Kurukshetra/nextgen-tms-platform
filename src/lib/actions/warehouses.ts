"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type WarehouseRow = Database["public"]["Tables"]["warehouses"]["Row"];

type ActionResult<T> = {
  data: T;
  error: string | null;
};

export async function getWarehouses(status?: string): Promise<ActionResult<WarehouseRow[]>> {
  const supabase = await createClient();

  let query = supabase.from("warehouses").select("*").order("name");

  if (status && status !== "all") {
    query = query.eq("status", status as WarehouseRow["status"]);
  }

  const { data, error } = await query;

  return {
    data: data ?? [],
    error: error?.message ?? null,
  };
}

export async function getActiveWarehouses(): Promise<ActionResult<WarehouseRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("warehouses")
    .select("*")
    .eq("status", "active")
    .order("name");

  return {
    data: data ?? [],
    error: error?.message ?? null,
  };
}
