"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Navigation2, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils";
import type { Database } from "@/types/database";

type GpsPoint = Pick<
  Database["public"]["Tables"]["gps_locations"]["Row"],
  "id" | "shipment_id" | "latitude" | "longitude" | "speed_kmph" | "heading_degrees" | "accuracy_meters" | "recorded_at"
>;

type LiveLocationCardProps = {
  shipmentId: string;
  initialPoints: GpsPoint[];
};

export function LiveLocationCard({ shipmentId, initialPoints }: LiveLocationCardProps) {
  const [points, setPoints] = useState<GpsPoint[]>(initialPoints);
  const [loading, setLoading] = useState(false);

  const latest = points[0] ?? null;

  const ageLabel = useMemo(() => {
    if (!latest) return null;
    const diffMs = Date.now() - new Date(latest.recorded_at).getTime();
    const mins = Math.max(0, Math.floor(diffMs / 60000));
    return mins < 1 ? "Just now" : `${mins} min ago`;
  }, [latest]);

  const fetchLatest = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tracking/live?shipment_id=${shipmentId}`, { cache: "no-store" });
      const json = (await response.json()) as { points?: GpsPoint[] };
      if (response.ok && json.points) {
        setPoints(json.points);
      }
    } finally {
      setLoading(false);
    }
  }, [shipmentId]);

  useEffect(() => {
    void fetchLatest();

    const supabase = createClient();
    const channel = supabase
      .channel(`gps-locations-${shipmentId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "gps_locations",
          filter: `shipment_id=eq.${shipmentId}`,
        },
        (payload) => {
          const point = payload.new as GpsPoint;
          setPoints((current) => {
            const merged = [point, ...current.filter((item) => item.id !== point.id)];
            return merged.sort((a, b) => (a.recorded_at < b.recorded_at ? 1 : -1)).slice(0, 10);
          });
        },
      )
      .subscribe();

    const timer = setInterval(() => {
      void fetchLatest();
    }, 30000);

    return () => {
      clearInterval(timer);
      void supabase.removeChannel(channel);
    };
  }, [fetchLatest, shipmentId]);

  return (
    <div className="space-y-3 text-sm text-gray-700">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Navigation2 className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-900">Live GPS</span>
          {ageLabel && <Badge variant="outline">{ageLabel}</Badge>}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void fetchLatest()} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          <span className="ml-1">Refresh</span>
        </Button>
      </div>

      {!latest ? (
        <p className="text-sm text-gray-500">No live coordinates available for this shipment yet.</p>
      ) : (
        <>
          <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
            <p><span className="font-medium">Latest Coordinates:</span> {latest.latitude.toFixed(5)}, {latest.longitude.toFixed(5)}</p>
            <p><span className="font-medium">Speed:</span> {latest.speed_kmph ?? 0} km/h</p>
            <p><span className="font-medium">Heading:</span> {latest.heading_degrees ?? 0}°</p>
            <p><span className="font-medium">Recorded:</span> {formatDateTime(latest.recorded_at)}</p>
          </div>

          <div className="space-y-2">
            {points.slice(0, 5).map((point) => (
              <div key={point.id} className="rounded-md border border-gray-200 px-3 py-2">
                <p className="font-medium text-gray-900">{point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}</p>
                <p className="text-xs text-gray-500">{formatDateTime(point.recorded_at)} · {point.speed_kmph ?? 0} km/h</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
