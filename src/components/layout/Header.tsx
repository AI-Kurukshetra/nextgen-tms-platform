"use client";

import { usePathname } from "next/navigation";
import { useTransition } from "react";

import { logout } from "@/lib/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HeaderProps = {
  userEmail: string;
  userName: string;
  mobileNav?: React.ReactNode;
};

const routeTitles: Record<string, string> = {
  dashboard: "Dashboard",
  customers: "Customers",
  shipments: "Shipments",
  carriers: "Carriers",
  drivers: "Drivers",
  routes: "Routes",
  warehouses: "Warehouses",
  customer: "Customer Portal",
  inventory: "Inventory Visibility",
  rates: "Rate Management",
  invoicing: "Freight Audit & Payment",
};

function getTitle(pathname: string) {
  const segment = pathname.split("/").filter(Boolean)[0] ?? "dashboard";
  return routeTitles[segment] ?? "NextGen TMS";
}

export function Header({ userEmail, userName, mobileNav }: HeaderProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        {mobileNav}
        <h1 className="text-xl font-semibold text-gray-900">{getTitle(pathname)}</h1>
      </div>

      <div className="relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
              <Avatar>
                <AvatarFallback>{(userName || userEmail || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{userEmail}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                startTransition(async () => {
                  await logout();
                });
              }}
              disabled={isPending}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
