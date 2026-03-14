"use server";

import { revalidatePath } from "next/cache";

import { customerUpdateSchema, type CustomerUpdateInput } from "@/lib/validations/customer";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type CustomerRow = Database["public"]["Tables"]["profiles"]["Row"];
type ShipmentRow = Database["public"]["Tables"]["shipments"]["Row"];

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

export type CustomerSummary = Pick<CustomerRow, "id" | "full_name" | "email" | "created_at"> & {
  total_shipments: number;
  in_transit_shipments: number;
  delivered_shipments: number;
  last_shipment_at: string | null;
};

async function getSessionRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, role: null as string | null };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  return { supabase, user, role: profile?.role ?? null };
}

export async function getCustomers(search?: string): Promise<ActionResult<CustomerSummary[]>> {
  const { supabase, user, role } = await getSessionRole();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  if (role !== "admin" && role !== "dispatcher") {
    return { data: null, error: "Forbidden" };
  }

  let customerQuery = supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (search) {
    customerQuery = customerQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data: customers, error } = await customerQuery;

  if (error) {
    return { data: null, error: error.message };
  }

  const customerIds = (customers ?? []).map((customer) => customer.id);
  if (customerIds.length === 0) {
    return { data: [], error: null };
  }

  const { data: shipments, error: shipmentError } = await supabase
    .from("shipments")
    .select("id, customer_id, status, created_at")
    .in("customer_id", customerIds);

  if (shipmentError) {
    return { data: null, error: shipmentError.message };
  }

  const summaries = (customers ?? []).map((customer) => {
    const customerShipments = ((shipments ?? []) as Pick<ShipmentRow, "id" | "customer_id" | "status" | "created_at">[]).filter(
      (shipment) => shipment.customer_id === customer.id,
    );

    return {
      ...customer,
      total_shipments: customerShipments.length,
      in_transit_shipments: customerShipments.filter((shipment) => shipment.status === "in_transit").length,
      delivered_shipments: customerShipments.filter((shipment) => shipment.status === "delivered").length,
      last_shipment_at: customerShipments
        .map((shipment) => shipment.created_at)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null,
    };
  });

  return { data: summaries, error: null };
}

export async function updateCustomer(customerId: string, input: unknown): Promise<ActionResult<null>> {
  const { supabase, user, role } = await getSessionRole();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  if (role !== "admin" && role !== "dispatcher") {
    return { data: null, error: "Forbidden" };
  }

  const parsed = customerUpdateSchema.safeParse(input);

  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Invalid customer data" };
  }

  const payload = parsed.data as CustomerUpdateInput;

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: payload.full_name, email: payload.email })
    .eq("id", customerId)
    .eq("role", "customer");

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath("/customers");
  return { data: null, error: null };
}
