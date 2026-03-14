"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import type { RiskResult } from "@/lib/risk-engine";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type DelayRiskBadgeProps = {
  shipmentId: string;
  status: string;
  cargoType: string;
  carrierRating: number;
  distanceKm: number | null;
  scheduledDelivery: string | null;
  weightKg: number;
};

const riskColorMap: Record<RiskResult["risk"], string> = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  high: "bg-red-100 text-red-700 border-red-200",
};

const riskLabelMap: Record<RiskResult["risk"], string> = {
  low: "Low Risk",
  medium: "Medium Risk",
  high: "High Risk",
};

export function DelayRiskBadge({
  shipmentId,
  status,
  cargoType,
  carrierRating,
  distanceKm,
  scheduledDelivery,
  weightKg,
}: DelayRiskBadgeProps) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<RiskResult | null>(null);
  const [failed, setFailed] = useState(false);
  const fetched = useRef(false);

  const shouldRender = status === "in_transit" || status === "assigned";

  useEffect(() => {
    if (!shouldRender || fetched.current) return;

    fetched.current = true;

    (async () => {
      try {
        const response = await fetch("/api/delay-risk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shipmentId,
            status,
            cargo_type: cargoType,
            carrier_rating: carrierRating,
            distance_km: distanceKm,
            scheduled_delivery: scheduledDelivery,
            weight_kg: weightKg,
          }),
        });

        if (!response.ok) {
          setFailed(true);
          return;
        }

        const json: RiskResult = await response.json();
        setResult(json);
      } catch {
        setFailed(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [shipmentId, status, cargoType, carrierRating, distanceKm, scheduledDelivery, weightKg, shouldRender]);

  if (!shouldRender || failed) return null;

  if (loading) {
    return (
      <Badge className="border border-gray-200 bg-gray-100 text-gray-600">
        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
        Checking
      </Badge>
    );
  }

  if (!result) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <div className="relative inline-block">
          <TooltipTrigger asChild>
            <Badge className={cn("border", riskColorMap[result.risk])}>{riskLabelMap[result.risk]}</Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{result.reason}</p>
            <p className="mt-1 text-gray-200">Confidence: {result.confidence}%</p>
          </TooltipContent>
        </div>
      </Tooltip>
    </TooltipProvider>
  );
}
