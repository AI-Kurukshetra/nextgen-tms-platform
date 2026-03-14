"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CARGO_TYPES, TRANSPORT_MODES } from "@/types";
import { formatCurrency } from "@/lib/utils";

type QuoteResult = {
  estimated_cost: number;
  currency: "INR";
  confidence: number;
  factors: string[];
};

export function RateCalculator() {
  const [distance, setDistance] = useState("500");
  const [weight, setWeight] = useState("1200");
  const [carrierRating, setCarrierRating] = useState("4.2");
  const [cargoType, setCargoType] = useState<(typeof CARGO_TYPES)[number]>("general");
  const [transportMode, setTransportMode] = useState<(typeof TRANSPORT_MODES)[number]>("truck");
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const calculate = () => {
    startTransition(async () => {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          distance_km: Number(distance),
          weight_kg: Number(weight),
          cargo_type: cargoType,
          transport_mode: transportMode,
          carrier_rating: Number(carrierRating),
        }),
      });

      const json = (await res.json()) as QuoteResult & { error?: string };
      if (!res.ok || json.error) {
        toast.error(json.error ?? "Unable to calculate quote");
        return;
      }

      setResult(json);
    });
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Input value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="Distance km" />
        <Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Weight kg" />
        <Input value={carrierRating} onChange={(e) => setCarrierRating(e.target.value)} placeholder="Carrier rating" />

        <select
          value={cargoType}
          onChange={(e) => setCargoType(e.target.value as (typeof CARGO_TYPES)[number])}
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
        >
          {CARGO_TYPES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={transportMode}
          onChange={(e) => setTransportMode(e.target.value as (typeof TRANSPORT_MODES)[number])}
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
        >
          {TRANSPORT_MODES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <Button type="button" onClick={calculate} disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Calculate Quote"}
        </Button>
      </div>

      {result && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          <p className="font-semibold">Estimated Cost: {formatCurrency(result.estimated_cost)}</p>
          <p>Confidence: {result.confidence}%</p>
          <p className="mt-1 text-xs">{result.factors.join(" · ")}</p>
        </div>
      )}
    </div>
  );
}
