import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormGroupProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const FormGroup = ({
  title,
  description,
  children,
  className,
}: FormGroupProps) => {
  return (
    <div className={cn("space-y-8 pb-12 pt-12 first:pt-0 border-b-2 border-gray-100 last:border-0 last:pb-0", className)}>
      <div>
        <h3 className="text-2xl font-black leading-tight text-black mb-2">{title}</h3>
        {description && (
          <p className="text-sm font-medium text-gray-500">
            {description}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-6">
        {children}
      </div>
    </div>
  );
};
