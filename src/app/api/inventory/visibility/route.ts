import { getInventoryVisibility } from "@/lib/actions/inventory";
import { requireApiRole } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireApiRole(["admin", "dispatcher"]);
  if (auth.response) return auth.response;
  if (!auth.context) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const result = await getInventoryVisibility();

  if (result.error) {
    return Response.json({ error: result.error }, { status: 500 });
  }

  return Response.json({ data: result.data });
}
