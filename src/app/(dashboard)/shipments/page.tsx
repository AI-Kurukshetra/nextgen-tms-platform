import Link from "next/link";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import { ShipmentFilters } from "@/components/shipments/ShipmentFilters";
import { ShipmentTable } from "@/components/shipments/ShipmentTable";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getShipments } from "@/lib/actions/shipments";

type SearchParams = Promise<{
  status?: string;
  search?: string;
}>;

async function ShipmentsContent({
  status,
  search,
  canDelete,
}: {
  status?: string;
  search?: string;
  canDelete: boolean;
}) {
  const { data, error } = await getShipments(status, search);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return <ShipmentTable shipments={(data ?? []) as never[]} canDelete={canDelete} />;
}

export default async function ShipmentsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const status = params.status;
  const search = params.search;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    role = profile?.role ?? null;
  }

  const canManageShipments = role === "admin" || role === "dispatcher";
  const canDelete = role === "admin";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Shipments</h1>
        {canManageShipments && (
          <Link href="/shipments/new" className={buttonVariants()}>
            New Shipment
          </Link>
        )}
      </div>

      <ShipmentFilters initialSearch={search ?? ""} initialStatus={status ?? "all"} />

      <Suspense
        fallback={
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        }
      >
        <ShipmentsContent status={status} search={search} canDelete={canDelete} />
      </Suspense>
    </div>
  );
}
