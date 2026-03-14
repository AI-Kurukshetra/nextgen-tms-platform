import { z } from "zod";

import { requireApiAuth } from "@/lib/api-auth";
import {
  addShipmentDocument,
  getDocumentTypes,
  getShipmentDocuments,
  removeShipmentDocument,
} from "@/lib/actions/tracking";

const createSchema = z.object({
  shipment_id: z.string().uuid(),
  name: z.string().min(1),
  url: z.url(),
  file_type: z.string().min(1),
});

const deleteSchema = z.object({
  shipment_id: z.string().uuid(),
  document_id: z.string().uuid(),
});

export async function GET(request: Request) {
  const auth = await requireApiAuth();
  if (auth.response) return auth.response;
  if (!auth.context) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const shipmentId = searchParams.get("shipment_id");
  const includeTypes = searchParams.get("types") === "true";

  if (includeTypes) {
    const types = await getDocumentTypes();
    if (types.error) {
      return Response.json({ error: types.error }, { status: 500 });
    }
    return Response.json({ data: types.data ?? [] });
  }

  if (!shipmentId) {
    return Response.json({ error: "shipment_id is required" }, { status: 400 });
  }

  const result = await getShipmentDocuments(shipmentId);

  if (result.error) {
    return Response.json({ error: result.error }, { status: 500 });
  }

  return Response.json({ data: result.data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireApiAuth();
  if (auth.response) return auth.response;
  if (!auth.context) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }

  const result = await addShipmentDocument(
    parsed.data.shipment_id,
    parsed.data.name,
    parsed.data.url,
    parsed.data.file_type,
  );

  if (result.error) {
    return Response.json({ error: result.error }, { status: 403 });
  }

  return Response.json({ success: true, data: result.data });
}

export async function DELETE(request: Request) {
  const auth = await requireApiAuth();
  if (auth.response) return auth.response;
  if (!auth.context) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = deleteSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }

  const result = await removeShipmentDocument(parsed.data.shipment_id, parsed.data.document_id);
  if (result.error) {
    return Response.json({ error: result.error }, { status: 403 });
  }

  return Response.json({ success: true });
}
