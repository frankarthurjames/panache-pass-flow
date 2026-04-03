import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useLocation, Link } from "react-router-dom";

interface PageContainerProps {
    children: ReactNode;
    className?: string;
  showBreadcrumbs?: boolean;
}

const routeMap: Record<string, string> = {
  dashboard: "Dashboard",
  "my-events": "Mes réservations",
  organizations: "Organisations",
  admin: "Admin Panache",
  org: "Organisation",
  events: "Événements",
  new: "Nouveau",
  edit: "Modifier",
  tickets: "Billets",
  settings: "Paramètres",
  "qr-validator": "Scanner QR",
  integrations: "Intégrations",
};

export function PageContainer({ children, className, showBreadcrumbs = true }: PageContainerProps) {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

    return (
        <div className={cn("w-full max-w-full px-2 sm:px-4 md:px-6 py-4 sm:py-8 overflow-x-hidden", className)}>
      {showBreadcrumbs && pathnames.length > 0 && (
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Accueil</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathnames.map((value, index) => {
              const to = `/${pathnames.slice(0, index + 1).join("/")}`;
              const isLast = index === pathnames.length - 1;
              const label = routeMap[value] || value;
              
              // Skip IDs in breadcrumbs if possible or show generic
              const isId = value.length > 20; // Simple check for UUIDs

              return (
                <div key={to} className="flex items-center">
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{isId ? "Détails" : label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={to}>{isId ? "Détails" : label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}
            {children}
        </div>
    );
};
