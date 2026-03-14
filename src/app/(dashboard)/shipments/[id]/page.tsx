import { notFound, redirect } from "next/navigation";
import { Route, Truck, User, Warehouse } from "lucide-react";

import { DeleteShipmentDialog } from "@/components/shipments/DeleteShipmentDialog";
import { DelayRiskBadge } from "@/components/shipments/DelayRiskBadge";
import { DocumentManager } from "@/components/shipments/DocumentManager";
import { FreightAuditCard } from "@/components/shipments/FreightAuditCard";
import { IntegrationPanel } from "@/components/shipments/IntegrationPanel";
import { LoadPlanningCard } from "@/components/shipments/LoadPlanningCard";
import { LiveLocationCard } from "@/components/shipments/LiveLocationCard";
import { NotificationSender } from "@/components/shipments/NotificationSender";
import { ShipmentStatusBadge } from "@/components/shipments/ShipmentStatusBadge";
import { ShipmentStatusUpdater } from "@/components/shipments/ShipmentStatusUpdater";
import { TrackingTimeline } from "@/components/shipments/TrackingTimeline";
import { ComplianceCard } from "@/components/shipments/ComplianceCard";
import { getShipmentDocuments } from "@/lib/actions/tracking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getShipmentById } from "@/lib/actions/shipments";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { Database } from "@/types/database";

type ShipmentDetails = Database["public"]["Tables"]["shipments"]["Row"] & {
  carriers?: Database["public"]["Tables"]["carriers"]["Row"] | null;
  drivers?: Database["public"]["Tables"]["drivers"]["Row"] | null;
  routes?: Database["public"]["Tables"]["routes"]["Row"] | null;
  origin_warehouse?: Database["public"]["Tables"]["warehouses"]["Row"] | null;
  dest_warehouse?: Database["public"]["Tables"]["warehouses"]["Row"] | null;
  tracking_events: Database["public"]["Tables"]["tracking_events"]["Row"][];
};

