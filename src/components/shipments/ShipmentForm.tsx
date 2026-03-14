"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { createShipment } from "@/lib/actions/shipments";
import { createShipmentSchema, type CreateShipmentInput } from "@/lib/validations/shipment";
import { CARGO_TYPES } from "@/types";
import type { Database } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";

type Carrier = Database["public"]["Tables"]["carriers"]["Row"];
type Driver = Database["public"]["Tables"]["drivers"]["Row"];
type Route = Database["public"]["Tables"]["routes"]["Row"];
type Warehouse = Database["public"]["Tables"]["warehouses"]["Row"];
type Customer = Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "full_name" | "email">;

type ShipmentFormProps = {
  carriers: Carrier[];
  drivers: Driver[];
  routes: Route[];
  warehouses: Warehouse[];
  customers: Customer[];
};

type ShipmentFormValues = z.input<typeof createShipmentSchema>;

export function ShipmentForm({ carriers, drivers, routes, warehouses, customers }: ShipmentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isQuotePending, startQuoteTransition] = useTransition();
  const [quotePreview, setQuotePreview] = useState<{ estimated_cost: number; confidence: number; factors: string[] } | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ShipmentFormValues>({
    resolver: zodResolver(createShipmentSchema),
    defaultValues: {
      origin_city: "",
      origin_state: "",
      destination_city: "",
      destination_state: "",
      cargo_type: "general",
      weight_kg: 0,
      volume_cbm: undefined,
      carrier_id: "",
      driver_id: "",
      route_id: "",
      customer_id: "",
      origin_warehouse_id: "",
      destination_warehouse_id: "",
      scheduled_pickup: "",
      scheduled_delivery: "",
      freight_cost: undefined,
      notes: "",
    },
  });

  const selectedCarrier = useWatch({ control, name: "carrier_id" });
  const selectedRoute = useWatch({ control, name: "route_id" });
  const selectedCargoType = useWatch({ control, name: "cargo_type" });
  const selectedWeight = useWatch({ control, name: "weight_kg" });

  const filteredDrivers = useMemo(() => {
    if (!selectedCarrier) return drivers;
    return drivers.filter((driver) => driver.carrier_id === selectedCarrier);
  }, [drivers, selectedCarrier]);

  const estimateQuote = () => {
    const route = routes.find((item) => item.id === selectedRoute);
    const carrier = carriers.find((item) => item.id === selectedCarrier);

    if (!route) {
      toast.error("Select a route before generating a quote");
      return;
    }

    if (!selectedCargoType) {
      toast.error("Select cargo type before generating a quote");
      return;
    }

    if (!selectedWeight || Number(selectedWeight) <= 0) {
      toast.error("Enter a valid weight before generating a quote");
      return;
    }

    startQuoteTransition(async () => {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          distance_km: route.distance_km,
          weight_kg: Number(selectedWeight),
          cargo_type: selectedCargoType,
          transport_mode: route.transport_mode,
          carrier_rating: carrier?.rating ?? 3.8,
        }),
      });

      const result = (await response.json()) as
        | { estimated_cost: number; confidence: number; factors: string[] }
        | { error: string };

      if (!response.ok || "error" in result) {
        toast.error("Unable to estimate quote");
        return;
      }

      setValue("freight_cost", result.estimated_cost, {
        shouldValidate: true,
        shouldDirty: true,
      });

      setQuotePreview(result);
      toast.success("Freight quote estimated and applied");
    });
  };

  const onSubmit = (values: ShipmentFormValues) => {
    startTransition(async () => {
      const result = await createShipment(values as CreateShipmentInput);

      if (result.error || !result.data) {
        toast.error(result.error ?? "Unable to create shipment");
        return;
      }

      toast.success("Shipment created");
      router.push(`/shipments/${result.data.id}`);
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="origin_city">Origin City</Label>
          <Input id="origin_city" {...register("origin_city")} />
          {errors.origin_city && <p className="text-sm text-red-600">{errors.origin_city.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="origin_state">Origin State</Label>
          <Input id="origin_state" {...register("origin_state")} />
          {errors.origin_state && <p className="text-sm text-red-600">{errors.origin_state.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="destination_city">Destination City</Label>
          <Input id="destination_city" {...register("destination_city")} />
          {errors.destination_city && <p className="text-sm text-red-600">{errors.destination_city.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="destination_state">Destination State</Label>
          <Input id="destination_state" {...register("destination_state")} />
          {errors.destination_state && <p className="text-sm text-red-600">{errors.destination_state.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="cargo_type">Cargo Type</Label>
          <Select id="cargo_type" {...register("cargo_type")}>
            {CARGO_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type.replace("_", " ")}
              </SelectItem>
            ))}
          </Select>
          {errors.cargo_type && <p className="text-sm text-red-600">{errors.cargo_type.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight_kg">Weight (kg)</Label>
          <Input id="weight_kg" type="number" step="0.01" {...register("weight_kg", { valueAsNumber: true })} />
          {errors.weight_kg && <p className="text-sm text-red-600">{errors.weight_kg.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="volume_cbm">Volume (cbm)</Label>
          <Input
            id="volume_cbm"
            type="number"
            step="0.01"
            {...register("volume_cbm", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
          />
          {errors.volume_cbm && <p className="text-sm text-red-600">{errors.volume_cbm.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="carrier_id">Carrier</Label>
        <Select id="carrier_id" {...register("carrier_id")}>
          <SelectItem value="">Select carrier</SelectItem>
          {carriers.map((carrier) => (
            <SelectItem key={carrier.id} value={carrier.id}>
              {carrier.name}
            </SelectItem>
          ))}
        </Select>
        {errors.carrier_id && <p className="text-sm text-red-600">{errors.carrier_id.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="driver_id">Driver</Label>
        <Select id="driver_id" {...register("driver_id")}>
          <SelectItem value="">Select driver</SelectItem>
          {filteredDrivers.map((driver) => (
            <SelectItem key={driver.id} value={driver.id}>
              {driver.full_name}
            </SelectItem>
          ))}
        </Select>
        {errors.driver_id && <p className="text-sm text-red-600">{errors.driver_id.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="route_id">Route</Label>
        <Select id="route_id" {...register("route_id")}>
          <SelectItem value="">Select route</SelectItem>
          {routes.map((route) => (
            <SelectItem key={route.id} value={route.id}>
              {route.name}
            </SelectItem>
          ))}
        </Select>
        {errors.route_id && <p className="text-sm text-red-600">{errors.route_id.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer_id">Customer</Label>
        <Select id="customer_id" {...register("customer_id")}>
          <SelectItem value="">Select customer</SelectItem>
          {customers.map((customer) => (
            <SelectItem key={customer.id} value={customer.id}>
              {customer.full_name} ({customer.email})
            </SelectItem>
          ))}
        </Select>
        {errors.customer_id && <p className="text-sm text-red-600">{errors.customer_id.message}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="origin_warehouse_id">Origin Warehouse</Label>
          <Select id="origin_warehouse_id" {...register("origin_warehouse_id")}>
            <SelectItem value="">Select warehouse</SelectItem>
            {warehouses.map((warehouse) => (
              <SelectItem key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </SelectItem>
            ))}
          </Select>
          {errors.origin_warehouse_id && <p className="text-sm text-red-600">{errors.origin_warehouse_id.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="destination_warehouse_id">Destination Warehouse</Label>
          <Select id="destination_warehouse_id" {...register("destination_warehouse_id")}>
            <SelectItem value="">Select warehouse</SelectItem>
            {warehouses.map((warehouse) => (
              <SelectItem key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </SelectItem>
            ))}
          </Select>
          {errors.destination_warehouse_id && (
            <p className="text-sm text-red-600">{errors.destination_warehouse_id.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="scheduled_pickup">Scheduled Pickup</Label>
          <Input id="scheduled_pickup" type="datetime-local" {...register("scheduled_pickup")} />
          {errors.scheduled_pickup && <p className="text-sm text-red-600">{errors.scheduled_pickup.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="scheduled_delivery">Scheduled Delivery</Label>
          <Input id="scheduled_delivery" type="datetime-local" {...register("scheduled_delivery")} />
          {errors.scheduled_delivery && <p className="text-sm text-red-600">{errors.scheduled_delivery.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="freight_cost">Freight Cost</Label>
          <div className="flex gap-2">
            <Input
              id="freight_cost"
              type="number"
              step="0.01"
              {...register("freight_cost", {
                setValueAs: (value) => (value === "" ? undefined : Number(value)),
              })}
            />
            <Button type="button" variant="outline" disabled={isQuotePending} onClick={estimateQuote}>
              {isQuotePending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Estimate"}
            </Button>
          </div>
          {errors.freight_cost && <p className="text-sm text-red-600">{errors.freight_cost.message}</p>}
          {quotePreview && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-2 text-xs text-blue-800">
              <p className="font-medium">Quote: {formatCurrency(quotePreview.estimated_cost)}</p>
              <p>Confidence: {quotePreview.confidence}%</p>
              <p className="mt-1">{quotePreview.factors.join(" · ")}</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" {...register("notes")} />
          {errors.notes && <p className="text-sm text-red-600">{errors.notes.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Shipment"}
        </Button>
      </div>
    </form>
  );
}
