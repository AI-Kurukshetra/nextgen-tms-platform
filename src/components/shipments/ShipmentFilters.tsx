"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [baseParams, pathname, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search === currentSearch) return;
      pushParams(search, status);
    }, 350);

    return () => clearTimeout(timer);
  }, [search, status, currentSearch, pushParams]);

  return (
    <div className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-[1fr_220px]">
      <Input
        value={search}
        placeholder="Search by shipment #, origin, destination"
        onChange={(event) => setSearch(event.target.value)}
      />

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
    </div>
  );
}
