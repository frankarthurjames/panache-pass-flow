import { useState, useEffect } from "react";
import { Building2, LayoutDashboard, Settings, Users, Calendar, BarChart3, CreditCard, Plus, Home, QrCode, Ticket } from "lucide-react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Organisations dynamiques
// ... keep existing code (menus)


const mainMenuItems = [
  { title: "Accueil", url: "/", icon: Home, exact: true },
  { title: "Vue d'ensemble", url: "/dashboard", icon: LayoutDashboard, exact: true },
  { title: "Mes événements", url: "/dashboard/my-events", icon: Calendar, exact: true },
  { title: "Organisations", url: "/dashboard/organizations", icon: Building2 },
];

const orgMenuItems = [
  { title: "Tableau de bord", url: "/dashboard/org/:orgId", icon: LayoutDashboard },
  { title: "Événements", url: "/dashboard/org/:orgId/events", icon: Calendar },
  { title: "Billets", url: "/dashboard/org/:orgId/tickets", icon: Ticket },
  { title: "Statistiques", url: "/dashboard/org/:orgId/analytics", icon: BarChart3 },
  { title: "Scanner QR", url: "/dashboard/org/:orgId/qr-validator", icon: QrCode },
  { title: "Intégrations", url: "/dashboard/org/:orgId/integrations", icon: CreditCard },
  { title: "Paramètres", url: "/dashboard/org/:orgId/settings", icon: Settings },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { orgId } = useParams();
  const navigate = useNavigate();
  const [selectedOrg, setSelectedOrg] = useState(orgId || "");
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<any[]>([]);

  // Charger les organisations de l'utilisateur
  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('organization_members')
        .select(`organizations (id, name, logo_url)`);

      if (!error && data) {
        const orgs = data.map((m: any) => m.organizations).filter(Boolean);
        // Déduplicater les organisations par ID
        const uniqueOrgs = orgs.reduce((acc: any[], org: any) => {
          if (!acc.find(existingOrg => existingOrg.id === org.id)) {
            acc.push(org);
          }
          return acc;
        }, []);
        setOrganizations(uniqueOrgs);
        if (!selectedOrg && uniqueOrgs[0]) {
          setSelectedOrg(uniqueOrgs[0].id);
        }
      }
    };
    fetchOrganizations();
  }, [user]);

  // Synchroniser selectedOrg avec l'URL
  useEffect(() => {
    if (orgId !== selectedOrg) {
      setSelectedOrg(orgId || "");
    }
  }, [orgId]);

  const currentOrg = organizations.find(org => org.id === selectedOrg);

  const handleOrgChange = (newOrgId: string) => {
    if (newOrgId === "new") {
      navigate("/dashboard/organizations/new");
      return;
    }
    setSelectedOrg(newOrgId);
    navigate(`/dashboard/org/${newOrgId}`);
  };

  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-orange-50 text-gray-900 font-medium"
      : "hover:bg-gray-50 text-gray-600 hover:text-gray-900";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="px-2">
        {/* Header avec logo */}
        <div className="px-2 py-4 border-b border-border/50">
          <Logo
            size={collapsed ? "sm" : "md"}
            showText={!collapsed}
            className="justify-center"
          />
        </div>
        {/* Organisation Selector */}
        {!collapsed && (
          <div className="px-2 py-4">
            <Select value={selectedOrg} onValueChange={handleOrgChange}>
              <SelectTrigger className="w-full rounded-xl border-gray-200 focus:ring-orange-500/20">
                <SelectValue placeholder={organizations.length ? "Sélectionner une organisation" : "Nouvelle organisation"} />
              </SelectTrigger>
              <SelectContent className="z-50 bg-popover">
                {organizations.length === 0 ? (
                  <SelectItem value="new">
                    <div className="flex items-center gap-2">
                      
                      <span>Nouvelle organisation</span>
                    </div>
                  </SelectItem>
                ) : (
                  organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={org.logo_url || ""} />
                          <AvatarFallback className="text-xs">
                            {org.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{org.name}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 font-medium">Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.exact}
                      className={getNavClassName}
                    >
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Organization Navigation */}
        {selectedOrg && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-500 font-medium">
              {!collapsed ? currentOrg?.name : "Org"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {orgMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url.replace(':orgId', selectedOrg)}
                        className={getNavClassName}
                      >
                        <item.icon className="w-4 h-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Create Organization */}
        <div className="mt-auto p-2">
          <Button
            variant="outline"
            size={collapsed ? "icon" : "sm"}
            className="w-full"
            asChild
          >
            <NavLink to="/dashboard/organizations/new">
              
              {!collapsed && <span className="ml-2">Nouvelle organisation</span>}
            </NavLink>
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}