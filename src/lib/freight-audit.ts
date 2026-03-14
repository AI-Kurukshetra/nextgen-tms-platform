import { calculateFreightQuote } from "@/lib/rate-engine";
import type { Database } from "@/types/database";

type Shipment = Database["public"]["Tables"]["shipments"]["Row"];
type Route = Database["public"]["Tables"]["routes"]["Row"] | null;
type Carrier = Database["public"]["Tables"]["carriers"]["Row"] | null;

export interface FreightAuditResult {
  expected_cost: number;
  billed_cost: number;
  variance_pct: number;
  status: "approved" | "review" | "rejected";
  reason: string;
}

export function runFreightAudit(shipment: Shipment, route: Route, carrier: Carrier): FreightAuditResult {
  const distance = shipment.distance_km ?? route?.distance_km ?? 100;
  const mode = route?.transport_mode ?? carrier?.transport_mode ?? "truck";

  const quote = calculateFreightQuote({
    distance_km: distance,
    weight_kg: shipment.weight_kg,
    cargo_type: shipment.cargo_type,
    transport_mode: mode,
    carrier_rating: carrier?.rating ?? 3.8,
  });

  const billed = shipment.freight_cost ?? quote.estimated_cost;
  const variance = billed - quote.estimated_cost;
  const variance_pct = Number(((variance / quote.estimated_cost) * 100).toFixed(1));

  if (Math.abs(variance_pct) <= 10) {
    return {
      expected_cost: quote.estimated_cost,
      billed_cost: billed,
      variance_pct,
      status: "approved",
      reason: "Variance within approval threshold",
    };
  }

  if (Math.abs(variance_pct) <= 20) {
    return {
      expected_cost: quote.estimated_cost,
      billed_cost: billed,
      variance_pct,
      status: "review",
      reason: "Manual review required due to moderate variance",
    };
  }

  return {
    expected_cost: quote.estimated_cost,
    billed_cost: billed,
    variance_pct,
    status: "rejected",
    reason: "Variance exceeds policy threshold",
  };
}
