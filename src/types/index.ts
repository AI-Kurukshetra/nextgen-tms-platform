export const SHIPMENT_STATUSES = [
  "draft",
  "confirmed",
  "assigned",
  "in_transit",
  "delivered",
  "delayed",
  "cancelled",
] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export const STATUS_COLORS: Record<ShipmentStatus, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  assigned: "bg-purple-100 text-purple-700 border-purple-200",
  in_transit: "bg-amber-100 text-amber-700 border-amber-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  delayed: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200 line-through",
};

export const CARGO_TYPES = [
  "general",
  "perishable",
  "hazardous",
  "fragile",
  "oversized",
  "electronics",
] as const;

export const TRANSPORT_MODES = ["truck", "rail", "air", "ocean", "intermodal"] as const;

export const DRIVER_STATUSES = ["available", "on_trip", "off_duty", "suspended"] as const;

export const WAREHOUSE_STATUSES = ["active", "inactive", "maintenance"] as const;

export const USER_ROLES = ["admin", "dispatcher", "customer"] as const;
export const PUBLIC_REGISTER_ROLES = ["customer", "dispatcher"] as const;
