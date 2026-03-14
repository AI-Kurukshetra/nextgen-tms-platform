"use client";

import { useCallback, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";

type WmsLog = {
  id: string;
  shipment_id: string;
  created_at: string;
  payload: {
    warehouse_code: string;
    movement: "inbound_received" | "outbound_dispatched";
    note: string | null;
    status_before: string;
    status_after: string;
    recorded_at: string;
  };
};

type PendingShipment = {
  shipment_id: string;
  shipment_number: string;
  status: string;
  origin_city: string;
  destination_city: string;
};

export function WmsSyncPanel() {
  const [warehouseCode, setWarehouseCode] = useState("");
  const [shipmentId, setShipmentId] = useState("");
  const [movement, setMovement] = useState<"inbound_received" | "outbound_dispatched">("outbound_dispatched");
  const [note, setNote] = useState("");
  const [logs, setLogs] = useState<WmsLog[]>([]);
  const [manifest, setManifest] = useState<PendingShipment[]>([]);
  const [isPending, startTransition] = useTransition();

  const loadWarehouseData = useCallback(async (code: string) => {
    const normalized = code.trim();
    if (!normalized) {
      setLogs([]);
      setManifest([]);
      return;
    }

    const res = await fetch(`/api/integrations/wms?warehouse_code=${encodeURIComponent(normalized)}`);
    const json = (await res.json()) as {
      data?: { logs?: WmsLog[]; pending_manifest?: PendingShipment[] };
      error?: string;
    };

    if (!res.ok || json.error) {
      toast.error(json.error ?? "Unable to load WMS data");
      return;
    }

    setLogs(json.data?.logs ?? []);
    setManifest(json.data?.pending_manifest ?? []);
  }, []);

  const syncMovement = () => {
    if (!shipmentId.trim() || !warehouseCode.trim()) {
      toast.error("Shipment ID and warehouse code are required");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/integrations/wms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipment_id: shipmentId.trim(),
          warehouse_code: warehouseCode.trim(),
          movement,
          note: note.trim() || undefined,
        }),
      });

      const json = (await res.json()) as { error?: string };
      if (!res.ok || json.error) {
        toast.error(json.error ?? "Unable to sync WMS movement");
        return;
      }

      toast.success("WMS movement synced");
      setNote("");
      await loadWarehouseData(warehouseCode);
    });
  };

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">WMS Integration Bridge</h2>
        <p className="text-xs text-gray-600">Sync inbound/outbound warehouse movements into shipment status and tracking.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="warehouse_code">Warehouse Code</Label>
          <Input
            id="warehouse_code"
            value={warehouseCode}
            onChange={(event) => setWarehouseCode(event.target.value.toUpperCase())}
            placeholder="WH-AMD-01"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="shipment_id">Shipment ID</Label>
          <Input id="shipment_id" value={shipmentId} onChange={(event) => setShipmentId(event.target.value)} placeholder="UUID" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="movement">Movement</Label>
          <Select id="movement" value={movement} onValueChange={(value) => setMovement(value as typeof movement)}>
            <SelectItem value="outbound_dispatched">Outbound Dispatched</SelectItem>
            <SelectItem value="inbound_received">Inbound Received</SelectItem>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="note">Note</Label>
          <Textarea id="note" value={note} onChange={(event) => setNote(event.target.value)} className="min-h-10" />
        </div>
      </div>

      <Button type="button" variant="outline" disabled={isPending} onClick={syncMovement}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sync WMS Update"}
      </Button>
      <Button type="button" variant="outline" disabled={isPending} onClick={() => void loadWarehouseData(warehouseCode)}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load Warehouse Data"}
      </Button>

      {manifest.length > 0 && (
        <div className="space-y-1 rounded-md border border-gray-200 bg-gray-50 p-2 text-xs text-gray-700">
          <p className="font-semibold">Pending Manifest</p>
          {manifest.map((item) => (
            <p key={item.shipment_id}>
              {item.shipment_number} · {item.status} · {item.origin_city} to {item.destination_city}
            </p>
          ))}
        </div>
      )}

      {logs.length > 0 && (
        <div className="space-y-1 rounded-md border border-gray-200 bg-gray-50 p-2 text-xs text-gray-700">
          <p className="font-semibold">Recent WMS Sync Logs</p>
          {logs.map((log) => (
            <p key={log.id}>
              {formatDateTime(log.created_at)} · {log.payload.warehouse_code} · {log.payload.movement} ·{" "}
              {log.payload.status_before} to {log.payload.status_after}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
