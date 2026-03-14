"use server";

import { revalidatePath } from "next/cache";

import {
  createUserSchema,
  customerUpdateSchema,
  updateUserRoleSchema,
  type CreateUserInput,
  type CustomerUpdateInput,
} from "@/lib/validations/customer";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ShipmentRow = Database["public"]["Tables"]["shipments"]["Row"];
type UserRole = ProfileRow["role"];

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

export type CustomerSummary = Pick<ProfileRow, "id" | "full_name" | "email" | "created_at"> & {
  total_shipments: number;
  in_transit_shipments: number;
  delivered_shipments: number;
  last_shipment_at: string | null;
};

export type UserSummary = Pick<ProfileRow, "id" | "full_name" | "email" | "role" | "created_at">;

export type CustomerOption = Pick<ProfileRow, "id" | "full_name" | "email">;

async function getSessionRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, role: null as UserRole | null };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  return { supabase, user, role: profile?.role ?? null };
}

function canManageUsers(role: UserRole | null) {
  return role === "admin" || role === "dispatcher";
}

export async function getUsers(search?: string): Promise<ActionResult<UserSummary[]>> {
  const { user, role } = await getSessionRole();

  if (!user) return { data: null, error: "Unauthorized" };
  if (!canManageUsers(role)) return { data: null, error: "Forbidden" };

  const adminClient = createAdminClient();
  let query = adminClient.from("profiles").select("id, full_name, email, role, created_at").order("created_at", { ascending: false });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;

  return {
    data: (data ?? []) as UserSummary[],
    error: error?.message ?? null,
  };
}

export async function getCustomers(search?: string): Promise<ActionResult<CustomerSummary[]>> {
  const { user, role } = await getSessionRole();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  if (!canManageUsers(role)) {
    return { data: null, error: "Forbidden" };
  }

  const adminClient = createAdminClient();
  let customerQuery = adminClient
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

  const { data: shipments, error: shipmentError } = await adminClient
    .from("shipments")
    .select("id, customer_id, status, created_at")
    .in("customer_id", customerIds);

  if (shipmentError) {
    return { data: null, error: shipmentError.message };
  }

  const summaries = (customers ?? []).map((customer) => {
    const customerShipments = (
      (shipments ?? []) as Pick<ShipmentRow, "id" | "customer_id" | "status" | "created_at">[]
    ).filter((shipment) => shipment.customer_id === customer.id);

    return {
      ...customer,
      total_shipments: customerShipments.length,
      in_transit_shipments: customerShipments.filter((shipment) => shipment.status === "in_transit").length,
      delivered_shipments: customerShipments.filter((shipment) => shipment.status === "delivered").length,
      last_shipment_at:
        customerShipments
          .map((shipment) => shipment.created_at)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null,
    };
  });

  return { data: summaries, error: null };
}

export async function getCustomerOptions(): Promise<ActionResult<CustomerOption[]>> {
  const { user, role } = await getSessionRole();

  if (!user) return { data: null, error: "Unauthorized" };
  if (!canManageUsers(role)) return { data: null, error: "Forbidden" };

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "customer")
    .order("full_name");

  return {
    data: (data ?? []) as CustomerOption[],
    error: error?.message ?? null,
  };
}

export async function createUserAccount(input: unknown): Promise<ActionResult<{ id: string; role: UserRole }>> {
  const { user, role } = await getSessionRole();

  if (!user) return { data: null, error: "Unauthorized" };
  if (!canManageUsers(role)) return { data: null, error: "Forbidden" };

  const parsed = createUserSchema.safeParse(input);

  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Invalid user payload" };
  }

  const payload = parsed.data as CreateUserInput;

  if (role !== "admin" && payload.role !== "customer") {
    return { data: null, error: "Dispatchers can only create customer accounts" };
  }

  const adminClient = createAdminClient();
  const { data: existing } = await adminClient.from("profiles").select("id").eq("email", payload.email).maybeSingle();
  if (existing) {
    return { data: null, error: "Email is already registered" };
  }
  const { data: authResult, error: authError } = await adminClient.auth.admin.createUser({
    email: payload.email,
    password: payload.password,
    email_confirm: true,
    user_metadata: {
      full_name: payload.full_name,
      role: payload.role,
    },
  });

  if (authError || !authResult.user) {
    return { data: null, error: authError?.message ?? "Unable to create user" };
  }

  const { error: profileError } = await adminClient
    .from("profiles")
    .update({
      full_name: payload.full_name,
      email: payload.email,
      role: payload.role,
    })
    .eq("id", authResult.user.id);

  if (profileError) {
    return { data: null, error: profileError.message };
  }

  revalidatePath("/customers");
  revalidatePath("/shipments/new");

  return { data: { id: authResult.user.id, role: payload.role }, error: null };
}

export async function updateUserRole(input: unknown): Promise<ActionResult<null>> {
  const { role } = await getSessionRole();

  if (role !== "admin") {
    return { data: null, error: "Only admins can update user roles" };
  }

  const parsed = updateUserRoleSchema.safeParse(input);

  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Invalid role payload" };
  }

  const payload = parsed.data;

  const adminClient = createAdminClient();
  const { error: authError } = await adminClient.auth.admin.updateUserById(payload.user_id, {
    user_metadata: {
      role: payload.role,
    },
  });

  if (authError) {
    return { data: null, error: authError.message };
  }

  const { error: profileError } = await adminClient
    .from("profiles")
    .update({ role: payload.role })
    .eq("id", payload.user_id);

  if (profileError) {
    return { data: null, error: profileError.message };
  }

  revalidatePath("/customers");
  revalidatePath("/dashboard");

  return { data: null, error: null };
}

export async function updateCustomer(customerId: string, input: unknown): Promise<ActionResult<null>> {
  const { user, role } = await getSessionRole();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  if (!canManageUsers(role)) {
    return { data: null, error: "Forbidden" };
  }

  const parsed = customerUpdateSchema.safeParse(input);

  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Invalid customer data" };
  }

  const payload = parsed.data as CustomerUpdateInput;
  const adminClient = createAdminClient();
  const { data: existing } = await adminClient
    .from("profiles")
    .select("id")
    .eq("email", payload.email)
    .neq("id", customerId)
    .maybeSingle();

  if (existing) {
    return { data: null, error: "Email is already registered" };
  }

  const { error } = await adminClient
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
