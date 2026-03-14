"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { SHIPMENT_STATUSES } from "@/types";

type ShipmentFiltersProps = {
  initialSearch: string;
  initialStatus: string;
};

export function ShipmentFilters({ initialSearch, initialStatus }: ShipmentFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);

  const currentSearch = searchParams.get("search") ?? "";
  const currentStatus = searchParams.get("status") ?? "all";

  const baseParams = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams]);

  const pushParams = useCallback((nextSearch: string, nextStatus: string) => {
    const params = new URLSearchParams(baseParams.toString());

    if (nextSearch.trim()) {
      params.set("search", nextSearch.trim());
    } else {
      params.delete("search");
    }

    if (nextStatus && nextStatus !== "all") {
      params.set("status", nextStatus);
    } else {
      params.delete("status");
    }

    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  }, [baseParams, pathname, router, startTransition]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search === currentSearch) return;
      pushParams(search, status);
    }, 350);

    return () => clearTimeout(timer);
  }, [search, status, currentSearch, pushParams]);

  return (
    <div className="grid gap-3 rounded-xl border border-cyan-100 bg-gradient-to-r from-white via-cyan-50/50 to-white p-4 shadow-sm md:grid-cols-[1fr_220px_auto]">
      <div className="relative">
        <Input
          value={search}
          placeholder="Search by shipment #, origin, destination"
          onChange={(event) => setSearch(event.target.value)}
          className="pr-9"
        />
        {isPending && <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-cyan-600" />}
      </div>

      <Select
        value={status}
        onValueChange={(value) => {
          setStatus(value);
          if (value === currentStatus) return;
          pushParams(search, value);
        }}
      >
        <SelectItem value="all">All Statuses</SelectItem>
        {SHIPMENT_STATUSES.map((item) => (
          <SelectItem key={item} value={item}>
            {item.replace("_", " ")}
          </SelectItem>
        ))}
      </Select>

      <div className="hidden items-center justify-end text-xs text-slate-500 md:flex">
        {isPending ? (
          <span className="inline-flex items-center gap-1.5 text-cyan-700">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Updating
          </span>
        ) : (
          <span>Live filters enabled</span>
        )}
      </div>
    </div>
  );
}
