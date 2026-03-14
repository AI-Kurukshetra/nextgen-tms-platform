import type { Database } from "@/types/database";

type VehicleType = NonNullable<Database["public"]["Tables"]["drivers"]["Row"]["vehicle_type"]>;

export interface LoadPlanningInput {
  vehicle_type: VehicleType;
  weight_kg: number;
  volume_cbm: number | null;
}

export interface LoadPlanningResult {
  capacity_kg: number;
  capacity_cbm: number;
  weight_utilization_pct: number;
  volume_utilization_pct: number;
  status: "optimal" | "near_limit" | "overloaded";
  recommendation: string;
}

const VEHICLE_CAPACITY: Record<VehicleType, { kg: number; cbm: number }> = {
  truck: { kg: 7000, cbm: 35 },
  mini_truck: { kg: 2000, cbm: 12 },
  trailer: { kg: 18000, cbm: 60 },
  container: { kg: 26000, cbm: 67 },
};

export function calculateLoadPlan(input: LoadPlanningInput): LoadPlanningResult {
  const capacity = VEHICLE_CAPACITY[input.vehicle_type];

  const weightUtil = Number(((input.weight_kg / capacity.kg) * 100).toFixed(1));
  const volumeUtil = input.volume_cbm ? Number(((input.volume_cbm / capacity.cbm) * 100).toFixed(1)) : 0;

  const peakUtil = Math.max(weightUtil, volumeUtil);

  if (peakUtil > 100) {
    return {
      capacity_kg: capacity.kg,
      capacity_cbm: capacity.cbm,
      weight_utilization_pct: weightUtil,
      volume_utilization_pct: volumeUtil,
      status: "overloaded",
      recommendation: "Split shipment or assign higher-capacity vehicle",
    };
  }

  if (peakUtil >= 85) {
    return {
      capacity_kg: capacity.kg,
      capacity_cbm: capacity.cbm,
      weight_utilization_pct: weightUtil,
      volume_utilization_pct: volumeUtil,
      status: "near_limit",
      recommendation: "Proceed with caution and monitor loading balance",
    };
  }

  return {
    capacity_kg: capacity.kg,
    capacity_cbm: capacity.cbm,
    weight_utilization_pct: weightUtil,
    volume_utilization_pct: volumeUtil,
    status: "optimal",
    recommendation: "Capacity is healthy for safe dispatch",
  };
}
