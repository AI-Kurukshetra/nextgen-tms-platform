import { redirect } from "next/navigation";

import { ShipmentForm } from "@/components/shipments/ShipmentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveCarriers } from "@/lib/actions/carriers";
import { getAvailableDrivers } from "@/lib/actions/drivers";
import { getRoutes } from "@/lib/actions/routes";
import { createClient } from "@/lib/supabase/server";
import { getActiveWarehouses } from "@/lib/actions/warehouses";

export default async function NewShipmentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role ?? null;

  if (role === "customer") {
    redirect("/shipments");
  }

  const [carriers, drivers, routes, warehouses] = await Promise.all([
    getActiveCarriers(),
    getAvailableDrivers(),
    getRoutes(),
    getActiveWarehouses(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Create New Shipment</h1>
      <Card>
        <CardHeader>
          <CardTitle>Shipment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ShipmentForm
            carriers={carriers.data ?? []}
            drivers={drivers.data ?? []}
            routes={routes.data ?? []}
            warehouses={warehouses.data ?? []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
