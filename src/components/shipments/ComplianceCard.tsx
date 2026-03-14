import { evaluateShipmentCompliance } from "@/lib/compliance-engine";
import type { Database } from "@/types/database";

type Shipment = Database["public"]["Tables"]["shipments"]["Row"];

export function ComplianceCard({ shipment }: { shipment: Shipment }) {
  const compliance = evaluateShipmentCompliance(shipment);

  const overallColor =
    compliance.overall === "pass"
      ? "text-green-700 bg-green-50 border-green-200"
      : compliance.overall === "warning"
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : "text-red-700 bg-red-50 border-red-200";

  return (
    <div className="space-y-2">
      <div className={`rounded-md border px-3 py-2 text-sm font-semibold uppercase ${overallColor}`}>
        {compliance.overall}
      </div>
      <div className="space-y-1">
        {compliance.checks.map((check) => (
          <p key={check.code} className="text-sm text-gray-700">
            <span className="font-medium capitalize">{check.status}:</span> {check.message}
          </p>
        ))}
      </div>
    </div>
  );
}
