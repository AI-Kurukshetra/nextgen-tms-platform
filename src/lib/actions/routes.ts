"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type RouteRow = Database["public"]["Tables"]["routes"]["Row"];

type ActionResult<T> = {
  data: T;
  error: string | null;
};

export async function getRoutes(mode?: string, active?: string): Promise<ActionResult<RouteRow[]>> {
  const supabase = await createClient();

  let query = supabase.from("routes").select("*").order("name");

  if (mode && mode !== "all") {
    query = query.eq("transport_mode", mode as RouteRow["transport_mode"]);
  }

  if (active && active !== "all") {
    query = query.eq("is_active", active === "true");
  }

  const { data, error } = await query;

  return {
    data: data ?? [],
    error: error?.message ?? null,
  };
}
