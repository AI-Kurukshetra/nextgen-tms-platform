"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateShipmentStatus } from "@/lib/actions/shipments";
import type { ShipmentStatus } from "@/types";
import { Select, SelectItem } from "@/components/ui/select";

type ShipmentStatusUpdaterProps = {
  shipmentId: string;
  currentStatus: ShipmentStatus;
  userRole: string | null;
};

const nextStatuses: Record<ShipmentStatus, ShipmentStatus[]> = {
  draft: ["confirmed", "cancelled"],
  confirmed: ["assigned", "cancelled"],
  assigned: ["in_transit"],
  in_transit: ["delayed", "delivered"],
  delayed: ["in_transit"],
  delivered: [],
  cancelled: [],
};

export function ShipmentStatusUpdater({ shipmentId, currentStatus, userRole }: ShipmentStatusUpdaterProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (userRole !== "admin" && userRole !== "dispatcher") return null;

  const options: ShipmentStatus[] = [currentStatus, ...nextStatuses[currentStatus]];
  const hasTransitions = nextStatuses[currentStatus].length > 0;

  return (
    <div className="w-full max-w-xs">
      {!hasTransitions && <p className="text-sm text-gray-500">No further transitions available.</p>}
      <Select
        defaultValue={currentStatus}
        disabled={isPending || !hasTransitions}
        onValueChange={(value) => {
          if (value === currentStatus) return;
          startTransition(async () => {
            const result = await updateShipmentStatus(shipmentId, value as ShipmentStatus);
            if (result.error) {
              toast.error(result.error);
              return;
            }
            toast.success("Status updated");
            router.refresh();
          });
        }}
      >
        {options.map((status) => (
          <SelectItem key={status} value={status}>
            {status.replace("_", " ")}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}
