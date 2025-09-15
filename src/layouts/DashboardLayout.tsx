import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Calendar } from "lucide-react";

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        {/* Header with SidebarTrigger */}
        <header className="h-16 flex items-center justify-between border-b bg-background px-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-muted border rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Panache
              </span>
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