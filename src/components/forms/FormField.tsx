import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  name: string;
  children: ReactNode;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const FormField = ({
  label,
  name,
  children,
  description,
  error,
  required = false,
  className,
  colSpan = 6,
}: FormFieldProps) => {
  const colSpanClass = {
    1: "sm:col-span-1",
    2: "sm:col-span-2",
    3: "sm:col-span-3",
    4: "sm:col-span-4",
    5: "sm:col-span-5",
    6: "sm:col-span-6",
  }[colSpan];

  return (
    <div className={cn(colSpanClass, className)}>
      <Label htmlFor={name} className="block text-[13px] uppercase tracking-wider font-black text-gray-900 mb-3">
        {label}
        {required && <span className="text-orange-500 ml-1">*</span>}
      </Label>
      <div className="mt-1 relative">
        {children}
      </div>
      {description && !error && (
        <p className="mt-3 text-xs font-semibold text-gray-400">{description}</p>
      )}
      {error && (
        <p className="mt-3 text-xs font-bold text-red-600">{error}</p>
      )}
    </div>
  );
};
