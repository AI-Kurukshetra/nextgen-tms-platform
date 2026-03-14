import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInventoryVisibility } from "@/lib/actions/inventory";

export default async function InventoryPage() {
  const { data } = await getInventoryVisibility();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Inventory Visibility</h1>
      <p className="text-sm text-gray-600">Warehouse-level movement visibility from active shipments.</p>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {(data ?? []).map((warehouse) => (
          <Card key={warehouse.warehouse_id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{warehouse.warehouse_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-gray-700">
              <p>{warehouse.city}, {warehouse.state}</p>
              <p>Inbound: {warehouse.inbound_shipments}</p>
              <p>Outbound: {warehouse.outbound_shipments}</p>
              <p>In Transit: {warehouse.in_transit_related}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
