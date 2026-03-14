import { Users } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { CustomerSummary } from "@/lib/actions/customers";

type CustomerTableProps = {
  customers: CustomerSummary[];
};

export function CustomerTable({ customers }: CustomerTableProps) {
  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <Users className="mb-3 h-8 w-8 text-gray-400" />
        <h3 className="text-base font-medium text-gray-900">No customers found</h3>
        <p className="mt-1 text-sm text-gray-500">Create a user with role `customer` from the form above.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-white/80">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Total Shipments</TableHead>
            <TableHead>In Transit</TableHead>
            <TableHead>Delivered</TableHead>
            <TableHead>Last Shipment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium text-gray-900">{customer.full_name}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.total_shipments}</TableCell>
              <TableCell>{customer.in_transit_shipments}</TableCell>
              <TableCell>{customer.delivered_shipments}</TableCell>
              <TableCell>{customer.last_shipment_at ? formatDate(customer.last_shipment_at) : "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
