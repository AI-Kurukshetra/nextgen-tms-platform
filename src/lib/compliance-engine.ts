import type { Database } from "@/types/database";

export interface ComplianceCheck {
  code: string;
  status: "pass" | "warning" | "fail";
  message: string;
}

export interface ComplianceResult {
  overall: "pass" | "warning" | "fail";
  checks: ComplianceCheck[];
}

type Shipment = Database["public"]["Tables"]["shipments"]["Row"];

export function evaluateShipmentCompliance(shipment: Shipment): ComplianceResult {
  const checks: ComplianceCheck[] = [];

  checks.push({
    code: "carrier_assigned",
    status: shipment.carrier_id ? "pass" : "warning",
    message: shipment.carrier_id ? "Carrier assigned" : "Carrier is not assigned",
  });

  checks.push({
    code: "driver_assigned",
    status: shipment.driver_id ? "pass" : "warning",
    message: shipment.driver_id ? "Driver assigned" : "Driver is not assigned",
  });

  checks.push({
    code: "route_assigned",
    status: shipment.route_id ? "pass" : "warning",
    message: shipment.route_id ? "Route assigned" : "Route is not assigned",
  });

  checks.push({
    code: "schedule_defined",
    status: shipment.scheduled_pickup && shipment.scheduled_delivery ? "pass" : "warning",
    message:
      shipment.scheduled_pickup && shipment.scheduled_delivery
        ? "Pickup and delivery schedule present"
        : "Pickup or delivery schedule missing",
  });

  if (shipment.cargo_type === "hazardous") {
    checks.push({
      code: "hazmat_handling",
      status: shipment.driver_id && shipment.carrier_id ? "pass" : "fail",
      message:
        shipment.driver_id && shipment.carrier_id
          ? "Hazardous shipment has required assignments"
          : "Hazardous shipment requires both carrier and driver assignment",
    });

    checks.push({
      code: "hazmat_permit_reference",
      status: shipment.notes?.toLowerCase().includes("permit") ? "pass" : "warning",
      message: shipment.notes?.toLowerCase().includes("permit")
        ? "Hazmat permit reference is present"
        : "Hazmat permit reference is missing in shipment notes",
    });
  }

  if (shipment.distance_km) {
    const estimatedDriveHours = Number(shipment.distance_km) / 50;
    checks.push({
      code: "dot_hos_window",
      status: estimatedDriveHours > 11 ? "warning" : "pass",
      message:
        estimatedDriveHours > 11
          ? "Route likely exceeds single-shift HOS window; assign relay/team driver"
          : "Estimated drive time is within single-shift HOS window",
    });
  }

  const hasFail = checks.some((check) => check.status === "fail");
  const hasWarning = checks.some((check) => check.status === "warning");

  return {
    overall: hasFail ? "fail" : hasWarning ? "warning" : "pass",
    checks,
  };
}
