import { redirect } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const userName = profile?.full_name ?? user.user_metadata?.full_name ?? "User";
  const userEmail = profile?.email ?? user.email ?? "";
  const role = profile?.role ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/40 to-emerald-50/30">
      <div className="hidden md:block">
        <Sidebar userName={userName} userEmail={userEmail} role={role} />
      </div>
      <div className="md:ml-64">
        <Header userName={userName} userEmail={userEmail} mobileNav={<MobileNav role={role} />} />
        <main className="p-4 md:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
