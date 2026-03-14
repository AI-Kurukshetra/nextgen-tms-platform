import Link from "next/link";
import { redirect } from "next/navigation";

import { ShipmentStatusBadge } from "@/components/shipments/ShipmentStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function CustomerPortalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();

  if (profile?.role !== "customer") {
    redirect("/dashboard");
  }

  const { data: shipments } = await supabase
    .from("shipments")
    .select("id, shipment_number, origin_city, destination_city, status, scheduled_delivery")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Customer Portal</h1>
      <p className="text-sm text-gray-600">Welcome {profile?.full_name}. Track your shipments and delivery milestones.</p>

      {(shipments ?? []).length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-gray-600">
            No shipments are assigned to your account yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {(shipments ?? []).map((shipment) => (
            <Link key={shipment.id} href={`/shipments/${shipment.id}`}>
              <Card className="hover:border-gray-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{shipment.shipment_number}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-700">
                  <p>{shipment.origin_city} to {shipment.destination_city}</p>
                  <ShipmentStatusBadge status={shipment.status} />
                  <p>Scheduled Delivery: {formatDate(shipment.scheduled_delivery)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
