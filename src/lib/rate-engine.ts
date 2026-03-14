import type { Database } from "@/types/database";

type CargoType = Database["public"]["Tables"]["shipments"]["Row"]["cargo_type"];
type TransportMode = Database["public"]["Tables"]["routes"]["Row"]["transport_mode"];

export interface FreightQuoteInput {
  distance_km: number;
  weight_kg: number;
  cargo_type: CargoType;
  transport_mode: TransportMode;
  carrier_rating: number;
}

export interface FreightQuoteResult {
  estimated_cost: number;
  currency: "INR";
  confidence: number;
  factors: string[];
}

const BASE_RATE_PER_KM: Record<TransportMode, number> = {
  truck: 24,
  rail: 16,
  air: 62,
  ocean: 12,
  intermodal: 20,
};

const CARGO_SURCHARGE: Record<CargoType, number> = {
  general: 0,
  electronics: 0.08,
  fragile: 0.1,
  perishable: 0.12,
  hazardous: 0.18,
  oversized: 0.2,
};

function getWeightMultiplier(weightKg: number) {
  if (weightKg <= 500) return 1;
  if (weightKg <= 2000) return 1.15;
  if (weightKg <= 5000) return 1.35;
  return 1.6;
}

function getCarrierAdjustment(carrierRating: number) {
  if (carrierRating >= 4.5) return 0.08;
  if (carrierRating >= 4.0) return 0.04;
  if (carrierRating < 3.5) return -0.05;
  return 0;
}

export function calculateFreightQuote(input: FreightQuoteInput): FreightQuoteResult {
  const baseRate = BASE_RATE_PER_KM[input.transport_mode];
  const distanceCost = input.distance_km * baseRate;

  const weightMultiplier = getWeightMultiplier(input.weight_kg);
  const cargoSurcharge = CARGO_SURCHARGE[input.cargo_type];
  const carrierAdjustment = getCarrierAdjustment(input.carrier_rating);

  const adjusted = distanceCost * weightMultiplier * (1 + cargoSurcharge + carrierAdjustment);
  const costWithFloor = Math.max(2500, adjusted);
  const estimated_cost = Math.round(costWithFloor / 100) * 100;

  const factors = [
    `${input.transport_mode} base rate ₹${baseRate}/km`,
    `distance ${input.distance_km} km`,
    `weight multiplier x${weightMultiplier.toFixed(2)}`,
  ];

  if (cargoSurcharge > 0) {
    factors.push(`${input.cargo_type} surcharge ${(cargoSurcharge * 100).toFixed(0)}%`);
  }

  if (carrierAdjustment !== 0) {
    factors.push(`carrier rating adjustment ${(carrierAdjustment * 100).toFixed(0)}%`);
  }

  const confidence = Math.min(95, Math.max(62, Math.round(70 + input.carrier_rating * 4)));

  return {
    estimated_cost,
    currency: "INR",
    confidence,
    factors,
  };
}
