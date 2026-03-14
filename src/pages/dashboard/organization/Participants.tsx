import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Download, Mail, Filter, Users, Calendar, CreditCard } from "lucide-react";
import { useParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Participants = () => {
  const { orgId } = useParams();

  // Mock data - sera remplacé par des données réelles
  const participants = [
    {
      id: 1,
      name: "Marie Dubois",
      email: "marie.dubois@email.com",
      phone: "06 12 34 56 78",
      event: "Tournoi Tennis Open 2025",
      ticketType: "Standard",
      registrationDate: "15 Jan 2025",
      paymentStatus: "Payé",
      amount: "25€",
      avatar: null
    },
    {
      id: 2,
      name: "Pierre Martin", 
      email: "pierre.martin@email.com",
      phone: "06 87 65 43 21",
      event: "Tournoi Tennis Open 2025",
      ticketType: "VIP",
      registrationDate: "16 Jan 2025", 
      paymentStatus: "Payé",
      amount: "50€",
      avatar: null
    },
    {
      id: 3,
      name: "Sophie Laurent",
      email: "sophie.laurent@email.com", 
      phone: "06 45 67 89 12",
      event: "Course à Pied Solidaire",
      ticketType: "Standard",
      registrationDate: "18 Jan 2025",
      paymentStatus: "En attente",
      amount: "15€",
      avatar: null
    },
    {
      id: 4,
      name: "Thomas Durand",
      email: "thomas.durand@email.com",
      phone: "06 23 45 67 89", 
      event: "Championnat Badminton",
      ticketType: "Standard",
      registrationDate: "20 Jan 2025",
      paymentStatus: "Payé",
      amount: "30€",
      avatar: null
    }
  ];

  const stats = [
    {
      title: "Total participants",
      value: "89",
      change: "+12 cette semaine",
      icon: Users,
    },
    {
      title: "Inscriptions ce mois",
      value: "34",
      change: "+8 vs mois dernier",
      icon: Calendar,
    },
    {
      title: "Revenus participants",
      value: "2,445€",
      change: "+340€ cette semaine",
      icon: CreditCard,
    },
  ];

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "Payé":
        return <Badge className="bg-green-100 text-green-800">Payé</Badge>;
      case "En attente":
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case "Remboursé":
        return <Badge className="bg-red-100 text-red-800">Remboursé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Participants</h1>
          <p className="text-muted-foreground">
            Gérez tous les participants de vos événements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Email groupé
          </Button>
          <Button variant="outline">
            
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher un participant..."
            className="pl-10"
          />
        </div>
        <Select defaultValue="all-events">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Événement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-events">Tous les événements</SelectItem>
            <SelectItem value="tennis-tournament">Tournoi Tennis Open 2025</SelectItem>
            <SelectItem value="running-race">Course à Pied Solidaire</SelectItem>
            <SelectItem value="badminton-championship">Championnat Badminton</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all-status">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut paiement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-status">Tous les statuts</SelectItem>
            <SelectItem value="paid">Payé</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="refunded">Remboursé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Participants Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Événement</TableHead>
                <TableHead>Type de billet</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead>Paiement</TableHead>
                <TableHead>Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={participant.avatar || ""} />
                        <AvatarFallback>
                          {participant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{participant.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{participant.email}</div>
                      <div className="text-xs text-muted-foreground">{participant.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{participant.event}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{participant.ticketType}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{participant.registrationDate}</span>
                  </TableCell>
                  <TableCell>
                    {getPaymentStatusBadge(participant.paymentStatus)}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{participant.amount}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {participants.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Aucun participant</h3>
          <p className="text-muted-foreground mb-6">
            Les participants à vos événements apparaîtront ici
          </p>
        </Card>
      )}
    </div>
  );
};

export default Participants;