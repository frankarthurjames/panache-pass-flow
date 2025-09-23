import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Profile from "./pages/Profile";
import CreateEvent from "./pages/CreateEvent";
import NotFound from "./pages/NotFound";
import FAQ from "./pages/FAQ";
import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";
import DashboardLayout from "./layouts/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import Organizations from "./pages/dashboard/Organizations";
import MyEvents from "./pages/dashboard/MyEvents";
import NewOrganization from "./pages/dashboard/organizations/NewOrganization";
import OrganizationDashboard from "./pages/dashboard/organization/OrganizationDashboard";
import Integrations from "./pages/dashboard/organization/Integrations";
import OrgEvents from "./pages/dashboard/organization/Events";
import CreateOrgEvent from "./pages/dashboard/organization/CreateEvent";
import Analytics from "./pages/dashboard/organization/Analytics";
import Settings from "./pages/dashboard/organization/Settings";
import EventEdit from "./pages/dashboard/organization/EventEdit";
import PaymentSuccess from "./pages/PaymentSuccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard/events/new" element={<CreateEvent />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/legal/terms" element={<Terms />} />
            <Route path="/legal/privacy" element={<Privacy />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="my-events" element={<MyEvents />} />
              <Route path="organizations" element={<Organizations />} />
              <Route path="organizations/new" element={<NewOrganization />} />
              <Route path="org/:orgId" element={<OrganizationDashboard />} />
              <Route path="org/:orgId/events" element={<OrgEvents />} />
              <Route path="org/:orgId/events/new" element={<CreateOrgEvent />} />
              <Route path="org/:orgId/events/:eventId/edit" element={<EventEdit />} />
              <Route path="org/:orgId/events/:eventId/analytics" element={<Analytics />} />
              <Route path="org/:orgId/analytics" element={<Analytics />} />
              <Route path="org/:orgId/integrations" element={<Integrations />} />
              <Route path="org/:orgId/settings" element={<Settings />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
