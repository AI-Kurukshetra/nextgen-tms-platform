"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Database } from "@/types/database";

type RouteRow = Database["public"]["Tables"]["routes"]["Row"];

type RouteOption = {
  route: RouteRow;
  score: number;
  reason: string;
};

type OptimizerResult = {
  best: RouteOption | null;
  alternatives: RouteOption[];
};

export function RouteOptimizerCard({ routes }: { routes: RouteRow[] }) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [mode, setMode] = useState("any");
  const [preference, setPreference] = useState<"fastest" | "cheapest" | "balanced">("balanced");
  const [result, setResult] = useState<OptimizerResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const uniqueModes = useMemo(() => Array.from(new Set(routes.map((route) => route.transport_mode))), [routes]);

  const runOptimize = () => {
    if (!origin.trim() || !destination.trim()) {
      toast.error("Origin and destination are required");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/routes/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_city: origin,
          destination_city: destination,
          mode,
          preference,
        }),
      });

      const json = (await res.json()) as OptimizerResult & { error?: string };

      if (!res.ok || json.error) {
        toast.error(json.error ?? "Unable to optimize routes");
        return;
      }

      setResult({ best: json.best ?? null, alternatives: json.alternatives ?? [] });
    });
  };

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-blue-600" />
        <h2 className="text-sm font-semibold text-gray-900">Route Optimization Assistant</h2>
      </div>

      <div className="grid gap-2 md:grid-cols-5">
        <Input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Origin city" />
        <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destination city" />

        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
        >
          <option value="any">Any Mode</option>
          {uniqueModes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={preference}
          onChange={(e) => setPreference(e.target.value as typeof preference)}
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
        >
          <option value="balanced">Balanced</option>
          <option value="fastest">Fastest</option>
          <option value="cheapest">Cheapest</option>
        </select>

        <Button type="button" onClick={runOptimize} disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Optimize"}
        </Button>
      </div>

      {result?.best ? (
        <div className="space-y-2">
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm font-medium text-blue-900">Best Route: {result.best.route.name}</p>
            <p className="text-xs text-blue-800">
              {result.best.route.origin_city} to {result.best.route.destination_city} · {result.best.route.distance_km} km · {result.best.route.estimated_hours} hrs
            </p>
            <p className="text-xs text-blue-700">{result.best.reason}</p>
          </div>

          {result.alternatives.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-700">Alternatives</p>
              {result.alternatives.map((item) => (
                <div key={item.route.id} className="flex items-center justify-between rounded border border-gray-200 px-2 py-1.5">
                  <div>
                    <p className="text-sm text-gray-900">{item.route.name}</p>
                    <p className="text-xs text-gray-500">{item.reason}</p>
                  </div>
                  <Badge variant="outline">Score {item.score}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-500">Run optimization to see recommended and alternate routes.</p>
      )}
    </div>
  );
}
