import { getDriverAssignments } from "@/lib/actions/drivers";
import { requireApiRole } from "@/lib/api-auth";

export async function GET(request: Request) {
  const auth = await requireApiRole(["admin", "dispatcher"]);
  if (auth.response) return auth.response;
  if (!auth.context) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const driverId = searchParams.get("driver_id") ?? undefined;

  const result = await getDriverAssignments(driverId);

  if (result.error) {
    return Response.json({ error: result.error }, { status: 500 });
  }

  return Response.json({ data: result.data ?? [] });
}
