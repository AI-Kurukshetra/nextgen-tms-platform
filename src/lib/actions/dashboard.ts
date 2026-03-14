"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardStats() {
  const supabase = await createClient();

  const [totalShipments, inTransit, delivered, activeCarriers, availableDrivers, delayed] =
    await Promise.all([
      supabase.from("shipments").select("id", { count: "exact", head: true }),
      supabase
        .from("shipments")
        .select("id", { count: "exact", head: true })
        .eq("status", "in_transit"),
      supabase
        .from("shipments")
        .select("id", { count: "exact", head: true })
        .eq("status", "delivered"),
      supabase
        .from("carriers")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("drivers")
        .select("id", { count: "exact", head: true })
        .eq("status", "available"),
      supabase
        .from("shipments")
        .select("id", { count: "exact", head: true })
        .eq("status", "delayed"),
    ]);

  return {
    totalShipments: totalShipments.count ?? 0,
    inTransit: inTransit.count ?? 0,
    delivered: delivered.count ?? 0,
    activeCarriers: activeCarriers.count ?? 0,
    availableDrivers: availableDrivers.count ?? 0,
    delayed: delayed.count ?? 0,
  };
}