export default async function ShipmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? null;

  const { data, error } = await getShipmentById(id);
  if (error || !data) {
    notFound();
  }

  const shipment = data as unknown as ShipmentDetails;
  const canManage = role === "admin" || role === "dispatcher";
  const { data: documents } = await getShipmentDocuments(shipment.id);
  const { data: gpsPoints } = await supabase
    .from("gps_locations")
    .select("id, shipment_id, latitude, longitude, speed_kmph, heading_degrees, accuracy_meters, recorded_at")
    .eq("shipment_id", shipment.id)
    .order("recorded_at", { ascending: false })
    .limit(10);
  const { data: loadBoardEvents } = await supabase
    .from("tracking_events")
    .select("id, created_at, description")
    .eq("shipment_id", shipment.id)
    .eq("event_type", "note_added")
    .like("description", "LOAD_BOARD|%")
    .order("created_at", { ascending: false })
    .limit(10);
  const { data: notificationEvents } = await supabase
    .from("tracking_events")
    .select("id, created_at, description")
    .eq("shipment_id", shipment.id)
    .eq("event_type", "note_added")
    .like("description", "NOTIF|%")
    .order("created_at", { ascending: false })
    .limit(10);

  const loadBoardHistory = (loadBoardEvents ?? [])
    .map((event) => {
      try {
        const payload = JSON.parse(event.description.replace("LOAD_BOARD|", "")) as {
          provider?: string;
          status?: string;
          posted_rate_inr?: number | null;
        };
        return { id: event.id, created_at: event.created_at, payload };
      } catch {
        return null;
      }
    })
    .filter(
      (
        item,
      ): item is { id: string; created_at: string; payload: { provider?: string; status?: string; posted_rate_inr?: number | null } } =>
        Boolean(item),
    );

  const notificationHistory = (notificationEvents ?? [])
    .map((event) => {
      try {
        const payload = JSON.parse(event.description.replace("NOTIF|", "")) as {
          channel: "email" | "sms";
          recipient: string;
          message: string;
        };
        return { id: event.id, created_at: event.created_at, ...payload };
      } catch {
        return null;
      }
    })
    .filter(
      (
        item,
      ): item is { id: string; created_at: string; channel: "email" | "sms"; recipient: string; message: string } =>
        Boolean(item),
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">{shipment.shipment_number}</h1>
          <ShipmentStatusBadge status={shipment.status} />
          <DelayRiskBadge
            shipmentId={shipment.id}
            status={shipment.status}
            cargoType={shipment.cargo_type}
            carrierRating={shipment.carriers?.rating ?? 3}
            distanceKm={shipment.distance_km}
            scheduledDelivery={shipment.scheduled_delivery}
            weightKg={shipment.weight_kg}
          />
        </div>

        {role === "admin" && (
          <DeleteShipmentDialog
            shipmentId={shipment.id}
            shipmentNumber={shipment.shipment_number}
            onDeleted={() => {}}
            redirectTo="/shipments"
          />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shipment Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700">
            <p><span className="font-medium">Cargo:</span> {shipment.cargo_type}</p>
            <p><span className="font-medium">Weight:</span> {shipment.weight_kg} kg</p>
            <p><span className="font-medium">Volume:</span> {shipment.volume_cbm ?? "-"} cbm</p>
            <p><span className="font-medium">Freight Cost:</span> {formatCurrency(shipment.freight_cost)}</p>
            <p><span className="font-medium">Notes:</span> {shipment.notes ?? "-"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Route className="h-4 w-4" />Route</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700">
            <p><span className="font-medium">Origin:</span> {shipment.origin_city}, {shipment.origin_state}</p>
            <p><span className="font-medium">Destination:</span> {shipment.destination_city}, {shipment.destination_state}</p>
            <p><span className="font-medium">Distance:</span> {shipment.distance_km ?? "-"} km</p>
            <p><span className="font-medium">Origin Warehouse:</span> {shipment.origin_warehouse?.name ?? "-"}</p>
            <p><span className="font-medium">Destination Warehouse:</span> {shipment.dest_warehouse?.name ?? "-"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Truck className="h-4 w-4" />Carrier & Driver</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700">
            <p><span className="font-medium">Carrier:</span> {shipment.carriers?.name ?? "-"}</p>
            <p><span className="font-medium">Mode:</span> {shipment.carriers?.transport_mode ?? "-"}</p>
            <p><span className="font-medium">Driver:</span> {shipment.drivers?.full_name ?? "-"}</p>
            <p><span className="font-medium">Vehicle:</span> {shipment.drivers?.vehicle_number ?? "-"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Warehouse className="h-4 w-4" />Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700">
            <p><span className="font-medium">Scheduled Pickup:</span> {formatDateTime(shipment.scheduled_pickup)}</p>
            <p><span className="font-medium">Scheduled Delivery:</span> {formatDateTime(shipment.scheduled_delivery)}</p>
            <p><span className="font-medium">Actual Pickup:</span> {formatDateTime(shipment.actual_pickup)}</p>
            <p><span className="font-medium">Actual Delivery:</span> {formatDateTime(shipment.actual_delivery)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-4 w-4" />Update Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ShipmentStatusUpdater shipmentId={shipment.id} currentStatus={shipment.status} userRole={role} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Load Planning</CardTitle>
          </CardHeader>
          <CardContent>
            <LoadPlanningCard shipment={shipment} driver={shipment.drivers ?? null} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Management</CardTitle>
          </CardHeader>
          <CardContent>
            <ComplianceCard shipment={shipment} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Freight Audit & Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <FreightAuditCard shipment={shipment} route={shipment.routes ?? null} carrier={shipment.carriers ?? null} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integration Hub (EDI & Load Board)</CardTitle>
          </CardHeader>
          <CardContent>
            <IntegrationPanel shipmentId={shipment.id} initialHistory={loadBoardHistory} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Document Management</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentManager shipmentId={shipment.id} canManage={canManage} initialDocuments={documents ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Communication</CardTitle>
          </CardHeader>
          <CardContent>
            <NotificationSender shipmentId={shipment.id} canManage={canManage} initialHistory={notificationHistory} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tracking Events</CardTitle>
        </CardHeader>
        <CardContent>
          <TrackingTimeline shipmentId={shipment.id} initialEvents={shipment.tracking_events} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Location Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <LiveLocationCard shipmentId={shipment.id} initialPoints={gpsPoints ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
