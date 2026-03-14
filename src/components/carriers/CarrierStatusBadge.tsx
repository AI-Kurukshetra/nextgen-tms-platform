import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CarrierStatusBadgeProps = {
  status: "active" | "inactive" | "suspended";
};

const statusClasses: Record<CarrierStatusBadgeProps["status"], string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  inactive: "bg-gray-100 text-gray-700 border-gray-200",
  suspended: "bg-red-100 text-red-700 border-red-200",
};

export function CarrierStatusBadge({ status }: CarrierStatusBadgeProps) {
  return <Badge className={cn("border", statusClasses[status])}>{status}</Badge>;
}
