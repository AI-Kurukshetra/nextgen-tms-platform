import { redirect } from "next/navigation";

import { CreateUserForm } from "@/components/customers/CreateUserForm";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { UserTable } from "@/components/customers/UserTable";
import { getCustomers, getUsers } from "@/lib/actions/customers";
import { createClient } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";

type SearchParams = Promise<{ search?: string }>;

export default async function CustomersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const search = params.search;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role ?? null;

  if (role === "customer") {
    redirect("/customer");
  }

  const [customersResult, usersResult] = await Promise.all([getCustomers(search), getUsers(search)]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Customers & Users</h1>

        <form action="/customers" className="w-full sm:w-80">
          <Input name="search" placeholder="Search by name or email" defaultValue={search ?? ""} />
        </form>
      </div>

      {(role === "admin" || role === "dispatcher") && (
        <CreateUserForm currentRole={role} />
      )}

      {customersResult.error ? (
        <p className="text-sm text-red-600">{customersResult.error}</p>
      ) : (
        <>
          <h2 className="text-lg font-semibold text-gray-900">Customer Accounts</h2>
          <CustomerTable customers={customersResult.data ?? []} />
        </>
      )}

      {usersResult.error ? (
        <p className="text-sm text-red-600">{usersResult.error}</p>
      ) : (
        <>
          <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
          <UserTable users={usersResult.data ?? []} currentRole={role} />
        </>
      )}
    </div>
  );
}
