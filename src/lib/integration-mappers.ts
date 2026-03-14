import type { Database } from "@/types/database";

type Shipment = Database["public"]["Tables"]["shipments"]["Row"];
export type LoadBoardProvider = "nextgen_exchange" | "freight_tiger" | "trucksuvidha";

export function buildEdi214(shipment: Shipment) {
  const pickupDate = shipment.scheduled_pickup ?? shipment.created_at;
  const deliveryDate = shipment.scheduled_delivery ?? shipment.created_at;

  return [
    "ISA*00*          *00*          *ZZ*NEXTGENTMS      *ZZ*PARTNER         *260314*1200*U*00401*000000001*0*P*>~",
    "GS*QM*NEXTGENTMS*PARTNER*20260314*1200*1*X*004010~",
    `ST*214*${shipment.shipment_number}~`,
    `B10*${shipment.shipment_number}*${shipment.id}*NGTMS~`,
    `L11*${shipment.origin_city}-${shipment.destination_city}*SI~`,
    `AT7*${shipment.status.toUpperCase()}***${pickupDate}*${deliveryDate}~`,
    "SE*6*0001~",
    "GE*1*1~",
    "IEA*1*000000001~",
  ].join("\n");
}

export function buildLoadBoardPost(shipment: Shipment, provider: LoadBoardProvider = "nextgen_exchange") {
  const basePayload = {
    shipment_number: shipment.shipment_number,
    origin: `${shipment.origin_city}, ${shipment.origin_state}`,
    destination: `${shipment.destination_city}, ${shipment.destination_state}`,
    cargo_type: shipment.cargo_type,
    weight_kg: shipment.weight_kg,
    posted_rate_inr: shipment.freight_cost ?? null,
    posted_at: new Date().toISOString(),
  };

  if (provider === "freight_tiger") {
    return {
      provider,
      lane: `${shipment.origin_city}-${shipment.destination_city}`,
      commodity: shipment.cargo_type,
      weight_tons: Number(shipment.weight_kg) / 1000,
      expected_rate_inr: shipment.freight_cost ?? null,
      ...basePayload,
    };
  }

  if (provider === "trucksuvidha") {
    return {
      provider,
      source_city: shipment.origin_city,
      source_state: shipment.origin_state,
      destination_city: shipment.destination_city,
      destination_state: shipment.destination_state,
      load_type: shipment.cargo_type,
      freight_offer_inr: shipment.freight_cost ?? null,
      ...basePayload,
    };
  }

  return {
    provider,
    board: "NEXTGEN_LOAD_EXCHANGE",
    status: "posted",
    ...basePayload,
  };
}
