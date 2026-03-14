"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, Boxes, Calculator, ClipboardList, LayoutDashboard, Map, Menu, Package, Truck, User, Users, Warehouse } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const linksByRole = (role: string | null) => {
  if (role === "customer") {
    return [
      { href: "/customer", label: "Customer Portal", icon: Users },
      { href: "/shipments", label: "Shipments", icon: Package },
    ];
  }

  return [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/customers", label: "Customers", icon: Users },
    { href: "/shipments", label: "Shipments", icon: Package },
    { href: "/carriers", label: "Carriers", icon: Truck },
    { href: "/drivers", label: "Drivers", icon: User },
    { href: "/routes", label: "Routes", icon: Map },
    { href: "/warehouses", label: "Warehouses", icon: Warehouse },
    { href: "/inventory", label: "Inventory", icon: Boxes },
    { href: "/rates", label: "Rates", icon: Calculator },
    { href: "/invoicing", label: "Invoicing", icon: ClipboardList },
    { href: "/reports", label: "Reports", icon: BarChart3 },
  ];
};

export function MobileNav({ role }: { role: string | null }) {
  const pathname = usePathname();
  const links = linksByRole(role);
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10" aria-label="Open navigation menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent className="w-[86vw] max-w-xs border-l border-white/10 bg-gradient-to-b from-slate-950 to-slate-900 p-4">
          <SheetHeader>
            <SheetTitle className="text-white">NextGen TMS</SheetTitle>
          </SheetHeader>

          <nav className="mt-6 max-h-[calc(100vh-7rem)] space-y-1 overflow-y-auto pr-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-cyan-500/20 text-cyan-100"
                      : "text-gray-400 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
