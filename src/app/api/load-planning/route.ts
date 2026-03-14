import { z } from "zod";

import { requireApiRole } from "@/lib/api-auth";
import { calculateLoadPlan } from "@/lib/load-planner";

const schema = z.object({
  vehicle_type: z.enum(["truck", "mini_truck", "trailer", "container"]),
  weight_kg: z.number().positive(),
  volume_cbm: z.number().positive().nullable(),
});

export async function POST(request: Request) {
  const auth = await requireApiRole(["admin", "dispatcher"]);
  if (auth.response) return auth.response;
  if (!auth.context) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }

  return Response.json(calculateLoadPlan(parsed.data));
}
