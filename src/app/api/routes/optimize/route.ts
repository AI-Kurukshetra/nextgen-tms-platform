import { z } from "zod";

import { requireApiAuth } from "@/lib/api-auth";
import { optimizeRoutes } from "@/lib/route-optimizer";
import { TRANSPORT_MODES } from "@/types";

const schema = z.object({
  origin_city: z.string().min(2),
  destination_city: z.string().min(2),
  mode: z.enum(["any", ...TRANSPORT_MODES]).default("any"),
  preference: z.enum(["fastest", "cheapest", "balanced"]).default("balanced"),
});

export async function POST(request: Request) {
  const auth = await requireApiAuth();
  if (auth.response) return auth.response;
  if (!auth.context) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }

  const { data: routes, error } = await auth.context.supabase.from("routes").select("*").eq("is_active", true);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const result = optimizeRoutes(parsed.data, routes ?? []);
  return Response.json(result);
}
