export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <div className="pointer-events-none absolute -left-20 top-10 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-0 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="grid w-full max-w-5xl gap-6 md:grid-cols-[1.2fr_1fr]">
        <section className="hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl md:block">
          <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium">NextGen TMS</p>
          <h1 className="mt-6 text-4xl font-bold leading-tight">Built for fast-moving logistics teams</h1>
          <p className="mt-4 text-sm text-slate-200">
            Manage shipments, carriers, drivers, billing, and live tracking from one real-time control tower.
          </p>
          <div className="mt-8 space-y-3 text-sm">
            <p className="rounded-md border border-white/10 bg-white/5 px-3 py-2">Realtime GPS tracking and risk signals</p>
            <p className="rounded-md border border-white/10 bg-white/5 px-3 py-2">Role-aware workflows for admin, dispatcher, and customer</p>
            <p className="rounded-md border border-white/10 bg-white/5 px-3 py-2">Freight audit, invoicing, and WMS integration</p>
          </div>
        </section>
        <div className="w-full rounded-2xl border border-white/40 bg-white/95 p-2 shadow-2xl backdrop-blur">{children}</div>
      </div>
    </div>
  );
}
