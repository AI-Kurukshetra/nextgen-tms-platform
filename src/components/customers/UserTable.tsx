"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateUserRole, type UserSummary } from "@/lib/actions/customers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

type UserTableProps = {
  users: UserSummary[];
  currentRole: string | null;
};

export function UserTable({ users, currentRole }: UserTableProps) {
  const [isPending, startTransition] = useTransition();
  const canChangeRole = currentRole === "admin";

  const onRoleChange = (userId: string, role: "admin" | "dispatcher" | "customer") => {
    if (!canChangeRole) return;

    startTransition(async () => {
      const result = await updateUserRole({ user_id: userId, role });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Role updated");
    });
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium text-gray-900">{user.full_name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <select
                  className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm"
                  value={user.role}
                  disabled={!canChangeRole || isPending}
                  onChange={(event) =>
                    onRoleChange(user.id, event.target.value as "admin" | "dispatcher" | "customer")
                  }
                >
                  <option value="admin">Admin</option>
                  <option value="dispatcher">Dispatcher</option>
                  <option value="customer">Customer</option>
                </select>
              </TableCell>
              <TableCell>{formatDate(user.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {isPending && (
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-3 py-2 text-xs text-gray-500">
          <Loader2 className="h-3 w-3 animate-spin" />
          Applying role update
        </div>
      )}
    </div>
  );
}
