import { createClient } from "@/lib/supabase/server";

export type ApiAuthContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  role: string | null;
};

export async function requireApiAuth(): Promise<{ context: ApiAuthContext | null; response: Response | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      context: null,
      response: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return {
    context: {
      supabase,
      userId: user.id,
      role: profile?.role ?? null,
    },
    response: null,
  };
}

export async function requireApiRole(
  allowedRoles: string[],
): Promise<{ context: ApiAuthContext | null; response: Response | null }> {
  const { context, response } = await requireApiAuth();

  if (response || !context) {
    return { context: null, response };
  }

  if (!allowedRoles.includes(context.role ?? "")) {
    return {
      context: null,
      response: Response.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { context, response: null };
}
