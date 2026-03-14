import type { Database } from "@/types/database";

type RouteRow = Database["public"]["Tables"]["routes"]["Row"];

type OptimizePreference = "fastest" | "cheapest" | "balanced";

export interface OptimizeInput {
  origin_city: string;
  destination_city: string;
  mode?: RouteRow["transport_mode"] | "any";
  preference: OptimizePreference;
}

export interface RouteOption {
  route: RouteRow;
  score: number;
  reason: string;
}

export interface OptimizeResult {
  best: RouteOption | null;
  alternatives: RouteOption[];
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function weightedScore(route: RouteRow, preference: OptimizePreference) {
  const distance = Number(route.distance_km || 0);
  const hours = Number(route.estimated_hours || 0);
  const toll = Number(route.toll_charges || 0);

  if (preference === "fastest") {
    return hours * 1.6 + distance * 0.2 + toll * 0.001;
  }

  if (preference === "cheapest") {
    return toll * 0.02 + distance * 0.3 + hours * 0.5;
  }

  return hours * 1 + distance * 0.25 + toll * 0.01;
}

function buildReason(route: RouteRow, preference: OptimizePreference) {
  if (preference === "fastest") {
    return `Lowest estimated transit time at ${route.estimated_hours} hrs`;
  }

  if (preference === "cheapest") {
    return `Lower cost profile with toll ${route.toll_charges ?? 0}`;
  }

  return `Balanced route with ${route.distance_km} km and ${route.estimated_hours} hrs`;
}

export function optimizeRoutes(input: OptimizeInput, routes: RouteRow[]): OptimizeResult {
  const origin = normalize(input.origin_city);
  const destination = normalize(input.destination_city);

  const candidates = routes.filter((route) => {
    if (!route.is_active) return false;
    if (input.mode && input.mode !== "any" && route.transport_mode !== input.mode) return false;

    const directMatch =
      normalize(route.origin_city) === origin && normalize(route.destination_city) === destination;

    const corridorMatch =
      normalize(route.origin_state) === origin ||
      normalize(route.destination_state) === destination ||
      normalize(route.name).includes(origin) ||
      normalize(route.name).includes(destination);

    return directMatch || corridorMatch;
  });

  const ranked = candidates
    .map((route) => ({
      route,
      score: Number(weightedScore(route, input.preference).toFixed(2)),
      reason: buildReason(route, input.preference),
    }))
    .sort((a, b) => a.score - b.score);

  return {
    best: ranked[0] ?? null,
    alternatives: ranked.slice(1, 4),
  };
}
