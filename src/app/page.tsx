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
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900">NextGen TMS</h1>
          <p className="mt-4 text-lg text-gray-600">
            AI-powered transportation management for modern logistics
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/register" className={buttonVariants()}>
              Get Started
            </Link>
            <Link href="/login" className={buttonVariants({ variant: "outline" })}>
              Login
            </Link>
          </div>
        </section>

        <section className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-gray-200">
              <CardContent className="space-y-3 p-5">
                <feature.icon className="h-6 w-6 text-gray-900" />
                <h2 className="text-base font-semibold text-gray-900">{feature.title}</h2>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
