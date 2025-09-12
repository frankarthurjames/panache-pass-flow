import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Navbar } from "@/components/Navbar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SidebarProvider>
        <div className="flex min-h-[calc(100vh-64px)] w-full">
          <DashboardSidebar />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}