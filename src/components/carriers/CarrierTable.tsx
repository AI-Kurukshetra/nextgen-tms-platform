"use client";

import { Truck } from "lucide-react";

import { CarrierStatusBadge } from "@/components/carriers/CarrierStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Database } from "@/types/database";

type Carrier = Database["public"]["Tables"]["carriers"]["Row"];

type CarrierTableProps = {
  carriers: Carrier[];
};

function modeClass(mode: Carrier["transport_mode"]) {
  if (mode === "truck") return "bg-orange-100 text-orange-700 border-orange-200";
  if (mode === "rail") return "bg-blue-100 text-blue-700 border-blue-200";
  if (mode === "air") return "bg-sky-100 text-sky-700 border-sky-200";
  if (mode === "ocean") return "bg-teal-100 text-teal-700 border-teal-200";
  return "bg-purple-100 text-purple-700 border-purple-200";
}

export function CarrierTable({ carriers }: CarrierTableProps) {
  if (carriers.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
        <Truck className="h-8 w-8 text-gray-400" />
        <h3 className="mt-3 text-base font-semibold text-gray-900">No carriers found</h3>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {carriers.map((carrier) => {
            const stars = Math.round(carrier.rating ?? 0);
            return (
              <TableRow key={carrier.id}>
                <TableCell className="font-medium">{carrier.code}</TableCell>
                <TableCell>{carrier.name}</TableCell>
                <TableCell>
                  <Badge className={`border capitalize ${modeClass(carrier.transport_mode)}`}>
                    {carrier.transport_mode}
                  </Badge>
                </TableCell>
                <TableCell>
                  <p>{carrier.contact_name ?? "-"}</p>
                  <p className="text-xs text-gray-500">{carrier.contact_phone ?? carrier.contact_email ?? "-"}</p>
                </TableCell>
                <TableCell>
                  <span className="text-amber-500">{"★".repeat(stars)}</span>
                  <span className="text-gray-300">{"★".repeat(Math.max(0, 5 - stars))}</span>
                </TableCell>
                <TableCell>
                  <CarrierStatusBadge status={carrier.status} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
