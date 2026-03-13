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
    <Card className={cn("border-gray-100 shadow-sm overflow-hidden", className)}>
      <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold text-gray-900">{title}</CardTitle>
          {description && (
            <CardDescription className="text-xs text-gray-500 font-medium">
              {description}
            </CardDescription>
          )}
        </div>
        {action && <div>{action}</div>}
      </CardHeader>
      <CardContent className={cn("p-6", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
};
