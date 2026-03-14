import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export const DashboardCard = ({
  title,
  description,
  action,
  children,
  className,
  contentClassName
}: DashboardCardProps) => {
  return (
    <Card className={cn("border-2 border-gray-100 shadow-xl overflow-hidden rounded-3xl", className)}>
      <CardHeader className="bg-white border-b-2 border-gray-50 px-8 py-6 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-black text-black">{title}</CardTitle>
          {description && (
            <CardDescription className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              {description}
            </CardDescription>
          )}
        </div>
        {action && <div>{action}</div>}
      </CardHeader>
      <CardContent className={cn("p-8", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
};
