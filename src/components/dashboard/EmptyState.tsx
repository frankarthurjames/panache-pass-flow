import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
  actionOnClick?: () => void;
  className?: string;
  icon?: ReactNode; // Kept for backwards compatibility if really needed, but stripped from UI
}

export const EmptyState = ({
  title,
  description,
  actionLabel,
  actionUrl,
  actionOnClick,
  className
}: EmptyStateProps) => {
  return (
    <div className={cn("text-center py-20 px-6 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/30", className)}>
      <h3 className="text-2xl font-black text-black">{title}</h3>
      <p className="mt-4 text-base font-medium text-gray-500 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      
      {(actionLabel && actionUrl) && (
        <div className="mt-10">
          <Button asChild>
            <Link to={actionUrl}>
              {actionLabel}
            </Link>
          </Button>
        </div>
      )}

      {(actionLabel && actionOnClick) && (
        <div className="mt-10">
          <Button onClick={actionOnClick}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
