import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const PageHeader = ({ 
  title, 
  description, 
  action,
  className 
}: PageHeaderProps) => {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12", className)}>
      <div className="flex-1 min-w-0">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black truncate mb-3 leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-base md:text-lg font-medium text-gray-400">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0 flex items-center">
          {action}
        </div>
      )}
    </div>
  );
};
