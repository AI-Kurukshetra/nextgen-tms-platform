import Link from "next/link";

import { DriverTable } from "@/components/drivers/DriverTable";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import { getDrivers } from "@/lib/actions/drivers";
import { DRIVER_STATUSES } from "@/types";

type SearchParams = Promise<{
  status?: string;
}>;

export default async function DriversPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const status = params.status;

  const { data, error } = await getDrivers(status);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
        <Link href="/drivers/mobile">
          <Button variant="outline">Mobile Driver App</Button>
        </Link>
      </div>

      <form className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-[220px_auto]" method="GET">
        <Select name="status" defaultValue={status ?? "all"}>
          <SelectItem value="all">All Statuses</SelectItem>
          {DRIVER_STATUSES.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </Select>

        <Button type="submit" variant="outline" className="w-fit">
          Apply Filter
        </Button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : <DriverTable drivers={(data ?? []) as never[]} />}
    </div>
  );
}
