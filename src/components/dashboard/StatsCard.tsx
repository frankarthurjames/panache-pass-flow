import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: string | number;
    label: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  className?: string;
}

export const StatsCard = ({
  title,
  value,
  icon,
  trend,
  className
}: StatsCardProps) => {
  return (
    <Card className={cn("border-gray-100 shadow-sm", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
            {icon}
          </div>
        </div>
        <div>
          <div className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</div>
          {trend && (
            <p className={cn(
              "text-xs font-medium mt-2 flex items-center gap-1",
              trend.isNeutral ? "text-gray-500" : trend.isPositive ? "text-emerald-600" : "text-red-600"
            )}>
              <span className={cn(
                "px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase",
                trend.isNeutral ? "bg-gray-100 text-gray-600" : trend.isPositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              )}>
                {trend.value}
              </span>
              <span className="text-gray-400 font-medium">
                {trend.label}
              </span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
