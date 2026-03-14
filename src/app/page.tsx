import Link from "next/link";
import { AlertTriangle, Map, Package, Truck, User, Warehouse } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Shipment Tracking",
    description: "Monitor shipment lifecycle from dispatch to delivery in real time.",
    icon: Package,
  },
  {
    title: "Carrier Management",
    description: "Manage partners, ratings, and transport modes in one place.",
    icon: Truck,
  },
  {
    title: "Driver Management",
    description: "Track driver availability, license validity, and assignment readiness.",
    icon: User,
  },
  {
    title: "Route Optimization",
    description: "Analyze routes by distance, mode, and expected transit duration.",
    icon: Map,
  },
  {
    title: "Warehouse Management",
    description: "Centralize warehouse visibility by region, status, and capacity.",
    icon: Warehouse,
  },
  {
    title: "Smart Delay Risk Engine",
    description: "Flag risky shipments early using live operational factors.",
    icon: AlertTriangle,
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute -top-20 left-1/3 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-200">
            MODERN LOGISTICS CONTROL TOWER
          </p>
          <h1 className="mt-4 text-5xl font-bold tracking-tight text-white sm:text-6xl">NextGen TMS</h1>
          <p className="mt-4 text-lg text-slate-200">AI-powered transportation management for modern logistics</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/register" className={buttonVariants() + " bg-cyan-500 text-slate-950 hover:bg-cyan-400"}>
              Get Started
            </Link>
            <Link href="/login" className={buttonVariants({ variant: "outline" }) + " border-white/40 bg-white/10 text-white hover:bg-white/20"}>
              Login
            </Link>
          </div>
        </section>

        <section className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="animate-in fade-in slide-in-from-bottom-2 border-white/10 bg-white/10 text-white shadow-lg backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white/20"
            >
              <CardContent className="space-y-3 p-5">
                <feature.icon className="h-6 w-6 text-cyan-200" />
                <h2 className="text-base font-semibold text-white">{feature.title}</h2>
                <p className="text-sm text-slate-200">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
