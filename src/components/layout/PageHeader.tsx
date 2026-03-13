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
        <div className={cn("flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8", className)}>
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
                {description && (
                    <p className="text-gray-500 font-medium">
                        {description}
                    </p>
                )}
            </div>
            {action && (
                <div className="flex items-center gap-3">
                    {action}
                </div>
            )}
        </div>
    );
};
