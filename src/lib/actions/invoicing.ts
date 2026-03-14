"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { runFreightAudit } from "@/lib/freight-audit";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ShipmentRow = Database["public"]["Tables"]["shipments"]["Row"];
type RouteRow = Database["public"]["Tables"]["routes"]["Row"];
type CarrierRow = Database["public"]["Tables"]["carriers"]["Row"];
type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

export type InvoicingRow = {
  shipment: ShipmentRow;
  invoice: InvoiceRow | null;
  invoice_status: InvoiceRow["status"] | "draft";
  paidAmount: number;
  outstanding: number;
  payments: PaymentRow[];
  audit: ReturnType<typeof runFreightAudit>;
};

const paymentInputSchema = z.object({
  amount_inr: z.number().positive().optional(),
  method: z.enum(["bank_transfer", "upi", "card", "cash", "other"]).optional(),
  reference_no: z.string().trim().max(100).optional(),
});

function invoiceNumber() {
  return `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 100000)}`;
}

async function getSessionRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, role: null as string | null };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return { supabase, user, role: profile?.role ?? null };
}

export async function getInvoicingOverview(): Promise<ActionResult<InvoicingRow[]>> {
  const supabase = await createClient();

  const { data: shipments, error: shipmentError } = await supabase
    .from("shipments")
    .select("*")
    .in("status", ["delivered", "in_transit", "delayed"])
    .order("created_at", { ascending: false })
    .limit(40);

  if (shipmentError) {
    return { data: null, error: shipmentError.message };
  }

  const shipmentIds = (shipments ?? []).map((shipment) => shipment.id);
  const routeIds = Array.from(new Set((shipments ?? []).map((s) => s.route_id).filter((id): id is string => Boolean(id))));
  const carrierIds = Array.from(new Set((shipments ?? []).map((s) => s.carrier_id).filter((id): id is string => Boolean(id))));

  const [routesResult, carriersResult, invoicesResult] = await Promise.all([
    routeIds.length ? supabase.from("routes").select("*").in("id", routeIds) : Promise.resolve({ data: [] as RouteRow[] }),
    carrierIds.length
      ? supabase.from("carriers").select("*").in("id", carrierIds)
      : Promise.resolve({ data: [] as CarrierRow[] }),
    shipmentIds.length
      ? supabase.from("invoices").select("*").in("shipment_id", shipmentIds)
      : Promise.resolve({ data: [] as InvoiceRow[] }),
  ]);

  const invoices = (invoicesResult.data ?? []) as InvoiceRow[];
  const invoiceIds = invoices.map((invoice) => invoice.id);

  const paymentsResult = invoiceIds.length
    ? await supabase.from("payments").select("*").in("invoice_id", invoiceIds)
    : { data: [] as PaymentRow[] };

  const routesById = new Map((routesResult.data ?? []).map((route) => [route.id, route]));
  const carriersById = new Map((carriersResult.data ?? []).map((carrier) => [carrier.id, carrier]));
  const invoicesByShipmentId = new Map(invoices.map((invoice) => [invoice.shipment_id, invoice]));

  const paidByInvoiceId = new Map<string, number>();
  const paymentsByInvoiceId = new Map<string, PaymentRow[]>();
  for (const payment of (paymentsResult.data ?? []) as PaymentRow[]) {
    paidByInvoiceId.set(payment.invoice_id, (paidByInvoiceId.get(payment.invoice_id) ?? 0) + Number(payment.amount_inr));
    const list = paymentsByInvoiceId.get(payment.invoice_id) ?? [];
    list.push(payment);
    paymentsByInvoiceId.set(payment.invoice_id, list);
  }

  const rows = (shipments ?? []).map((shipment) => {
    const route = shipment.route_id ? routesById.get(shipment.route_id) ?? null : null;
    const carrier = shipment.carrier_id ? carriersById.get(shipment.carrier_id) ?? null : null;
    const audit = runFreightAudit(shipment, route, carrier);
    const invoice = invoicesByShipmentId.get(shipment.id) ?? null;
    const paidAmount = invoice ? Number(paidByInvoiceId.get(invoice.id) ?? 0) : 0;
    const outstanding = invoice ? Math.max(0, Number(invoice.total_inr) - paidAmount) : 0;
    const payments = invoice ? (paymentsByInvoiceId.get(invoice.id) ?? []).sort((a, b) => (a.paid_at < b.paid_at ? 1 : -1)) : [];
    const isOverdue = Boolean(
      invoice &&
        outstanding > 0 &&
        invoice.status !== "cancelled" &&
        invoice.due_at &&
        new Date(invoice.due_at).getTime() < Date.now(),
    );

    return {
      shipment,
      invoice,
      invoice_status: invoice ? (isOverdue ? "overdue" : invoice.status) : "draft",
      paidAmount,
      outstanding,
      payments,
      audit,
    };
  });

  return { data: rows, error: null };
}

