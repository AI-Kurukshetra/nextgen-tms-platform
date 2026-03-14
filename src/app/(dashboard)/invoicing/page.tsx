import { InvoicingWorkflowTable } from "@/components/invoicing/InvoicingWorkflowTable";
import { getInvoicingOverview } from "@/lib/actions/invoicing";

export default async function InvoicingPage() {
  const { data, error } = await getInvoicingOverview();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Freight Audit & Payment</h1>
        <p className="text-sm text-gray-600">Issue invoices and post payments for delivered/in-transit shipments.</p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : <InvoicingWorkflowTable rows={data ?? []} />}
    </div>
  );
}
