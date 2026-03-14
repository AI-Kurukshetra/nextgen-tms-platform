"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { APP_URL } from "@/lib/config";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

export async function login(formData: unknown) {
  const parsed = loginSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid login payload" };
  }

  const supabase = await createClient();
  const { email, password, role } = parsed.data;
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    await supabase.auth.signOut();
    return { error: "Unable to verify logged in user" };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const userRole = profile?.role ?? null;

  if (userRole !== role) {
    await supabase.auth.signOut();
    const cookieStore = await cookies();
    cookieStore.delete("tms_role");
    return { error: `This account is registered as ${userRole ?? "unknown"}, not ${role}` };
  }

  const cookieStore = await cookies();
  cookieStore.set("tms_role", role, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(role === "customer" ? "/customer" : "/dashboard");
}

export async function register(formData: unknown) {
  const parsed = registerSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid registration payload" };
  }

  const adminClient = createAdminClient();
  const { data: existingProfile } = await adminClient
    .from("profiles")
    .select("id")
    .eq("email", parsed.data.email)
    .maybeSingle();

  if (existingProfile) {
    return { error: "Email is already registered" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${APP_URL}/auth/callback`,
      data: {
        full_name: parsed.data.fullName,
        role: parsed.data.role,
      },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "Email is already registered" };
    }
    return { error: error.message };
  }

  const cookieStore = await cookies();
  cookieStore.set("tms_role", parsed.data.role, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(parsed.data.role === "customer" ? "/customer" : "/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const cookieStore = await cookies();
  cookieStore.delete("tms_role");
  redirect("/login");
}
