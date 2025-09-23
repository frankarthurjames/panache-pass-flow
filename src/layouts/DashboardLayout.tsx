import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Calendar } from "lucide-react";
import panacheLogoText from "@/assets/panache-logo-text.png";

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        {/* Header with SidebarTrigger */}
        <header className="h-16 flex items-center justify-between border-b bg-background px-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div className="flex items-center">
              <img src={panacheLogoText} alt="Panache" className="h-6" />
            </div>
          </div>
        </header>

        {/* Main content area */}
        <div className="flex flex-1 w-full">
          <DashboardSidebar />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}