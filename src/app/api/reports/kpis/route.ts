import { requireApiRole } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireApiRole(["admin", "dispatcher"]);
  if (auth.response) return auth.response;
  if (!auth.context) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [shipments, delivered, delayed, activeCarriers] = await Promise.all([
    auth.context.supabase.from("shipments").select("id", { count: "exact", head: true }),
    auth.context.supabase.from("shipments").select("id", { count: "exact", head: true }).eq("status", "delivered"),
    auth.context.supabase.from("shipments").select("id", { count: "exact", head: true }).eq("status", "delayed"),
    auth.context.supabase.from("carriers").select("id", { count: "exact", head: true }).eq("status", "active"),
  ]);

  return Response.json({
    total_shipments: shipments.count ?? 0,
    delivered_shipments: delivered.count ?? 0,
    delayed_shipments: delayed.count ?? 0,
    active_carriers: activeCarriers.count ?? 0,
  });
}
