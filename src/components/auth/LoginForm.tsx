"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { login } from "@/lib/actions/auth";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "customer",
    },
  });

  const onSubmit = (values: LoginInput) => {
    startTransition(async () => {
      const result = await login(values);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900">
          <Sparkles className="h-4 w-4" />
          Visitor Demo Accounts
        </div>
        <div className="grid gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              className="rounded-md border border-blue-200 bg-white px-3 py-2 text-left text-xs text-blue-900 transition hover:border-blue-300 hover:bg-blue-50"
              onClick={() => {
                setValue("email", account.email, { shouldValidate: true });
                setValue("password", account.password, { shouldValidate: true });
                setValue("role", account.role, { shouldValidate: true });
                toast.success(`${account.label} loaded`);
              }}
            >
              <p className="font-semibold">{account.label}</p>
              <p>{account.email}</p>
              <p>Role: {account.role}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select id="role" {...register("role")}>
          <SelectItem value="customer">Customer</SelectItem>
          <SelectItem value="dispatcher">Dispatcher</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </Select>
        {errors.role && <p className="text-sm text-red-600">{errors.role.message}</p>}
      </div>

      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login to Dashboard"}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link className="font-medium text-blue-600 hover:underline" href="/register">
          Register
        </Link>
      </p>
    </form>
  );
}
