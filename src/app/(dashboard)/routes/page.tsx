import { RouteTable } from "@/components/routes/RouteTable";
import { RouteOptimizerCard } from "@/components/routes/RouteOptimizerCard";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import { getRoutes } from "@/lib/actions/routes";
import { TRANSPORT_MODES } from "@/types";

type SearchParams = Promise<{
  mode?: string;
  active?: string;
}>;

export default async function RoutesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const mode = params.mode;
  const active = params.active;

  const { data, error } = await getRoutes(mode, active);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Routes</h1>

      <form className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-3" method="GET">
        <Select name="mode" defaultValue={mode ?? "all"}>
          <SelectItem value="all">All Modes</SelectItem>
          {TRANSPORT_MODES.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </Select>

        <Select name="active" defaultValue={active ?? "all"}>
          <SelectItem value="all">All Activity</SelectItem>
          <SelectItem value="true">Active</SelectItem>
          <SelectItem value="false">Inactive</SelectItem>
        </Select>

        <Button type="submit" variant="outline" className="w-fit">
          Apply Filters
        </Button>
      </form>

      <RouteOptimizerCard routes={data ?? []} />

      {error ? <p className="text-sm text-red-600">{error}</p> : <RouteTable routes={data ?? []} />}
    </div>
  );
}
