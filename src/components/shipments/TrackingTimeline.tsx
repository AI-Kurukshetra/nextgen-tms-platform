"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Clock, MapPin, NotebookText } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils";
import type { Database } from "@/types/database";

type TrackingEvent = Database["public"]["Tables"]["tracking_events"]["Row"];

type TrackingTimelineProps = {
  shipmentId: string;
  initialEvents: TrackingEvent[];
};

function eventIcon(eventType: TrackingEvent["event_type"]) {
  switch (eventType) {
    case "status_change":
      return Clock;
    case "location_update":
      return MapPin;
    case "delay_reported":
      return AlertCircle;
    default:
      return NotebookText;
  }
}

export function TrackingTimeline({ shipmentId, initialEvents }: TrackingTimelineProps) {
  const [events, setEvents] = useState<TrackingEvent[]>(initialEvents);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`tracking-events-${shipmentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tracking_events",
          filter: `shipment_id=eq.${shipmentId}`,
        },
        async () => {
          const { data } = await supabase
            .from("tracking_events")
            .select("*")
            .eq("shipment_id", shipmentId)
            .order("created_at", { ascending: false });

          if (data) {
            setEvents(data);
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [shipmentId]);

  if (events.length === 0) {
    return <p className="text-sm text-gray-500">No tracking events yet.</p>;
  }

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const Icon = eventIcon(event.event_type);

        return (
          <div key={event.id} className="flex gap-3 rounded-md border border-gray-200 p-3">
            <Icon className="mt-0.5 h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-800">{event.description}</p>
              <p className="text-xs text-gray-500">{formatDateTime(event.created_at)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
