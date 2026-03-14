"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateDriverStatus } from "@/lib/actions/drivers";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";

type Driver = Database["public"]["Tables"]["drivers"]["Row"];
type Assignment = {
  id: string;
  shipment_number: string;
  origin_city: string;
  destination_city: string;
  status: string;
  driver_id: string | null;
  scheduled_delivery: string | null;
};

export function MobileDriverBoard({ drivers, assignments }: { drivers: Driver[]; assignments: Assignment[] }) {
  const [selectedDriverId, setSelectedDriverId] = useState(drivers[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const [isSendingGps, setIsSendingGps] = useState(false);

  const selectedDriver = drivers.find((driver) => driver.id === selectedDriverId) ?? null;

  const driverAssignments = useMemo(
    () => assignments.filter((assignment) => assignment.driver_id === selectedDriverId),
    [assignments, selectedDriverId],
  );

  if (!selectedDriver) {
    return <p className="text-sm text-gray-500">No drivers available.</p>;
  }

  const setStatus = (status: Driver["status"]) => {
    startTransition(async () => {
      const result = await updateDriverStatus(selectedDriver.id, status);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Driver status updated");
    });
  };

  const sendGpsPing = async (shipmentId: string) => {
    setIsSendingGps(true);
    try {
      let latitude = 23.0225;
      let longitude = 72.5714;

      if (typeof navigator !== "undefined" && navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 6000,
          });
        }).catch(() => null);

        if (position) {
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        }
      }

      const response = await fetch("/api/tracking/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipment_id: shipmentId,
          latitude,
          longitude,
          accuracy_meters: 10,
          speed_kmph: 42,
          heading_degrees: 95,
          recorded_at: new Date().toISOString(),
        }),
      });

      const json = (await response.json()) as { error?: string };
      if (!response.ok || json.error) {
        toast.error(json.error ?? "Failed to send GPS ping");
        return;
      }

      toast.success("Live GPS ping sent");
    } finally {
      setIsSendingGps(false);
    }
  };

  return (
    <div className="space-y-3">
      <select
        value={selectedDriverId}
        onChange={(e) => setSelectedDriverId(e.target.value)}
        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
      >
        {drivers.map((driver) => (
          <option key={driver.id} value={driver.id}>
            {driver.full_name}
          </option>
        ))}
      </select>

      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <p className="text-sm font-semibold text-gray-900">{selectedDriver.full_name}</p>
        <p className="text-xs text-gray-600">Current status: {selectedDriver.status}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={isPending} onClick={() => setStatus("available")}>Available</Button>
          <Button type="button" variant="outline" disabled={isPending} onClick={() => setStatus("on_trip")}>On Trip</Button>
          <Button type="button" variant="outline" disabled={isPending} onClick={() => setStatus("off_duty")}>Off Duty</Button>
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-800">Assignments</p>
        {driverAssignments.length === 0 ? (
          <p className="text-sm text-gray-500">No active assignments.</p>
        ) : (
          driverAssignments.map((assignment) => (
            <div key={assignment.id} className="rounded-md border border-gray-200 bg-white p-3 text-sm">
              <p className="font-medium text-gray-900">{assignment.shipment_number}</p>
              <p className="text-gray-700">{assignment.origin_city} to {assignment.destination_city}</p>
              <p className="text-xs text-gray-500">Status: {assignment.status}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-2"
                disabled={isSendingGps}
                onClick={() => void sendGpsPing(assignment.id)}
              >
                {isSendingGps ? "Sending..." : "Send GPS Ping"}
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
