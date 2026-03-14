"use client";

import { useEffect, useState, useTransition } from "react";
import { FileText, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DocumentItem = {
  id: string;
  name: string;
  url: string;
  file_type: string;
  created_at: string;
};

type DocumentType = {
  id: string;
  code: string;
  name: string;
};

type DocumentManagerProps = {
  shipmentId: string;
  canManage: boolean;
  initialDocuments: DocumentItem[];
};

export function DocumentManager({ shipmentId, canManage, initialDocuments }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [types, setTypes] = useState<DocumentType[]>([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [fileType, setFileType] = useState("POD");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;

    (async () => {
      const res = await fetch("/api/documents?types=true", { cache: "no-store" });
      const json = (await res.json()) as { data?: DocumentType[] };
      const typesData = json.data ?? [];
      if (!res.ok || !active) return;
      setTypes(typesData);
      if (typesData.length > 0) {
        setFileType((prev) => prev || typesData[0].code);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const addDocument = () => {
    if (!name.trim() || !url.trim()) {
      toast.error("Document name and URL are required");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipment_id: shipmentId,
          name: name.trim(),
          url: url.trim(),
          file_type: fileType,
        }),
      });

      const json = (await res.json()) as { error?: string; data?: { id: string } };
      const newDocId = json.data?.id;

      if (!res.ok || json.error || !newDocId) {
        toast.error(json.error ?? "Unable to add document");
        return;
      }

      setDocuments((prev) => [
        {
          id: newDocId,
          name: name.trim(),
          url: url.trim(),
          file_type: fileType,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setName("");
      setUrl("");
      toast.success("Document added");
    });
  };

  const removeDocument = (documentId: string) => {
    startTransition(async () => {
      const res = await fetch("/api/documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipment_id: shipmentId,
          document_id: documentId,
        }),
      });

      const json = (await res.json()) as { error?: string };

      if (!res.ok || json.error) {
        toast.error(json.error ?? "Unable to remove document");
        return;
      }

      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
      toast.success("Document removed");
    });
  };

  return (
    <div className="space-y-3">
      {documents.length === 0 ? (
        <p className="text-sm text-gray-500">No documents added yet.</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-md border border-gray-200 p-2 text-sm hover:bg-gray-50"
            >
              <a href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-800">
                <FileText className="h-4 w-4 text-gray-500" />
                {doc.name}
              </a>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{doc.file_type}</span>
                {canManage && !doc.id.startsWith("legacy-") && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDocument(doc.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {canManage && (
        <div className="grid gap-2 md:grid-cols-[1fr_1fr_180px_auto]">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Document name" />
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
          >
            {(types.length > 0
              ? types.map((type) => ({ code: type.code, label: type.name }))
              : [
                  { code: "POD", label: "Proof of Delivery" },
                  { code: "BOL", label: "Bill of Lading" },
                  { code: "INVOICE", label: "Invoice Document" },
                  { code: "CUSTOMS", label: "Customs" },
                ]
            ).map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
          <Button type="button" variant="outline" disabled={isPending} onClick={addDocument}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  );
}
