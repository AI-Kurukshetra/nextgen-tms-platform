import { Activity, Clock3, IndianRupee, PackageCheck, Truck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
          <CardContent className="space-y-3">
            {Object.entries(data.status_distribution).map(([status, count]) => {
              const total = Math.max(1, data.metrics.total_shipments);
              const width = Math.round((count / total) * 100);
              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm text-gray-700">
                    <span>{STATUS_LABELS[status] ?? status}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div className={`h-2 rounded-full bg-gray-900 ${widthClass(width)}`} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Throughput (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.monthly_kpis.length === 0 ? (
              <p className="text-sm text-gray-500">No monthly shipment trend available.</p>
            ) : (
              data.monthly_kpis.map((row) => (
                <div key={row.month} className="rounded-md border border-gray-200 p-2 text-sm">
                  <p className="font-medium text-gray-900">{row.month}</p>
                  <p className="text-gray-700">Shipments: {row.shipments}</p>
                  <p className="text-gray-700">Delivered: {row.delivered}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Carrier Performance</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Carrier</th>
                <th className="px-3 py-2 text-left">Total</th>
                <th className="px-3 py-2 text-left">Delivered</th>
                <th className="px-3 py-2 text-left">Delayed</th>
                <th className="px-3 py-2 text-left">On-time %</th>
              </tr>
            </thead>
            <tbody>
              {data.carrier_performance.map((row) => (
                <tr key={row.carrier_id} className="border-t">
                  <td className="px-3 py-2 font-medium text-gray-900">{row.carrier_name}</td>
                  <td className="px-3 py-2">{row.total_shipments}</td>
                  <td className="px-3 py-2">{row.delivered_shipments}</td>
                  <td className="px-3 py-2">{row.delayed_shipments}</td>
                  <td className="px-3 py-2">{row.on_time_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
