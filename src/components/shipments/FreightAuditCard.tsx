import { runFreightAudit } from "@/lib/freight-audit";
import { formatCurrency } from "@/lib/utils";
import type { Database } from "@/types/database";

type Shipment = Database["public"]["Tables"]["shipments"]["Row"];
type Route = Database["public"]["Tables"]["routes"]["Row"] | null;
type Carrier = Database["public"]["Tables"]["carriers"]["Row"] | null;

export function FreightAuditCard({ shipment, route, carrier }: { shipment: Shipment; route: Route; carrier: Carrier }) {
  const audit = runFreightAudit(shipment, route, carrier);

  const statusColor =
    audit.status === "approved"
      ? "text-green-700 bg-green-50 border-green-200"
      : audit.status === "review"
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : "text-red-700 bg-red-50 border-red-200";

  return (
    <div className="space-y-2">
      <div className={`rounded-md border px-3 py-2 text-sm font-semibold uppercase ${statusColor}`}>{audit.status}</div>
      <p className="text-sm text-gray-700">Expected: {formatCurrency(audit.expected_cost)}</p>
      <p className="text-sm text-gray-700">Billed: {formatCurrency(audit.billed_cost)}</p>
      <p className="text-sm text-gray-700">Variance: {audit.variance_pct}%</p>
      <p className="text-xs text-gray-500">{audit.reason}</p>
    </div>
  );
}
