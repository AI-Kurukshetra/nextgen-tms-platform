"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type IntegrationPanelProps = {
  shipmentId: string;
};

export function IntegrationPanel({ shipmentId }: IntegrationPanelProps) {
  const [ediPayload, setEdiPayload] = useState("");
  const [loadBoardPayload, setLoadBoardPayload] = useState("");
  const [provider, setProvider] = useState<"nextgen_exchange" | "freight_tiger" | "trucksuvidha">(
    "nextgen_exchange",
  );
  const [isPending, startTransition] = useTransition();

  const fetchEdi = () => {
    startTransition(async () => {
      const res = await fetch(`/api/integrations/edi?shipment_id=${shipmentId}`);
      const json = (await res.json()) as { payload?: string; error?: string };

      if (!res.ok || json.error) {
        toast.error(json.error ?? "Unable to generate EDI message");
        return;
      }

      setEdiPayload(json.payload ?? "");
    });
  };

  const postLoadBoard = () => {
    startTransition(async () => {
      const res = await fetch("/api/integrations/load-board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipment_id: shipmentId, provider }),
      });

      const json = (await res.json()) as { payload?: unknown; error?: string };

      if (!res.ok || json.error) {
        toast.error(json.error ?? "Unable to post to load board");
        return;
      }

      setLoadBoardPayload(JSON.stringify(json.payload, null, 2));
      toast.success("Posted to load board");
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <select
          className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-700"
          value={provider}
          onChange={(event) => setProvider(event.target.value as typeof provider)}
          disabled={isPending}
        >
          <option value="nextgen_exchange">NextGen Exchange</option>
          <option value="freight_tiger">Freight Tiger</option>
          <option value="trucksuvidha">TruckSuvidha</option>
        </select>
        <Button type="button" variant="outline" onClick={fetchEdi} disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate EDI 214"}
        </Button>
        <Button type="button" variant="outline" onClick={postLoadBoard} disabled={isPending}>
          Post Load Board
        </Button>
      </div>

      {ediPayload && <pre className="overflow-x-auto rounded-md border border-gray-200 bg-gray-50 p-2 text-xs">{ediPayload}</pre>}
      {loadBoardPayload && (
        <pre className="overflow-x-auto rounded-md border border-gray-200 bg-gray-50 p-2 text-xs">{loadBoardPayload}</pre>
      )}
    </div>
  );
}
