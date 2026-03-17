import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Building2, Users, Calendar, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { Logo } from "@/components/Logo";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrgs: 0,
    totalUsers: 0,
    totalEvents: 0,
    publishedEvents: 0,
    pastEvents: 0,
    upcomingEvents: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Fetch counts in parallel
        const [
          { count: totalOrgs },
          { count: totalUsers },
          { count: totalEvents },
          { count: publishedEvents },
          { count: upcomingEvents },
          { data: weeklyOrders },
          { data: monthlyOrders },
        ] = await Promise.all([
          supabase.from("organizations").select("*", { count: "exact", head: true }),
          supabase.from("users").select("*", { count: "exact", head: true }),
          supabase.from("events").select("*", { count: "exact", head: true }),
          supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "published"),
          supabase.from("events").select("*", { count: "exact", head: true }).gte("starts_at", now.toISOString()),
          supabase.from("orders").select("total_cents, created_at").eq("status", "paid").gte("created_at", startOfWeek.toISOString()),
          supabase.from("orders").select("total_cents, created_at").eq("status", "paid").gte("created_at", startOfMonth.toISOString()),
        ]);

        const pastEvents = (totalEvents || 0) - (upcomingEvents || 0);
        const weeklyRevenue = (weeklyOrders || []).reduce((sum, o) => sum + (o.total_cents || 0), 0) / 100;
        const monthlyRevenue = (monthlyOrders || []).reduce((sum, o) => sum + (o.total_cents || 0), 0) / 100;

        setStats({
          totalOrgs: totalOrgs || 0,
          totalUsers: totalUsers || 0,
          totalEvents: totalEvents || 0,
          publishedEvents: publishedEvents || 0,
          pastEvents,
          upcomingEvents: upcomingEvents || 0,
          weeklyRevenue,
          monthlyRevenue,
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex items-center gap-4 mb-8">
        <Logo size="lg" showText={false} />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Administration Panache</h1>
          <p className="text-muted-foreground text-sm">Vue globale de la plateforme</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Organisations"
          value={stats.totalOrgs.toString()}
          icon={<Building2 className="h-5 w-5" />}
        />
        <StatsCard
          title="Utilisateurs"
          value={stats.totalUsers.toString()}
          icon={<Users className="h-5 w-5" />}
        />
        <StatsCard
          title="Événements"
          value={stats.totalEvents.toString()}
          icon={<Calendar className="h-5 w-5" />}
          trend={{
            value: `${stats.publishedEvents} publiés`,
            label: "",
            isPositive: true,
            isNeutral: false,
          }}
        />
        <StatsCard
          title="Revenus du mois"
          value={`${stats.monthlyRevenue.toFixed(0)}€`}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{
            value: `${stats.weeklyRevenue.toFixed(0)}€ cette semaine`,
            label: "",
            isPositive: stats.weeklyRevenue > 0,
            isNeutral: stats.weeklyRevenue === 0,
          }}
        />
      </div>

      {/* Event breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DashboardCard title="Événements à venir" contentClassName="p-6">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-primary" />
            <div>
              <p className="text-3xl font-bold">{stats.upcomingEvents}</p>
              <p className="text-sm text-muted-foreground">événements planifiés</p>
            </div>
          </div>
        </DashboardCard>
        <DashboardCard title="Événements passés" contentClassName="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-3xl font-bold">{stats.pastEvents}</p>
              <p className="text-sm text-muted-foreground">événements terminés</p>
            </div>
          </div>
        </DashboardCard>
      </div>
    </PageContainer>
  );
};

export default AdminDashboard;
