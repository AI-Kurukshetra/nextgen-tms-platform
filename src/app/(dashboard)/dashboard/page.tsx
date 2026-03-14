import { AlertCircle, Building, CheckCircle, Package, Truck, User } from "lucide-react";

import { LineChart } from "@/components/charts/LineChart";
import { PieChart } from "@/components/charts/PieChart";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ShipmentStatusBadge } from "@/components/shipments/ShipmentStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { getShipments } from "@/lib/actions/shipments";
import { formatDate } from "@/lib/utils";
import type { Database } from "@/types/database";

type Shipment = Database["public"]["Tables"]["shipments"]["Row"];

const STATUS_LABELS: Record<Shipment["status"], string> = {
  draft: "Draft",
  confirmed: "Confirmed",
  assigned: "Assigned",
  in_transit: "In Transit",
  delivered: "Delivered",
  delayed: "Delayed",
  cancelled: "Cancelled",
};

export default async function DashboardPage() {
  const [stats, shipmentsResult] = await Promise.all([getDashboardStats(), getShipments()]);
  const recentShipments = (shipmentsResult.data ?? []).slice(0, 5);
  const allShipments = (shipmentsResult.data ?? []) as Shipment[];
  const statusDistribution = {
    draft: 0,
    confirmed: 0,
    assigned: 0,
    in_transit: 0,
    delivered: 0,
    delayed: 0,
    cancelled: 0,
  } as Record<Shipment["status"], number>;

  for (const shipment of allShipments) statusDistribution[shipment.status] += 1;

  const monthly = new Map<string, number>();
  for (const shipment of allShipments) {
    const month = new Date(shipment.created_at).toLocaleString("en-US", { month: "short" });
    monthly.set(month, (monthly.get(month) ?? 0) + 1);
  }
  const monthlyTrend = Array.from(monthly.entries()).slice(-6);
  const pieData = (Object.keys(statusDistribution) as Shipment["status"][]).map((status) => ({
    label: STATUS_LABELS[status],
    value: statusDistribution[status],
    color:
      status === "draft"
        ? "#64748B"
        : status === "confirmed"
          ? "#3B82F6"
          : status === "assigned"
            ? "#8B5CF6"
            : status === "in_transit"
              ? "#F59E0B"
              : status === "delivered"
                ? "#10B981"
                : status === "delayed"
                  ? "#EF4444"
                  : "#94A3B8",
  }));

  return (
    <div className="space-y-6">
      <section className="animate-in fade-in slide-in-from-top-2 duration-500 rounded-2xl border border-slate-200 bg-gradient-to-r from-cyan-50 via-blue-50 to-emerald-50 p-5">
        <h1 className="text-2xl font-bold text-slate-900">Operations Command Center</h1>
        <p className="mt-1 text-sm text-slate-600">Live overview of freight flow, carrier performance, and delivery risk.</p>
      </section>

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

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Shipment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={pieData} />
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Monthly Shipment Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={monthlyTrend.map(([month, count]) => ({
                label: month,
                value: count,
              }))}
              stroke="#06B6D4"
            />
          </CardContent>
        </Card>
      </section>

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
