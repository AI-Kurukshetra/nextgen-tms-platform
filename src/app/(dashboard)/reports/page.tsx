import { Activity, Clock3, IndianRupee, PackageCheck, Truck } from "lucide-react";

import { BarChart } from "@/components/charts/BarChart";
import { LineChart } from "@/components/charts/LineChart";
import { PieChart } from "@/components/charts/PieChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getReportingAnalytics } from "@/lib/actions/reports";
import { formatCurrency } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  confirmed: "Confirmed",
  assigned: "Assigned",
  in_transit: "In Transit",
  delivered: "Delivered",
  delayed: "Delayed",
  cancelled: "Cancelled",
};

export default async function ReportsPage() {
  const { data, error } = await getReportingAnalytics();

  if (error || !data) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Reporting & Analytics</h1>
        <p className="text-sm text-red-600">{error ?? "Unable to load report data"}</p>
      </div>
    );
  }

  const pieData = Object.entries(data.status_distribution).map(([status, value]) => ({
    label: STATUS_LABELS[status] ?? status,
    value,
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
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reporting & Analytics</h1>
        <p className="text-sm text-gray-600">Operational KPIs for delivery performance, cost efficiency, and carrier quality.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-gray-600">
              <Truck className="h-4 w-4 text-blue-600" />
              Total Shipments
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-gray-900">{data.metrics.total_shipments}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-gray-600">
              <PackageCheck className="h-4 w-4 text-green-600" />
              Delivered
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-gray-900">{data.metrics.delivered_shipments}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-gray-600">
              <Clock3 className="h-4 w-4 text-amber-600" />
              On-time Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-gray-900">{data.metrics.on_time_delivery_rate}%</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-gray-600">
              <IndianRupee className="h-4 w-4 text-purple-600" />
              Avg Cost / KM
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-gray-900">{formatCurrency(data.metrics.avg_cost_per_km)}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-gray-600">
              <Activity className="h-4 w-4 text-red-600" />
              Delayed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-gray-900">{data.metrics.delayed_shipments}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={pieData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Throughput (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={data.monthly_kpis.map((row) => ({
                label: row.month,
                value: row.shipments,
              }))}
              stroke="#2563EB"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Carrier Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <BarChart
            title="On-time Delivery Rate by Carrier"
            data={data.carrier_performance.slice(0, 8).map((row) => ({
              label: row.carrier_name,
              value: row.on_time_rate,
            }))}
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Carrier</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead>Delayed</TableHead>
                <TableHead>On-time %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.carrier_performance.map((row) => (
                <TableRow key={row.carrier_id}>
                  <TableCell className="font-medium text-slate-900">{row.carrier_name}</TableCell>
                  <TableCell>{row.total_shipments}</TableCell>
                  <TableCell>{row.delivered_shipments}</TableCell>
                  <TableCell>{row.delayed_shipments}</TableCell>
                  <TableCell>{row.on_time_rate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
