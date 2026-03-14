"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Calculator,
  ClipboardList,
  Map,
  Package,
  Truck,
  User,
  Users,
  Warehouse,
  Boxes,
  LogOut,
} from "lucide-react";
import { useTransition } from "react";

import { logout } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type SidebarProps = {
  userName: string;
  userEmail: string;
  role: string | null;
};

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

export function Sidebar({ userName, userEmail, role }: SidebarProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const links = linksByRole(role);

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="px-2 py-4">
        <h1 className="text-xl font-bold text-white">NextGen TMS</h1>
        <p className="text-xs text-slate-300">Logistics Command Center</p>
      </div>

      <nav className="mt-4 flex-1 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
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

      <div className="space-y-3 border-t border-gray-800 pt-4">
        <div className="flex items-center gap-3 px-2">
          <Avatar>
            <AvatarFallback>{(userName || userEmail || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{userName}</p>
            <p className="truncate text-xs text-gray-400">{userEmail}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              await logout();
            });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
