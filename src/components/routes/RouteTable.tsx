"use client";

import { Route } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { Database } from "@/types/database";

type RouteRow = Database["public"]["Tables"]["routes"]["Row"];

type RouteTableProps = {
  routes: RouteRow[];
};

function modeClass(mode: RouteRow["transport_mode"]) {
  if (mode === "truck") return "bg-orange-100 text-orange-700 border-orange-200";
  if (mode === "rail") return "bg-blue-100 text-blue-700 border-blue-200";
  if (mode === "air") return "bg-sky-100 text-sky-700 border-sky-200";
  if (mode === "ocean") return "bg-teal-100 text-teal-700 border-teal-200";
  return "bg-purple-100 text-purple-700 border-purple-200";
}

export function RouteTable({ routes }: RouteTableProps) {
  if (routes.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
        <Route className="h-8 w-8 text-gray-400" />
        <h3 className="mt-3 text-base font-semibold text-gray-900">No routes found</h3>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-white/80">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Origin</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Distance</TableHead>
            <TableHead>Est. Hours</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>Toll</TableHead>
            <TableHead>Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routes.map((route) => (
            <TableRow key={route.id}>
              <TableCell className="font-medium">{route.name}</TableCell>
              <TableCell>{route.origin_city}, {route.origin_state}</TableCell>
              <TableCell>{route.destination_city}, {route.destination_state}</TableCell>
              <TableCell>{route.distance_km} km</TableCell>
              <TableCell>{route.estimated_hours}</TableCell>
              <TableCell>
                <Badge className={`border capitalize ${modeClass(route.transport_mode)}`}>
                  {route.transport_mode}
                </Badge>
              </TableCell>
              <TableCell>{formatCurrency(route.toll_charges)}</TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <span className={`h-2.5 w-2.5 rounded-full ${route.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                  {route.is_active ? "Active" : "Inactive"}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
