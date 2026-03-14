"use client";

import { useState, useTransition } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { createUserAccount } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreateUserFormProps = {
  currentRole: "admin" | "dispatcher";
};

export function CreateUserForm({ currentRole }: CreateUserFormProps) {
  const [isPending, startTransition] = useTransition();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "dispatcher" | "admin">("customer");

  const canCreateAdminOrDispatcher = currentRole === "admin";

  const submit = () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast.error("Name, email and password are required");
      return;
    }

    startTransition(async () => {
      const result = await createUserAccount({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        role: canCreateAdminOrDispatcher ? role : "customer",
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setFullName("");
      setEmail("");
      setPassword("");
      setRole("customer");
      toast.success("User account created");
    });
  };

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <UserPlus className="h-4 w-4 text-gray-700" />
        <h2 className="text-sm font-semibold text-gray-900">Create User</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="space-y-1">
          <Label>Full Name</Label>
          <Input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Jane Doe" />
        </div>

        <div className="space-y-1">
          <Label>Email</Label>
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="user@example.com" />
        </div>

        <div className="space-y-1">
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 8 characters"
          />
        </div>

        <div className="space-y-1">
          <Label>Role</Label>
          <select
            value={canCreateAdminOrDispatcher ? role : "customer"}
            onChange={(event) => setRole(event.target.value as "customer" | "dispatcher" | "admin")}
            disabled={!canCreateAdminOrDispatcher}
            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
          >
            <option value="customer">Customer</option>
            {canCreateAdminOrDispatcher && <option value="dispatcher">Dispatcher</option>}
            {canCreateAdminOrDispatcher && <option value="admin">Admin</option>}
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={submit} disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
        </Button>
      </div>
    </div>
  );
}
