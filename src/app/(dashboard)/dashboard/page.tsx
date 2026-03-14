import { AlertCircle, Building, CheckCircle, Package, Truck, User } from "lucide-react";

import { StatsCard } from "@/components/dashboard/StatsCard";
import { ShipmentStatusBadge } from "@/components/shipments/ShipmentStatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { getShipments } from "@/lib/actions/shipments";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const [stats, shipmentsResult] = await Promise.all([getDashboardStats(), getShipments()]);
  const recentShipments = (shipmentsResult.data ?? []).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatsCard
          title="Total Shipments"
          value={stats.totalShipments}
          icon={Package}
          description="All shipments"
          color="text-blue-600"
        />
        <StatsCard
          title="In Transit"
          value={stats.inTransit}
          icon={Truck}
          description="Currently moving"
          color="text-amber-600"
        />
        <StatsCard
          title="Delivered"
          value={stats.delivered}
          icon={CheckCircle}
          description="Completed deliveries"
          color="text-green-600"
        />
        <StatsCard
          title="Active Carriers"
          value={stats.activeCarriers}
          icon={Building}
          description="Operational partners"
          color="text-purple-600"
        />
        <StatsCard
          title="Available Drivers"
          value={stats.availableDrivers}
          icon={User}
          description="Ready for assignment"
          color="text-teal-600"
        />
      </div>

      {stats.delayed > 0 && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {stats.delayed} delayed shipment(s) need attention.
        </div>
      )}

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-900">Recent Shipments</h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shipment #</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled Delivery</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentShipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                  No shipments found.
                </TableCell>
              </TableRow>
            ) : (
              recentShipments.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell className="font-medium">{shipment.shipment_number}</TableCell>
                  <TableCell>
                    {shipment.origin_city} to {shipment.destination_city}
                  </TableCell>
                  <TableCell>
                    <ShipmentStatusBadge status={shipment.status} />
                  </TableCell>
                  <TableCell>{formatDate(shipment.scheduled_delivery)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
