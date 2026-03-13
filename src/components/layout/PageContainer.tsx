import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
    children: ReactNode;
    className?: string;
}

export const PageContainer = ({ children, className }: PageContainerProps) => {
    return (
        <div className={cn("container mx-auto px-4 sm:px-6 py-8", className)}>
            {children}
        </div>
    );
};
