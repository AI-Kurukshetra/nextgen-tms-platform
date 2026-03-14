import { AlertCircle, Building, CheckCircle, Package, Truck, User } from "lucide-react";

import { StatsCard } from "@/components/dashboard/StatsCard";
import { ShipmentStatusBadge } from "@/components/shipments/ShipmentStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { getShipments } from "@/lib/actions/shipments";
import { formatDate } from "@/lib/utils";
import type { Database } from "@/types/database";

type Shipment = Database["public"]["Tables"]["shipments"]["Row"];

const STATUS_COLORS: Record<Shipment["status"], string> = {
  draft: "bg-slate-500",
  confirmed: "bg-blue-500",
  assigned: "bg-violet-500",
  in_transit: "bg-amber-500",
  delivered: "bg-emerald-500",
  delayed: "bg-red-500",
  cancelled: "bg-slate-400",
};

const STATUS_LABELS: Record<Shipment["status"], string> = {
  draft: "Draft",
  confirmed: "Confirmed",
  assigned: "Assigned",
  in_transit: "In Transit",
  delivered: "Delivered",
  delayed: "Delayed",
  cancelled: "Cancelled",
};

function widthClass(percent: number) {
  if (percent >= 95) return "w-full";
  if (percent >= 80) return "w-5/6";
  if (percent >= 65) return "w-2/3";
  if (percent >= 50) return "w-1/2";
  if (percent >= 35) return "w-1/3";
  if (percent >= 20) return "w-1/4";
  if (percent >= 10) return "w-1/6";
  if (percent > 0) return "w-1/12";
  return "w-0";
}

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
  const maxMonthValue = Math.max(1, ...monthlyTrend.map(([, count]) => count));

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
          <CardContent className="space-y-3">
            {(Object.keys(statusDistribution) as Shipment["status"][]).map((status) => {
              const count = statusDistribution[status];
              const percent = allShipments.length === 0 ? 0 : Math.round((count / allShipments.length) * 100);
              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm text-slate-700">
                    <span>{STATUS_LABELS[status]}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${STATUS_COLORS[status]} ${widthClass(percent)}`}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Monthly Shipment Trend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {monthlyTrend.length === 0 ? (
              <p className="text-sm text-slate-500">No trend data available.</p>
            ) : (
              monthlyTrend.map(([month, count]) => {
                const percent = Math.round((count / maxMonthValue) * 100);
                return (
                  <div key={month} className="grid grid-cols-[56px_1fr_30px] items-center gap-2 text-sm">
                    <span className="text-slate-600">{month}</span>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full bg-cyan-500 transition-all duration-700 ${widthClass(percent)}`} />
                    </div>
                    <span className="text-right text-slate-700">{count}</span>
                  </div>
                );
              })
            )}
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
