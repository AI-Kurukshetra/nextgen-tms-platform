export type RiskLevel = "low" | "medium" | "high";

export interface RiskResult {
  risk: RiskLevel;
  reason: string;
  confidence: number;
}

export interface RiskInput {
  status: string;
  cargo_type: string;
  carrier_rating: number;
  distance_km: number | null;
  scheduled_delivery: string | null;
  weight_kg: number;
}

export function calculateDelayRisk(input: RiskInput): RiskResult {
  if (input.status === "delayed") {
    return { risk: "high", reason: "Shipment is currently delayed", confidence: 95 };
  }

  let score = 0;
  const reasons: string[] = [];

  if (input.scheduled_delivery && new Date(input.scheduled_delivery) < new Date()) {
    score += 40;
    reasons.push("past scheduled delivery date");
  }

  if (input.carrier_rating < 3.5) {
    score += 25;
    reasons.push("low carrier performance rating");
  } else if (input.carrier_rating < 4.0) {
    score += 10;
    reasons.push("average carrier rating");
  }

  if (["hazardous", "perishable"].includes(input.cargo_type)) {
    score += 20;
    reasons.push(`${input.cargo_type} cargo requires special handling`);
  }

  if (input.distance_km && input.distance_km > 1500) {
    score += 15;
    reasons.push("long-haul route over 1500km");
  } else if (input.distance_km && input.distance_km > 800) {
    score += 8;
    reasons.push("medium-distance route");
  }

  if (input.weight_kg > 3000) {
    score += 5;
    reasons.push("heavy cargo load");
  }

  const risk: RiskLevel = score >= 50 ? "high" : score >= 20 ? "medium" : "low";
  const confidence = Math.min(92, 55 + score);
  const reason = reasons.length ? reasons.join(", ") : "Route and carrier metrics look good";

  return { risk, reason, confidence };
}
