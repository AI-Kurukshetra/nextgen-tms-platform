"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, Calculator, ClipboardList, LayoutDashboard, Map, Menu, Package, Truck, User, Users, Warehouse } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
  ];
};

export function MobileNav({ role }: { role: string | null }) {
  const pathname = usePathname();
  const links = linksByRole(role);

  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent className="bg-gray-900 p-4">
          <SheetHeader>
            <SheetTitle className="text-white">NextGen TMS</SheetTitle>
          </SheetHeader>

          <nav className="mt-6 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <SheetClose key={link.href} asChild>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </SheetClose>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
