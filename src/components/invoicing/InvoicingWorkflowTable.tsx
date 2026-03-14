"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { issueInvoiceForShipment, recordInvoicePayment, type InvoicingRow } from "@/lib/actions/invoicing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export function InvoicingWorkflowTable({ rows }: { rows: InvoicingRow[] }) {
  const [isPending, startTransition] = useTransition();

  const issueInvoice = (shipmentId: string) => {
    startTransition(async () => {
      const result = await issueInvoiceForShipment(shipmentId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Invoice ${result.data?.invoice_number ?? "issued"}`);
    });
  };

  const receivePayment = (invoiceId: string) => {
    startTransition(async () => {
      const result = await recordInvoicePayment(invoiceId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Payment recorded");
    });
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left">Shipment</th>
            <th className="px-3 py-2 text-left">Expected</th>
            <th className="px-3 py-2 text-left">Billed</th>
            <th className="px-3 py-2 text-left">Invoice</th>
            <th className="px-3 py-2 text-left">Paid</th>
            <th className="px-3 py-2 text-left">Outstanding</th>
            <th className="px-3 py-2 text-left">Audit</th>
            <th className="px-3 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const invoiceStatus = row.invoice?.status ?? "draft";
            const auditColor =
              row.audit.status === "approved"
                ? "bg-green-100 text-green-700 border-green-200"
                : row.audit.status === "review"
                  ? "bg-amber-100 text-amber-700 border-amber-200"
                  : "bg-red-100 text-red-700 border-red-200";

            return (
              <tr key={row.shipment.id} className="border-t">
                <td className="px-3 py-2">{row.shipment.shipment_number}</td>
                <td className="px-3 py-2">{formatCurrency(row.audit.expected_cost)}</td>
                <td className="px-3 py-2">{formatCurrency(row.audit.billed_cost)}</td>
                <td className="px-3 py-2">
                  {row.invoice ? (
                    <div>
                      <p className="font-medium text-gray-900">{row.invoice.invoice_number}</p>
                      <p className="text-xs capitalize text-gray-600">{invoiceStatus}</p>
                    </div>
                  ) : (
                    <span className="text-gray-500">Not issued</span>
                  )}
                </td>
                <td className="px-3 py-2">{formatCurrency(row.paidAmount)}</td>
                <td className="px-3 py-2">{formatCurrency(row.outstanding)}</td>
                <td className="px-3 py-2">
                  <Badge className={`border capitalize ${auditColor}`}>{row.audit.status}</Badge>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => issueInvoice(row.shipment.id)}
                    >
                      Issue / Refresh
                    </Button>
                    {row.invoice && row.outstanding > 0 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => receivePayment(row.invoice!.id)}
                      >
                        Receive Payment
                      </Button>
                    )}
                    {isPending && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
