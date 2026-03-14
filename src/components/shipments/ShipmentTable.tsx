"use client";

import { Package2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { DeleteShipmentDialog } from "@/components/shipments/DeleteShipmentDialog";
import { ShipmentStatusBadge } from "@/components/shipments/ShipmentStatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { Database } from "@/types/database";

type ShipmentRow = Database["public"]["Tables"]["shipments"]["Row"] & {
  carriers?: { name: string } | null;
  drivers?: { full_name: string } | null;
};

type ShipmentTableProps = {
  shipments: ShipmentRow[];
  canDelete: boolean;
};

export function ShipmentTable({ shipments, canDelete }: ShipmentTableProps) {
  const router = useRouter();

  if (shipments.length === 0) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
        <Package2 className="h-8 w-8 text-gray-400" />
        <h3 className="mt-3 text-base font-semibold text-gray-900">No shipments found</h3>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Shipment #</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Weight</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Carrier</TableHead>
            <TableHead>Scheduled Delivery</TableHead>
            {canDelete && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {shipments.map((shipment) => (
            <TableRow key={shipment.id} className="cursor-pointer" onClick={() => router.push(`/shipments/${shipment.id}`)}>
              <TableCell className="font-medium">{shipment.shipment_number}</TableCell>
              <TableCell>
                {shipment.origin_city} to {shipment.destination_city}
              </TableCell>
              <TableCell className="capitalize">{shipment.cargo_type.replace("_", " ")}</TableCell>
              <TableCell>{shipment.weight_kg} kg</TableCell>
              <TableCell>
                <ShipmentStatusBadge status={shipment.status} />
              </TableCell>
              <TableCell>{shipment.carriers?.name ?? "-"}</TableCell>
              <TableCell>{formatDate(shipment.scheduled_delivery)}</TableCell>
              {canDelete && (
                <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                  <DeleteShipmentDialog
                    shipmentId={shipment.id}
                    shipmentNumber={shipment.shipment_number}
                    onDeleted={() => router.refresh()}
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
