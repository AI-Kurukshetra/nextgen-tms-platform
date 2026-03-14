import { redirect } from "next/navigation";

import { CustomerTable } from "@/components/customers/CustomerTable";
import { getCustomers } from "@/lib/actions/customers";
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

  const { data, error } = await getCustomers(search);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>

        <form action="/customers" className="w-full sm:w-80">
          <Input name="search" placeholder="Search by name or email" defaultValue={search ?? ""} />
        </form>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : <CustomerTable customers={data ?? []} />}
    </div>
  );
}
