import { CarrierTable } from "@/components/carriers/CarrierTable";
import { Select, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getCarriers } from "@/lib/actions/carriers";
import { TRANSPORT_MODES } from "@/types";

type SearchParams = Promise<{
  status?: string;
  mode?: string;
}>;

export default async function CarriersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const status = params.status;
  const mode = params.mode;

  const { data, error } = await getCarriers(status, mode);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Carriers</h1>

      <form className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-2" method="GET">
        <Select name="status" defaultValue={status ?? "all"}>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="active">active</SelectItem>
          <SelectItem value="inactive">inactive</SelectItem>
          <SelectItem value="suspended">suspended</SelectItem>
        </Select>

        <Select name="mode" defaultValue={mode ?? "all"}>
          <SelectItem value="all">All Modes</SelectItem>
          {TRANSPORT_MODES.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </Select>

        <div className="md:col-span-2">
          <Button type="submit" variant="outline">
            Apply Filters
          </Button>
        </div>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : <CarrierTable carriers={data ?? []} />}
    </div>
  );
}
