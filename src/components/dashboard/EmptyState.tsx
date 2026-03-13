import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
  actionOnClick?: () => void;
  className?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  actionUrl,
  actionOnClick,
  className
}: EmptyStateProps) => {
  return (
    <div className={cn("text-center py-16 px-4 border border-dashed border-gray-200 rounded-2xl bg-white", className)}>
      <div className="mx-auto w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 mb-6 shadow-sm">
        {icon}
      </div>
      <h3 className="mt-2 text-lg font-bold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
        {description}
      </p>
      
      {(actionLabel && actionUrl) && (
        <div className="mt-8">
          <Button asChild className="bg-black hover:bg-black/90 text-white font-semibold rounded-xl px-6 h-12 shadow-sm">
            <Link to={actionUrl}>
              <Plus className="w-4 h-4 mr-2" />
              {actionLabel}
            </Link>
          </Button>
        </div>
      )}

      {(actionLabel && actionOnClick) && (
        <div className="mt-8">
          <Button onClick={actionOnClick} className="bg-black hover:bg-black/90 text-white font-semibold rounded-xl px-6 h-12 shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
