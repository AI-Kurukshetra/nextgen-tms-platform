"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type TrackingEvent = Database["public"]["Tables"]["tracking_events"]["Row"];

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

export type DocumentRecord = {
  id: string;
  name: string;
  url: string;
  file_type: string;
  created_at: string;
};

export type DocumentTypeRecord = Database["public"]["Tables"]["document_types"]["Row"];

const DOC_PREFIX = "DOC|";
const NOTIF_PREFIX = "NOTIF|";

function parseJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

async function getSessionRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, role: null as string | null };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return { supabase, user, role: profile?.role ?? null };
}

export async function getTrackingEvents(shipmentId: string): Promise<ActionResult<TrackingEvent[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tracking_events")
    .select("*")
    .eq("shipment_id", shipmentId)
    .order("created_at", { ascending: false });

  return { data: data ?? [], error: error?.message ?? null };
}

export async function getDocumentTypes(): Promise<ActionResult<DocumentTypeRecord[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("document_types").select("*").order("name");

  return { data: data ?? [], error: error?.message ?? null };
}

export async function getShipmentDocuments(shipmentId: string): Promise<ActionResult<DocumentRecord[]>> {
  const supabase = await createClient();

  const { data: documentRows, error } = await supabase
    .from("shipment_documents")
    .select(
      `
      id,
      created_at,
      documents (
        id,
        file_name,
        file_url,
        file_type,
        created_at
      )
    `,
    )
    .eq("shipment_id", shipmentId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  const fromDocumentTables: DocumentRecord[] = (documentRows ?? [])
    .map((row) => {
      const document = Array.isArray(row.documents) ? row.documents[0] : row.documents;
      if (!document) return null;

      return {
        id: document.id,
        name: document.file_name,
        url: document.file_url,
        file_type: document.file_type,
        created_at: document.created_at ?? row.created_at,
      };
    })
    .filter((item): item is DocumentRecord => Boolean(item));

  if (fromDocumentTables.length > 0) {
    return { data: fromDocumentTables, error: null };
  }

  const { data: events, error: eventError } = await getTrackingEvents(shipmentId);
  if (eventError || !events) {
    return { data: fromDocumentTables, error: null };
  }

  const legacyDocs = events
    .filter((event) => event.event_type === "note_added" && event.description.startsWith(DOC_PREFIX))
    .map((event) => {
      const parsed = parseJson<{ name: string; url: string; file_type: string }>(event.description.slice(DOC_PREFIX.length));
      if (!parsed) return null;
      return {
        id: `legacy-${event.id}`,
        ...parsed,
        created_at: event.created_at,
      };
    })
    .filter((item): item is DocumentRecord => Boolean(item));

  return { data: legacyDocs, error: null };
}

export async function addShipmentDocument(
  shipmentId: string,
  name: string,
  url: string,
  fileType: string,
): Promise<ActionResult<{ id: string }>> {
  const { supabase, user, role } = await getSessionRole();

  if (!user) return { data: null, error: "Unauthorized" };
  if (role !== "admin" && role !== "dispatcher") {
    return { data: null, error: "Forbidden" };
  }

  const { data: typeRow } = await supabase.from("document_types").select("id").eq("code", fileType).maybeSingle();

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .insert({
      file_name: name,
      file_url: url,
      file_type: fileType,
      uploaded_by: user.id,
    })
    .select("id")
    .single();

  if (documentError || !document) {
    return { data: null, error: documentError?.message ?? "Unable to add document" };
  }

  const { error: linkError } = await supabase.from("shipment_documents").insert({
    shipment_id: shipmentId,
    document_id: document.id,
    document_type_id: typeRow?.id ?? null,
  });

  if (linkError) {
    return { data: null, error: linkError.message };
  }

  await supabase.from("tracking_events").insert({
    shipment_id: shipmentId,
    event_type: "note_added",
    description: `${DOC_PREFIX}${JSON.stringify({ name, url, file_type: fileType })}`,
    created_by: user.id,
  });

  revalidatePath(`/shipments/${shipmentId}`);
  return { data: { id: document.id }, error: null };
}

export async function removeShipmentDocument(shipmentId: string, documentId: string): Promise<ActionResult<null>> {
  const { supabase, user, role } = await getSessionRole();

  if (!user) return { data: null, error: "Unauthorized" };
  if (role !== "admin" && role !== "dispatcher") {
    return { data: null, error: "Forbidden" };
  }

  const { error: linkError } = await supabase
    .from("shipment_documents")
    .delete()
    .eq("shipment_id", shipmentId)
    .eq("document_id", documentId);

  if (linkError) {
    return { data: null, error: linkError.message };
  }

  await supabase.from("documents").delete().eq("id", documentId);

  await supabase.from("tracking_events").insert({
    shipment_id: shipmentId,
    event_type: "note_added",
    description: `Document removed: ${documentId}`,
    created_by: user.id,
  });

  revalidatePath(`/shipments/${shipmentId}`);
  return { data: null, error: null };
}

export async function sendShipmentNotification(
  shipmentId: string,
  channel: "email" | "sms",
  recipient: string,
  message: string,
): Promise<ActionResult<null>> {
  const { supabase, user, role } = await getSessionRole();

  if (!user) return { data: null, error: "Unauthorized" };
  if (role !== "admin" && role !== "dispatcher") {
    return { data: null, error: "Forbidden" };
  }

  const description = `${NOTIF_PREFIX}${JSON.stringify({ channel, recipient, message })}`;

  const { error } = await supabase.from("tracking_events").insert({
    shipment_id: shipmentId,
    event_type: "note_added",
    description,
    created_by: user.id,
  });

  if (error) return { data: null, error: error.message };

  revalidatePath(`/shipments/${shipmentId}`);
  return { data: null, error: null };
}
