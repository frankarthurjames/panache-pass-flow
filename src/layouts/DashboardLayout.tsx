import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Logo } from "@/components/Logo";

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-gray-50/50">
        {/* Header with SidebarTrigger */}
        <header className="h-16 flex items-center justify-between border-b bg-background px-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <Logo size="sm" />
          </div>
        </header>

        {/* Main content area */}
        <div className="flex flex-1 w-full">
          <DashboardSidebar />
          <main className="flex-1 p-3 sm:p-6 overflow-x-hidden min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}