import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Mail, Download, Users, Calendar, CreditCard } from "lucide-react";
import { useParams } from "react-router-dom";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DataTable } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";

const Participants = () => {
  const { orgId } = useParams();

  // Mock data
  const participants = [
    { id: "1", name: "Marie Dubois", email: "marie.dubois@email.com", phone: "06 12 34 56 78", event: "Tournoi Tennis Open 2025", ticketType: "Standard", registrationDate: "15 Jan 2025", paymentStatus: "Payé", amount: "25€", avatar: null },
    { id: "2", name: "Pierre Martin", email: "pierre.martin@email.com", phone: "06 87 65 43 21", event: "Tournoi Tennis Open 2025", ticketType: "VIP", registrationDate: "16 Jan 2025", paymentStatus: "Payé", amount: "50€", avatar: null },
    { id: "3", name: "Sophie Laurent", email: "sophie.laurent@email.com", phone: "06 45 67 89 12", event: "Course à Pied Solidaire", ticketType: "Standard", registrationDate: "18 Jan 2025", paymentStatus: "En attente", amount: "15€", avatar: null },
    { id: "4", name: "Thomas Durand", email: "thomas.durand@email.com", phone: "06 23 45 67 89", event: "Championnat Badminton", ticketType: "Standard", registrationDate: "20 Jan 2025", paymentStatus: "Payé", amount: "30€", avatar: null },
  ];

  const stats = [
    { title: "Total participants", value: "89", icon: <Users className="h-5 w-5" />, trend: { value: "+12", label: "cette semaine", isPositive: true } },
    { title: "Inscriptions ce mois", value: "34", icon: <Calendar className="h-5 w-5" />, trend: { value: "+8", label: "vs mois dernier", isPositive: true } },
    { title: "Revenus participants", value: "2,445€", icon: <CreditCard className="h-5 w-5" />, trend: { value: "+340€", label: "cette semaine", isPositive: true } },
  ];

  const getPaymentBadge = (status: string) => {
    if (status === "Payé") return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
    if (status === "En attente") return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
    return <Badge variant="secondary">{status}</Badge>;
  };

  const columns = [
    {
      header: "Participant", accessorKey: "name" as const,
      cell: (p: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={p.avatar || ""} />
            <AvatarFallback>{p.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{p.name}</span>
        </div>
      )
    },
    { header: "Email", accessorKey: "email" as const, hideOnMobile: true },
    { header: "Événement", accessorKey: "event" as const, hideOnMobile: true },
    { header: "Billet", accessorKey: "ticketType" as const, cell: (p: any) => <Badge variant="outline">{p.ticketType}</Badge> },
    { header: "Paiement", accessorKey: "paymentStatus" as const, cell: (p: any) => getPaymentBadge(p.paymentStatus) },
    { header: "Montant", accessorKey: "amount" as const, cell: (p: any) => <span className="font-medium">{p.amount}</span> },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Participants"
        description="Gérez tous les participants de vos événements"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Mail className="w-4 h-4 mr-2" />Email groupé</Button>
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exporter</Button>
          </div>
        }
      />

      {/* Stats — using StatsCard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => <StatsCard key={i} {...stat} />)}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input placeholder="Rechercher un participant..." className="pl-10" />
        </div>
        <Select defaultValue="all-events">
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Événement" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all-events">Tous les événements</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all-status">
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all-status">Tous</SelectItem>
            <SelectItem value="paid">Payé</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table — using DataTable */}
      <DashboardCard title="Liste des participants" contentClassName="p-0">
        <DataTable
          data={participants}
          columns={columns}
          keyExtractor={(p) => p.id}
          emptyMessage="Aucun participant"
          className="border-0 shadow-none"
        />
      </DashboardCard>

      {participants.length === 0 && (
        <EmptyState
          icon={<Users className="w-16 h-16" />}
          title="Aucun participant"
          description="Les participants à vos événements apparaîtront ici"
        />
      )}
    </PageContainer>
  );
};

export default Participants;
