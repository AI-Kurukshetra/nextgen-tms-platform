import { WarehouseTable } from "@/components/warehouses/WarehouseTable";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import { getWarehouses } from "@/lib/actions/warehouses";
import { WAREHOUSE_STATUSES } from "@/types";

type SearchParams = Promise<{
  status?: string;
}>;

export default async function WarehousesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const status = params.status;
  const { data, error } = await getWarehouses(status);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Warehouses</h1>

      <form className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-[220px_auto]" method="GET">
        <Select name="status" defaultValue={status ?? "all"}>
          <SelectItem value="all">All Statuses</SelectItem>
          {WAREHOUSE_STATUSES.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </Select>

        <Button type="submit" variant="outline" className="w-fit">
          Apply Filter
        </Button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : <WarehouseTable warehouses={data ?? []} />}
    </div>
  );
}
