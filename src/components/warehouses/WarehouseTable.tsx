"use client";

import { Building2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Database } from "@/types/database";

type Warehouse = Database["public"]["Tables"]["warehouses"]["Row"];

type WarehouseTableProps = {
  warehouses: Warehouse[];
};

function statusClass(status: Warehouse["status"]) {
  if (status === "active") return "bg-green-100 text-green-700 border-green-200";
  if (status === "inactive") return "bg-gray-100 text-gray-700 border-gray-200";
  return "bg-amber-100 text-amber-700 border-amber-200";
}

export function WarehouseTable({ warehouses }: WarehouseTableProps) {
  if (warehouses.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
        <Building2 className="h-8 w-8 text-gray-400" />
        <h3 className="mt-3 text-base font-semibold text-gray-900">No warehouses found</h3>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-white/80">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>City</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Capacity (sqft)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Manager</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {warehouses.map((warehouse) => (
            <TableRow key={warehouse.id}>
              <TableCell className="font-medium">{warehouse.code}</TableCell>
              <TableCell>{warehouse.name}</TableCell>
              <TableCell>{warehouse.city}</TableCell>
              <TableCell>{warehouse.state}</TableCell>
              <TableCell>{warehouse.capacity_sqft?.toLocaleString("en-IN") ?? "-"}</TableCell>
              <TableCell>
                <Badge className={`border ${statusClass(warehouse.status)}`}>{warehouse.status}</Badge>
              </TableCell>
              <TableCell>{warehouse.manager_name ?? "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
