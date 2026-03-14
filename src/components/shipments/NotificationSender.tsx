"use client";

import { useState, useTransition } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";

type NotificationSenderProps = {
  shipmentId: string;
  canManage: boolean;
  initialHistory: { id: string; channel: "email" | "sms"; recipient: string; message: string; created_at: string }[];
};

export function NotificationSender({ shipmentId, canManage, initialHistory }: NotificationSenderProps) {
  const [channel, setChannel] = useState<"email" | "sms">("email");
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<
    { id: string; channel: "email" | "sms"; recipient: string; message: string; created_at: string }[]
  >(initialHistory);
  const [isPending, startTransition] = useTransition();

  const loadHistory = async () => {
    const res = await fetch(`/api/notifications/send?shipment_id=${shipmentId}`);
    const json = (await res.json()) as {
      data?: { id: string; channel: "email" | "sms"; recipient: string; message: string; created_at: string }[];
    };

    if (res.ok) {
      setHistory(json.data ?? []);
    }
  };

  if (!canManage) {
    return <p className="text-sm text-gray-500">Only dispatcher/admin can send notifications.</p>;
  }

  const sendNotification = () => {
    if (!recipient.trim() || !message.trim()) {
      toast.error("Recipient and message are required");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipment_id: shipmentId,
          channel,
          recipient,
          message,
        }),
      });

      const json = (await res.json()) as { error?: string };
      if (!res.ok || json.error) {
        toast.error(json.error ?? "Unable to send notification");
        return;
      }

      toast.success("Notification sent");
      setMessage("");
      await loadHistory();
    });
  };

  return (
    <div className="space-y-2">
      <div className="grid gap-2 md:grid-cols-[120px_1fr]">
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value as "email" | "sms")}
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
        >
          <option value="email">Email</option>
          <option value="sms">SMS</option>
        </select>
        <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Recipient" />
      </div>
      <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Notification message" />
      <Button type="button" variant="outline" onClick={sendNotification} disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        <span className="ml-2">Send</span>
      </Button>
      {history.length > 0 && (
        <div className="space-y-1 rounded-md border border-gray-200 bg-gray-50 p-2 text-xs">
          <p className="font-semibold text-gray-700">Recent Notifications</p>
          {history.map((entry) => (
            <p key={entry.id} className="text-gray-600">
              {formatDateTime(entry.created_at)} · {entry.channel.toUpperCase()} · {entry.recipient} · {entry.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
