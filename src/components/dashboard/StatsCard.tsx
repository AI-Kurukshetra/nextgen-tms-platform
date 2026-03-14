import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatsCardProps = {
  title: string;
  value: number;
  icon: LucideIcon;
  description: string;
  color: string;
};

export function StatsCard({ title, value, icon: Icon, description, color }: StatsCardProps) {
  return (
    <Card className="group border-slate-200 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <span className="rounded-full bg-slate-100 p-2 transition group-hover:scale-110">
          <Icon className={cn("h-4 w-4", color)} />
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-gray-900 tabular-nums">{value}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </CardContent>
    </Card>
  );
}
