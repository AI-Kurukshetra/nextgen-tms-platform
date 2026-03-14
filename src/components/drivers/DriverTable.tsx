"use client";

import { Car } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { Database } from "@/types/database";

type Driver = Database["public"]["Tables"]["drivers"]["Row"] & {
  carriers?: { name: string } | null;
};

type DriverTableProps = {
  drivers: Driver[];
};

function statusClass(status: Driver["status"]) {
  if (status === "available") return "bg-green-100 text-green-700 border-green-200";
  if (status === "on_trip") return "bg-blue-100 text-blue-700 border-blue-200";
  if (status === "off_duty") return "bg-gray-100 text-gray-700 border-gray-200";
  return "bg-red-100 text-red-700 border-red-200";
}

export function DriverTable({ drivers }: DriverTableProps) {
  if (drivers.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
        <Car className="h-8 w-8 text-gray-400" />
        <h3 className="mt-3 text-base font-semibold text-gray-900">No drivers found</h3>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>License #</TableHead>
            <TableHead>Expiry</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Carrier</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((driver) => {
            const isExpired = new Date(driver.license_expiry) < new Date();

            return (
              <TableRow key={driver.id}>
                <TableCell className="font-medium">{driver.full_name}</TableCell>
                <TableCell>{driver.license_number}</TableCell>
                <TableCell className={isExpired ? "text-red-600" : "text-gray-700"}>
                  {formatDate(driver.license_expiry)}
                </TableCell>
                <TableCell>{driver.phone}</TableCell>
                <TableCell>{driver.carriers?.name ?? "-"}</TableCell>
                <TableCell>{driver.vehicle_number ?? "-"}</TableCell>
                <TableCell>
                  <Badge className={`border ${statusClass(driver.status)}`}>{driver.status}</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
