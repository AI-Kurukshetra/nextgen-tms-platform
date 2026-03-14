import { calculateLoadPlan } from "@/lib/load-planner";
import type { Database } from "@/types/database";

type Shipment = Database["public"]["Tables"]["shipments"]["Row"];
type Driver = Database["public"]["Tables"]["drivers"]["Row"] | null;

type LoadPlanningCardProps = {
  shipment: Shipment;
  driver: Driver;
};

export function LoadPlanningCard({ shipment, driver }: LoadPlanningCardProps) {
  if (!driver?.vehicle_type) {
    return <p className="text-sm text-gray-500">Assign a driver with vehicle type to generate load plan.</p>;
  }

  const plan = calculateLoadPlan({
    vehicle_type: driver.vehicle_type,
    weight_kg: shipment.weight_kg,
    volume_cbm: shipment.volume_cbm,
  });

  const statusColor =
    plan.status === "optimal"
      ? "text-green-700 bg-green-50 border-green-200"
      : plan.status === "near_limit"
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : "text-red-700 bg-red-50 border-red-200";

  return (
    <div className={`rounded-md border p-3 ${statusColor}`}>
      <p className="text-sm font-semibold capitalize">{plan.status.replace("_", " ")}</p>
      <p className="text-xs">Weight Utilization: {plan.weight_utilization_pct}%</p>
      <p className="text-xs">Volume Utilization: {plan.volume_utilization_pct}%</p>
      <p className="mt-1 text-xs">{plan.recommendation}</p>
    </div>
  );
}
