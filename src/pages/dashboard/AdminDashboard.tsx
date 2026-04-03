import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Building2, Users, Calendar, TrendingUp, ShieldCheck, MoreVertical, Trash2, Plus, Wallet, Settings, Edit, Search } from "lucide-react";
import { DataTable } from "@/components/dashboard/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrgs: 0,
    totalUsers: 0,
    totalEvents: 0,
    publishedEvents: 0,
    pastEvents: 0,
    upcomingEvents: 0,
    inProgressEvents: 0,
    totalSalesCents: 0,
    platformFeesCents: 0,
    totalTicketsSold: 0,
  });
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [orgSearch, setOrgSearch] = useState("");
  const [eventSearch, setEventSearch] = useState("");

  const filteredOrgs = organizations.filter(o =>
    o.name.toLowerCase().includes(orgSearch.toLowerCase()) ||
    (o.city && o.city.toLowerCase().includes(orgSearch.toLowerCase()))
  );

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
    (e.organizations?.name && e.organizations.name.toLowerCase().includes(eventSearch.toLowerCase()))
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const now = new Date();

      // Fetch counts and lists
      const [
        { count: totalOrgs },
        { count: totalUsers },
        { count: totalEvents },
        { count: publishedEvents },
        { count: upcomingEvents },
        { count: inProgressEvents },
        { count: totalTicketsSold },
        { data: paidOrders },
        { data: orgsData },
        { data: eventsData },
      ] = await Promise.all([
        supabase.from("organizations").select("*", { count: "exact", head: true }),
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("events").select("*", { count: "exact", head: true }).gt("starts_at", now.toISOString()),
        supabase.from("events").select("*", { count: "exact", head: true }).lte("starts_at", now.toISOString()).gte("ends_at", now.toISOString()),
        supabase.from("registrations").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total_cents").eq("status", "paid"),
        supabase.from("organizations").select("*").order("created_at", { ascending: false }),
        supabase.from("events").select("*, organizations(name)").order("created_at", { ascending: false }),
      ]);

      const totalSalesCents = (paidOrders || []).reduce((sum, o: any) => sum + (o.total_cents || 0), 0);
      const platformFeesCents = (paidOrders || []).reduce((sum, o: any) => {
        const total = o.total_cents || 0;
        if (total === 0) return sum;
        const subtotal = Math.round((total - 50) / 1.02);
        return sum + (total - subtotal);
      }, 0);

      setStats({
        totalOrgs: totalOrgs || 0,
        totalUsers: totalUsers || 0,
        totalEvents: totalEvents || 0,
        publishedEvents: publishedEvents || 0,
        inProgressEvents: inProgressEvents || 0,
        pastEvents: (totalEvents || 0) - (upcomingEvents || 0) - (inProgressEvents || 0),
        upcomingEvents: upcomingEvents || 0,
        totalSalesCents,
        platformFeesCents,
        totalTicketsSold: totalTicketsSold || 0,
      });

      setOrganizations(orgsData || []);
      setEvents(eventsData || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) toast.error("Erreur lors de la suppression");
    else {
      toast.success("Événement supprimé");
      fetchData();
    }
  };

  const handleDeleteOrg = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette organisation ?")) return;
    const { error } = await supabase.from("organizations").delete().eq("id", id);
    if (error) toast.error("Erreur lors de la suppression");
    else {
      toast.success("Organisation supprimée");
      fetchData();
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageContainer>
    );
  }

  const orgColumns = [
    { header: "Nom", accessorKey: "name" },
    { header: "Ville", accessorKey: "city" },
    {
      header: "Stripe",
      accessorKey: "stripe_account_id",
      cell: (org: any) => (
        <Badge variant={org.stripe_account_id ? "default" : "secondary"}>
          {org.stripe_account_id ? "Configuré" : "Non configuré"}
        </Badge>
      )
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (org: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/dashboard/org/${org.id}`)}>
              <Settings className="mr-2 h-4 w-4" /> Gérer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteOrg(org.id)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const eventColumns = [
    { header: "Titre", accessorKey: "title" },
    { header: "Organisation", accessorKey: "organizations.name" },
    {
      header: "Statut",
      accessorKey: "status",
      cell: (event: any) => (
        <Badge variant={event.status === "published" ? "default" : "secondary"}>
          {event.status === "published" ? "Publié" : event.status === "draft" ? "Brouillon" : "Archivé"}
        </Badge>
      )
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (event: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/events/${event.id}`)}>
              <Calendar className="mr-2 h-4 w-4" /> Voir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/dashboard/org/${event.organization_id}/events/${event.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" /> Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteEvent(event.id)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Administration Panache"
        description="Vue d'ensemble et gestion de la plateforme"
        action={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-4 sm:mt-0">
            <Button onClick={() => navigate("/dashboard/organizations/new")} variant="outline" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Créer une organisation
            </Button>
            <Button onClick={() => navigate("/dashboard/events/new")} className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto text-white">
              <Plus className="mr-2 h-4 w-4" /> Créer un événement
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <StatsCard
          title="Utilisateurs"
          value={stats.totalUsers.toString()}
          icon={<Users className="h-5 w-5 text-blue-600" />}
          description="Total inscrits"
        />
        <StatsCard
          title="Billets Vendus"
          value={stats.totalTicketsSold.toString()}
          icon={<Calendar className="h-5 w-5 text-indigo-600" />}
          description="Total généré"
        />
        <StatsCard
          title="Événements"
          value={stats.totalEvents.toString()}
          icon={<Calendar className="h-5 w-5 text-orange-600" />}
          description={`${stats.upcomingEvents} à venir • ${stats.inProgressEvents} en cours • ${stats.pastEvents} terminés`}
        />
        <StatsCard
          title="Volume d'affaires"
          value={`${(stats.totalSalesCents / 100).toLocaleString()}€`}
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
          description="Ventes totales"
        />
        <StatsCard
          title="Commissions"
          value={`${(stats.platformFeesCents / 100).toLocaleString()}€`}
          icon={<Wallet className="h-5 w-5 text-purple-600" />}
          description="Revenus Panache"
        />
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList className="bg-white border">
          <TabsTrigger value="events" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600">
            Événements
          </TabsTrigger>
          <TabsTrigger value="organizations" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600">
            Organisations
          </TabsTrigger>
        </TabsList>
        <TabsContent value="events">
          <DashboardCard title="Tous les événements" description="Gérez l'ensemble des événements de la plateforme">
            <div className="mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher un événement..."
                  className="pl-9"
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                />
              </div>
            </div>
            <DataTable data={filteredEvents} columns={eventColumns} keyExtractor={(e) => e.id} pageSize={10} />
          </DashboardCard>
        </TabsContent>
        <TabsContent value="organizations">
          <DashboardCard title="Toutes les organisations" description="Gérez les structures organisatrices">
            <div className="mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher une organisation..."
                  className="pl-9"
                  value={orgSearch}
                  onChange={(e) => setOrgSearch(e.target.value)}
                />
              </div>
            </div>
            <DataTable data={filteredOrgs} columns={orgColumns} keyExtractor={(o) => o.id} pageSize={10} />
          </DashboardCard>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default AdminDashboard;
