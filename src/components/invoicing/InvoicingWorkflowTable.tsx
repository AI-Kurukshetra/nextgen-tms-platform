"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { issueInvoiceForShipment, recordInvoicePayment, type InvoicingRow } from "@/lib/actions/invoicing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

export function InvoicingWorkflowTable({ rows }: { rows: InvoicingRow[] }) {
  const [isPending, startTransition] = useTransition();
  const [amountByInvoice, setAmountByInvoice] = useState<Record<string, string>>({});
  const [methodByInvoice, setMethodByInvoice] = useState<
    Record<string, "bank_transfer" | "upi" | "card" | "cash" | "other">
  >({});
  const [referenceByInvoice, setReferenceByInvoice] = useState<Record<string, string>>({});

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
    const inputAmount = amountByInvoice[invoiceId];
    const parsedAmount = inputAmount ? Number(inputAmount) : undefined;

    if (parsedAmount !== undefined && Number.isNaN(parsedAmount)) {
      toast.error("Enter a valid payment amount");
      return;
    }

    startTransition(async () => {
      const result = await recordInvoicePayment(invoiceId, {
        amount_inr: parsedAmount,
        method: methodByInvoice[invoiceId] ?? "bank_transfer",
        reference_no: referenceByInvoice[invoiceId]?.trim() || undefined,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Payment recorded");
      setAmountByInvoice((prev) => ({ ...prev, [invoiceId]: "" }));
      setReferenceByInvoice((prev) => ({ ...prev, [invoiceId]: "" }));
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
            const invoiceStatus = row.invoice_status;
            const auditColor =
              row.audit.status === "approved"
                ? "bg-green-100 text-green-700 border-green-200"
                : row.audit.status === "review"
                  ? "bg-amber-100 text-amber-700 border-amber-200"
                  : "bg-red-100 text-red-700 border-red-200";
            const invoiceId = row.invoice?.id ?? null;
            const recentPayments = row.payments.slice(0, 2);

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
                    {invoiceId && row.outstanding > 0 && (
                      <>
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={amountByInvoice[invoiceId] ?? ""}
                          onChange={(event) =>
                            setAmountByInvoice((prev) => ({ ...prev, [invoiceId]: event.target.value }))
                          }
                          placeholder={`Up to ${row.outstanding.toFixed(2)}`}
                          className="h-8 w-36"
                        />
                        <Select
                          value={methodByInvoice[invoiceId] ?? "bank_transfer"}
                          onValueChange={(value) =>
                            setMethodByInvoice((prev) => ({
                              ...prev,
                              [invoiceId]: value as "bank_transfer" | "upi" | "card" | "cash" | "other",
                            }))
                          }
                          className="h-8 w-32"
                        >
                          <SelectItem value="bank_transfer">Bank</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </Select>
                        <Input
                          value={referenceByInvoice[invoiceId] ?? ""}
                          onChange={(event) =>
                            setReferenceByInvoice((prev) => ({ ...prev, [invoiceId]: event.target.value }))
                          }
                          placeholder="Reference"
                          className="h-8 w-32"
                        />
                        <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={() => receivePayment(invoiceId)}>
                          Receive Payment
                        </Button>
                      </>
                    )}
                    {isPending && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
                  </div>
                  {recentPayments.length > 0 && (
                    <div className="mt-2 space-y-1 text-xs text-gray-600">
                      {recentPayments.map((payment) => (
                        <p key={payment.id}>
                          {formatCurrency(payment.amount_inr)} via {payment.method}
                        </p>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