export async function issueInvoiceForShipment(shipmentId: string): Promise<ActionResult<InvoiceRow>> {
  const { supabase, user, role } = await getSessionRole();

  if (!user) return { data: null, error: "Unauthorized" };
  if (role !== "admin" && role !== "dispatcher") return { data: null, error: "Forbidden" };

  const { data: shipment, error: shipmentError } = await supabase.from("shipments").select("*").eq("id", shipmentId).single();
  if (shipmentError || !shipment) return { data: null, error: shipmentError?.message ?? "Shipment not found" };

  const [routeResult, carrierResult, existingInvoiceResult] = await Promise.all([
    shipment.route_id ? supabase.from("routes").select("*").eq("id", shipment.route_id).maybeSingle() : Promise.resolve({ data: null }),
    shipment.carrier_id
      ? supabase.from("carriers").select("*").eq("id", shipment.carrier_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("invoices").select("*").eq("shipment_id", shipmentId).maybeSingle(),
  ]);

  const audit = runFreightAudit(shipment, routeResult.data ?? null, carrierResult.data ?? null);
  const subtotal = Number((shipment.freight_cost ?? audit.expected_cost).toFixed(2));
  const tax = Number((subtotal * 0.18).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  const payload = {
    shipment_id: shipmentId,
    invoice_number: existingInvoiceResult.data?.invoice_number ?? invoiceNumber(),
    subtotal_inr: subtotal,
    tax_inr: tax,
    total_inr: total,
    status: "issued" as const,
    issued_at: new Date().toISOString(),
    due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: user.id,
  };

  const query = existingInvoiceResult.data
    ? supabase.from("invoices").update(payload).eq("id", existingInvoiceResult.data.id).select("*").single()
    : supabase.from("invoices").insert(payload).select("*").single();

  const { data, error } = await query;
  if (error || !data) return { data: null, error: error?.message ?? "Unable to issue invoice" };

  revalidatePath("/invoicing");
  revalidatePath(`/shipments/${shipmentId}`);

  return { data, error: null };
}

export async function recordInvoicePayment(
  invoiceId: string,
  input?: { amount_inr?: number; method?: PaymentRow["method"]; reference_no?: string | null },
): Promise<ActionResult<null>> {
  const { supabase, user, role } = await getSessionRole();

  if (!user) return { data: null, error: "Unauthorized" };
  if (role !== "admin" && role !== "dispatcher") return { data: null, error: "Forbidden" };

  const { data: invoice, error: invoiceError } = await supabase.from("invoices").select("*").eq("id", invoiceId).single();
  if (invoiceError || !invoice) return { data: null, error: invoiceError?.message ?? "Invoice not found" };

  const { data: existingPayments } = await supabase.from("payments").select("amount_inr").eq("invoice_id", invoiceId);
  const alreadyPaid = (existingPayments ?? []).reduce((acc, payment) => acc + Number(payment.amount_inr), 0);
  const outstanding = Number(invoice.total_inr) - alreadyPaid;

  if (outstanding <= 0) {
    return { data: null, error: "Invoice already fully paid" };
  }

  const parsed = paymentInputSchema.safeParse({
    amount_inr: input?.amount_inr,
    method: input?.method,
    reference_no: input?.reference_no ?? undefined,
  });

  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Invalid payment payload" };
  }

  const amountToPay = Number((parsed.data.amount_inr ?? outstanding).toFixed(2));
  if (amountToPay <= 0) {
    return { data: null, error: "Payment amount must be greater than zero" };
  }

  if (amountToPay > outstanding) {
    return { data: null, error: "Payment amount cannot exceed outstanding balance" };
  }

  const { error: paymentError } = await supabase.from("payments").insert({
    invoice_id: invoiceId,
    amount_inr: amountToPay,
    method: parsed.data.method ?? "bank_transfer",
    reference_no: parsed.data.reference_no || `PAY-${Date.now()}`,
    created_by: user.id,
  });

  if (paymentError) {
    return { data: null, error: paymentError.message };
  }

  const remaining = Number((outstanding - amountToPay).toFixed(2));
  const nextStatus: InvoiceRow["status"] =
    remaining <= 0
      ? "paid"
      : invoice.due_at && new Date(invoice.due_at).getTime() < Date.now()
        ? "overdue"
        : "issued";

  const { error: updateError } = await supabase
    .from("invoices")
    .update({ status: nextStatus, paid_at: remaining <= 0 ? new Date().toISOString() : null })
    .eq("id", invoiceId);

  if (updateError) {
    return { data: null, error: updateError.message };
  }

  revalidatePath("/invoicing");

  return { data: null, error: null };
}
