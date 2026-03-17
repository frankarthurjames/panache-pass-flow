import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
    children: ReactNode;
    className?: string;
}

export const PageContainer = ({ children, className }: PageContainerProps) => {
    return (
        <div className={cn("w-full max-w-full px-2 sm:px-4 md:px-6 py-4 sm:py-8 overflow-x-hidden", className)}>
            {children}
        </div>
    );
};
