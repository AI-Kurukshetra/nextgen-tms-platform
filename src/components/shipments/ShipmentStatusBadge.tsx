import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS, type ShipmentStatus } from "@/types";
import { cn } from "@/lib/utils";

type ShipmentStatusBadgeProps = {
  status: ShipmentStatus;
};

function formatStatus(status: ShipmentStatus) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function ShipmentStatusBadge({ status }: ShipmentStatusBadgeProps) {
  return <Badge className={cn("border", STATUS_COLORS[status])}>{formatStatus(status)}</Badge>;
}
