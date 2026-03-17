import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, TrendingUp, Calendar, Download, BarChart, ArrowLeft
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

import { PageContainer } from "@/components/layout/PageContainer";
import { StatsCard } from "@/components/dashboard/StatsCard";

const Analytics = () => {
  const { orgId, eventId } = useParams();
  const [eventData, setEventData] = useState<any>(null);
  const [registrationStats, setRegistrationStats] = useState<any[]>([]);
  const [ticketTypeStats, setTicketTypeStats] = useState<any[]>([]);
  const [dailyRegistrations, setDailyRegistrations] = useState<any[]>([]);
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!orgId) { setLoading(false); return; }
      
      let targetEventId = eventId;
      if (!targetEventId) {
        const { data: events } = await supabase
          .from('events').select('id').eq('organization_id', orgId)
          .order('created_at', { ascending: false }).limit(1);
        
        if (!events || events.length === 0) { setLoading(false); return; }
        targetEventId = events[0].id;
      }
      
      try {
        const { data: event, error: eventError } = await supabase
          .from('events').select('*').eq('id', targetEventId).single();
        if (eventError) throw eventError;

        const { count: totalRegistrationsCount } = await supabase
          .from('registrations').select('*', { count: 'exact', head: true }).eq('event_id', targetEventId);

        const { data: payments } = await supabase
          .from('payments').select('amount_cents, orders!inner(*)').eq('orders.event_id', targetEventId);
        const totalRevenue = payments?.reduce((sum, p) => sum + p.amount_cents, 0) || 0;

        const { data: ticketTypes } = await supabase
          .from('ticket_types').select(`*, registrations (id, status)`).eq('event_id', targetEventId);

        const ticketStats = ticketTypes?.map(ticket => {
          const sold = ticket.registrations?.filter((r: any) => r.status === 'issued').length || 0;
          return {
            name: ticket.name, sold, total: ticket.quantity,
            price: `${(ticket.price_cents / 100).toFixed(2)}€`,
            revenue: `${((sold * ticket.price_cents) / 100).toFixed(2)}€`
          };
        }) || [];

        const { data: recentRegs } = await supabase
          .from('registrations')
          .select(`id, status, created_at, users (display_name, email), ticket_types (name)`)
          .eq('event_id', targetEventId)
          .order('created_at', { ascending: false }).limit(10);

        const recentRegistrationsList = recentRegs?.map(reg => ({
          id: reg.id,
          name: reg.users?.display_name || 'Anonyme',
          email: reg.users?.email || 'email@example.com',
          ticketType: reg.ticket_types?.name || 'Standard',
          registrationDate: new Date(reg.created_at).toLocaleDateString('fr-FR'),
          status: reg.status === 'issued' ? 'Confirmé' : 'En attente'
        })) || [];

        // Daily data
        const now = new Date();
        const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const dailyData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now); date.setDate(date.getDate() - i);
          const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(date); endOfDay.setHours(23, 59, 59, 999);
          const { count } = await supabase.from('registrations')
            .select('*', { count: 'exact', head: true }).eq('event_id', targetEventId)
            .gte('created_at', startOfDay.toISOString()).lte('created_at', endOfDay.toISOString());
          dailyData.push({ date: dayNames[date.getDay()], count: count || 0 });
        }

        // Variations
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0, 0, 0, 0);
        const startOfLastWeek = new Date(startOfWeek); startOfLastWeek.setDate(startOfWeek.getDate() - 7);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const { count: registrationsThisWeek } = await supabase.from('registrations')
          .select('*', { count: 'exact', head: true }).eq('event_id', targetEventId)
          .gte('created_at', startOfWeek.toISOString());
        const { count: registrationsLastWeek } = await supabase.from('registrations')
          .select('*', { count: 'exact', head: true }).eq('event_id', targetEventId)
          .gte('created_at', startOfLastWeek.toISOString()).lt('created_at', startOfWeek.toISOString());

        const { data: paymentsThisMonth } = await supabase.from('payments')
          .select('amount_cents, orders!inner(*)').eq('orders.event_id', targetEventId)
          .gte('created_at', startOfMonth.toISOString());
        const { data: paymentsLastMonth } = await supabase.from('payments')
          .select('amount_cents, orders!inner(*)').eq('orders.event_id', targetEventId)
          .gte('created_at', startOfLastMonth.toISOString()).lt('created_at', startOfMonth.toISOString());

        const revenueThisMonth = paymentsThisMonth?.reduce((sum, p) => sum + p.amount_cents, 0) || 0;
        const revenueLastMonth = paymentsLastMonth?.reduce((sum, p) => sum + p.amount_cents, 0) || 0;
        const registrationsVariation = (registrationsThisWeek || 0) - (registrationsLastWeek || 0);
        const revenueVariationPercent = revenueLastMonth > 0 ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100) : 0;

        const currentFillRate = event.capacity > 0 ? Math.round(((totalRegistrationsCount || 0) / event.capacity) * 100) : 0;
        const lastWeekFillRate = event.capacity > 0 ? Math.round(((registrationsLastWeek || 0) / event.capacity) * 100) : 0;

        setEventData({
          title: event.title,
          date: new Date(event.starts_at).toLocaleDateString('fr-FR'),
          status: event.status === 'published' ? 'Publié' : 'Brouillon',
          totalRegistrations: totalRegistrationsCount || 0,
          capacity: event.capacity || 0,
          revenue: `${(totalRevenue / 100).toFixed(2)}€`,
        });

        setRegistrationStats([
          {
            title: "Total inscriptions",
            value: (totalRegistrationsCount || 0).toString(),
            icon: <Users className="h-5 w-5" />,
            trend: { value: `${registrationsVariation >= 0 ? '+' : ''}${registrationsVariation}`, label: "cette semaine", isPositive: registrationsVariation > 0, isNeutral: registrationsVariation === 0 }
          },
          {
            title: "Revenus générés", 
            value: `${(totalRevenue / 100).toFixed(0)}€`,
            icon: <TrendingUp className="h-5 w-5" />,
            trend: { value: `${revenueVariationPercent >= 0 ? '+' : ''}${revenueVariationPercent}%`, label: "ce mois", isPositive: revenueVariationPercent > 0, isNeutral: revenueVariationPercent === 0 }
          },
          {
            title: "Taux de remplissage",
            value: `${currentFillRate}%`,
            icon: <BarChart className="h-5 w-5" />,
            trend: { value: `${currentFillRate - lastWeekFillRate >= 0 ? '+' : ''}${currentFillRate - lastWeekFillRate}%`, label: "cette semaine", isPositive: currentFillRate > lastWeekFillRate, isNeutral: currentFillRate === lastWeekFillRate }
          }
        ]);

        setTicketTypeStats(ticketStats);
        setDailyRegistrations(dailyData);
        setRecentRegistrations(recentRegistrationsList);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error("Erreur lors du chargement des analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [orgId, eventId]);

  const handleExportReport = async () => {
    if (!eventData) return;
    try {
      const csvContent = [
        ['RAPPORT ANALYTIQUE - ' + eventData.title],
        ['Généré le:', new Date().toLocaleDateString('fr-FR')],
        [''],
        ['=== STATISTIQUES ==='],
        ...registrationStats.map(stat => [stat.title + ':', stat.value]),
        [''],
        ['=== BILLETS ==='],
        ['Type', 'Vendus', 'Total', 'Revenus'],
        ...ticketTypeStats.map(t => [t.name, t.sold, t.total, t.revenue]),
        [''],
        ['=== INSCRIPTIONS RÉCENTES ==='],
        ['Nom', 'Email', 'Billet', 'Date', 'Statut'],
        ...recentRegistrations.map(r => [r.name, r.email, r.ticketType, r.registrationDate, r.status])
      ];
      const csvString = csvContent.map(row => Array.isArray(row) ? row.map(c => `"${c}"`).join(',') : `"${row}"`).join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `rapport-${eventData.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.csv`;
      link.click();
      toast.success("Rapport exporté !");
    } catch (error) {
      toast.error("Erreur lors de l'export");
    }
  };

  if (loading) {
    return <PageContainer><div className="flex justify-center items-center py-12">Chargement...</div></PageContainer>;
  }

  if (!eventData) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Aucun événement trouvé</h2>
          <p className="text-muted-foreground mb-6">Cette organisation n'a pas encore d'événements à analyser.</p>
          <Button asChild><Link to={`/dashboard/org/${orgId}/events/new`}>Créer un événement</Link></Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/dashboard/org/${orgId}/events`}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Retour
            </Link>
          </Button>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Analyse de l'événement</h1>
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-muted-foreground">{eventData.title}</p>
            <Badge variant="secondary">{eventData.status}</Badge>
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {eventData.date}
            </span>
          </div>
        </div>
      </div>

      {/* Stats — using StatsCard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {registrationStats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      {/* Capacity */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Taux de remplissage</CardTitle>
          <CardDescription>Nombre d'inscriptions par rapport à la capacité maximale</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{eventData.totalRegistrations} / {eventData.capacity} participants</span>
              <span className="text-sm text-muted-foreground">
                {eventData.capacity > 0 ? Math.round((eventData.totalRegistrations / eventData.capacity) * 100) : 0}%
              </span>
            </div>
            <Progress value={eventData.capacity > 0 ? (eventData.totalRegistrations / eventData.capacity) * 100 : 0} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Ticket Types & Daily */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Performance par type de billet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ticketTypeStats.map((ticket) => (
                <div key={ticket.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{ticket.name}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{ticket.sold}/{ticket.total} vendus</div>
                      <div className="text-xs text-muted-foreground">{ticket.revenue} générés</div>
                    </div>
                  </div>
                  <Progress value={ticket.total > 0 ? (ticket.sold / ticket.total) * 100 : 0} className="h-2" />
                </div>
              ))}
              {ticketTypeStats.length === 0 && <p className="text-sm text-muted-foreground">Aucun type de billet configuré</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inscriptions (7 derniers jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dailyRegistrations.map((day) => (
                <div key={day.date} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-10">{day.date}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{ width: `${Math.max(day.count * 10, day.count > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-6 text-right">{day.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent registrations */}
      <Card>
        <CardHeader>
          <CardTitle>Inscriptions récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentRegistrations.map((reg) => (
              <div key={reg.id} className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-gray-50 last:border-0">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{reg.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{reg.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-xs">{reg.ticketType}</Badge>
                  <span className="text-xs text-muted-foreground">{reg.registrationDate}</span>
                  <Badge variant="secondary" className={reg.status === 'Confirmé' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {reg.status}
                  </Badge>
                </div>
              </div>
            ))}
            {recentRegistrations.length === 0 && <p className="text-sm text-muted-foreground">Aucune inscription récente</p>}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default Analytics;
