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
    <Card className={cn("border-2 border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300", className)}>
      <CardContent className="p-4 sm:p-8">
        <div className="flex items-center justify-between pb-3 sm:pb-4">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{title}</p>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
            {icon}
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-4xl font-black text-black tracking-tight">{value}</div>
          {trend && (
            <div className="mt-3 sm:mt-4 flex items-center gap-2 flex-wrap">
              <span className={cn(
                "px-2 py-1 rounded-lg text-xs font-black uppercase tracking-wider",
                trend.isNeutral ? "bg-gray-100 text-gray-600" : trend.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              )}>
                {trend.value}
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-400">
                {trend.label}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
