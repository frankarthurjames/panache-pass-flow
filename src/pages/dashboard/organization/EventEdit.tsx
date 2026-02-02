import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/ImageUpload";
import {
  ArrowLeft,
  Save,
  Eye,
  Users,
  Calendar,
  CreditCard,
  Mail,
  Download,
  Search,
  Filter
} from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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

const EventEdit = () => {
  const { orgId, eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [participantStats, setParticipantStats] = useState<any[]>([]);

  // Charger l'événement et ses participants
  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId || !orgId) return;

      try {
        // Récupérer l'événement
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .eq('organization_id', orgId)
          .single();

        if (eventError) throw eventError;
        setEvent(eventData);

        // Récupérer les participants (inscriptions)
        const { data: registrations, error: regError } = await supabase
          .from('registrations')
          .select(`
            *,
            users:user_id (
              display_name,
              email,
              avatar_url
            ),
            ticket_types:ticket_type_id (
              name,
              price_cents
            ),
            orders:order_id (
              status,
              total_cents
            )
          `)
          .eq('event_id', eventId);

        if (regError) throw regError;

        const participantsData = registrations.map(reg => ({
          id: reg.id,
          name: reg.users?.display_name || 'Utilisateur inconnu',
          email: reg.users?.email || 'N/A',
          avatar: reg.users?.avatar_url,
          ticketType: reg.ticket_types?.name || 'N/A',
          registrationDate: new Date(reg.created_at).toLocaleDateString('fr-FR'),
          paymentStatus: reg.orders?.status === 'paid' ? 'Payé' : 'En attente',
          amount: reg.ticket_types?.price_cents ? `${(reg.ticket_types.price_cents / 100).toFixed(2)}€` : '0€',
          status: reg.status
        }));

        setParticipants(participantsData);

        // Calculer les statistiques des participants
        const totalParticipants = participantsData.length;
        const paidParticipants = participantsData.filter(p => p.paymentStatus === 'Payé').length;
        const totalRevenue = participantsData
          .filter(p => p.paymentStatus === 'Payé')
          .reduce((sum, p) => sum + parseFloat(p.amount.replace('€', '')), 0);

        setParticipantStats([
          {
            title: "Total participants",
            value: totalParticipants.toString(),
            change: `${eventData.capacity ? Math.round((totalParticipants / eventData.capacity) * 100) : 0}% de capacité`,
            icon: Users,
          },
          {
            title: "Participants payés",
            value: paidParticipants.toString(),
            change: `${totalParticipants > 0 ? Math.round((paidParticipants / totalParticipants) * 100) : 0}% du total`,
            icon: CreditCard,
          },
          {
            title: "Revenus participants",
            value: `${totalRevenue.toFixed(0)}€`,
            change: `Moyenne: ${totalParticipants > 0 ? (totalRevenue / totalParticipants).toFixed(2) : 0}€`,
            icon: CreditCard,
          },
        ]);

      } catch (error) {
        console.error('Error fetching event data:', error);
        toast.error("Erreur lors du chargement de l'événement");
        navigate(`/dashboard/org/${orgId}/events`);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId, orgId, navigate]);

  const uploadEventImages = async (images: string[]): Promise<string[]> => {
    if (!images || images.length === 0) return [];

    try {
      const bucket = 'event-images';
      const uploadedUrls: string[] = [];

      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        // Skip if already uploaded (URL format)
        if (image.startsWith('http')) {
          uploadedUrls.push(image);
          continue;
        }

        // Upload new image
        const fileName = `${eventId}-image-${i}-${Date.now()}.jpg`;

        // Convert base64 to blob if needed
        let fileToUpload: string | Blob = image;
        if (typeof image === 'string' && image.startsWith('data:')) {
          const response = await fetch(image);
          fileToUpload = await response.blob();
        }

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, fileToUpload);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error("Erreur lors de l'upload des images");
      return [];
    }
  };

  const isFinished = event?.ends_at && new Date(event.ends_at) < new Date();

  const handleSave = async () => {
    if (!event || !eventId || isFinished) return;

    setSaving(true);
    try {
      // Upload images if there are any
      let finalImages = event.images || [];
      if (Array.isArray(event.images)) {
        finalImages = await uploadEventImages(event.images);
      }

      const { error } = await supabase
        .from('events')
        .update({
          title: event.title,
          description: event.description,
          venue: event.venue,
          city: event.city,
          capacity: event.capacity,
          starts_at: event.starts_at,
          ends_at: event.ends_at,
          images: finalImages,
          status: event.status,
        })
        .eq('id', eventId);

      if (error) throw error;

      toast.success("Événement mis à jour avec succès!");
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "Payé":
        return <Badge className="bg-green-100 text-green-800 border-0">Payé</Badge>;
      case "En attente":
        return <Badge className="bg-yellow-100 text-yellow-800 border-0">En attente</Badge>;
      case "Remboursé":
        return <Badge className="bg-red-100 text-red-800 border-0">Remboursé</Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-0">{status}</Badge>;
    }
  };

  const handleExportParticipants = () => {
    // Créer le CSV
    const csvHeaders = ['Nom', 'Email', 'Type de billet', 'Prix', 'Status', 'Date d\'inscription'];
    const csvRows = participants.map(participant => [
      participant.name,
      participant.email,
      participant.ticketType,
      participant.amount,
      participant.paymentStatus,
      participant.registrationDate
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `participants-${event?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
    link.click();

    toast.success("Export terminé!");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!event) {
    return <div className="p-6 text-center">Événement non trouvé</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="rounded-full hover:bg-gray-100">
            <Link to={`/dashboard/org/${orgId}/events`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux événements
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
            <p className="text-muted-foreground">Modification de l'événement</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="rounded-full border-gray-200 hover:bg-gray-50">
            <Link to={`/events/${eventId}`}>
              <Eye className="w-4 h-4 mr-2" />
              Aperçu
            </Link>
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || isFinished}
            className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </div>

      {isFinished && (
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start gap-3">
          <Calendar className="w-5 h-5 text-orange-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-orange-900">Événement terminé</h3>
            <p className="text-sm text-orange-700 mt-1">
              Cet événement est terminé. Vous ne pouvez plus modifier ses informations, mais vous pouvez toujours consulter les statistiques et la liste des participants.
            </p>
          </div>
        </div>
      )}

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="bg-gray-100/50 p-1 rounded-full w-auto inline-flex">
          <TabsTrigger
            value="details"
            className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all"
          >
            Détails de l'événement
          </TabsTrigger>
          <TabsTrigger
            value="participants"
            className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all"
          >
            Participants ({participants.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card className="rounded-xl border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'événement</Label>
                  <Input
                    id="title"
                    value={event.title || ''}
                    onChange={(e) => setEvent({ ...event, title: e.target.value })}
                    className="rounded-xl border-gray-200 focus:ring-orange-500/20"
                    disabled={isFinished}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacité maximale</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={event.capacity || ''}
                    onChange={(e) => setEvent({ ...event, capacity: parseInt(e.target.value) || null })}
                    className="rounded-xl border-gray-200 focus:ring-orange-500/20"
                    disabled={isFinished}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="status">Statut de publication</Label>
                  <Select
                    value={event.status || 'draft'}
                    onValueChange={(value) => setEvent({ ...event, status: value })}
                    disabled={isFinished}
                  >
                    <SelectTrigger className="rounded-xl border-gray-200 focus:ring-orange-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="published">Publié</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {event.status === 'draft' ? 'Événement en brouillon, non visible publiquement' : 'Événement publié et visible par tous'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={event.description || ''}
                  onChange={(e) => setEvent({ ...event, description: e.target.value })}
                  className="rounded-xl border-gray-200 focus:ring-orange-500/20 min-h-[120px]"
                  disabled={isFinished}
                />
              </div>

              <div className="space-y-2">
                <Label>Images de l'événement</Label>
                <div className={isFinished ? "opacity-60 pointer-events-none" : ""}>
                  <ImageUpload
                    value={Array.isArray(event.images) ? event.images : []}
                    onChange={(images) => setEvent({ ...event, images })}
                    maxImages={6}
                    label="Ajoutez jusqu'à 6 images pour votre événement"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="venue">Lieu</Label>
                  <Input
                    id="venue"
                    value={event.venue || ''}
                    onChange={(e) => setEvent({ ...event, venue: e.target.value })}
                    className="rounded-xl border-gray-200 focus:ring-orange-500/20"
                    disabled={isFinished}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={event.city || ''}
                    onChange={(e) => setEvent({ ...event, city: e.target.value })}
                    className="rounded-xl border-gray-200 focus:ring-orange-500/20"
                    disabled={isFinished}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="starts_at">Date et heure de début</Label>
                  <Input
                    id="starts_at"
                    type="datetime-local"
                    value={event.starts_at ? new Date(event.starts_at).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEvent({ ...event, starts_at: e.target.value })}
                    className="rounded-xl border-gray-200 focus:ring-orange-500/20"
                    disabled={isFinished}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ends_at">Date et heure de fin</Label>
                  <Input
                    id="ends_at"
                    type="datetime-local"
                    value={event.ends_at ? new Date(event.ends_at).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEvent({ ...event, ends_at: e.target.value })}
                    className="rounded-xl border-gray-200 focus:ring-orange-500/20"
                    disabled={isFinished}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants" className="space-y-6">
          {/* Header des participants */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Participants à l'événement</h2>
              <p className="text-muted-foreground">
                Gérez les participants inscrits à cet événement
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-lg border-gray-200 hover:bg-gray-50">
                <Mail className="w-4 h-4 mr-2" />
                Email groupé
              </Button>
              <Button variant="outline" onClick={handleExportParticipants} className="rounded-lg border-gray-200 hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>

          {/* Stats des participants */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {participantStats.map((stat) => (
              <Card key={stat.title} className="rounded-xl border-gray-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <stat.icon className="h-4 w-4 text-orange-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1 text-gray-900">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filtres des participants */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher un participant..."
                className="pl-10 rounded-xl border-gray-200 focus:ring-orange-500/20"
              />
            </div>
            <Select defaultValue="all-status">
              <SelectTrigger className="w-[180px] rounded-xl border-gray-200 focus:ring-orange-500/20">
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

          {/* Table des participants */}
          <Card className="rounded-xl border-gray-100 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="hover:bg-transparent border-gray-100">
                    <TableHead className="font-medium text-gray-500">Participant</TableHead>
                    <TableHead className="font-medium text-gray-500">Email</TableHead>
                    <TableHead className="font-medium text-gray-500">Type de billet</TableHead>
                    <TableHead className="font-medium text-gray-500">Date d'inscription</TableHead>
                    <TableHead className="font-medium text-gray-500">Paiement</TableHead>
                    <TableHead className="font-medium text-gray-500">Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant) => (
                    <TableRow key={participant.id} className="hover:bg-gray-50/50 border-gray-100">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={participant.avatar || ""} />
                            <AvatarFallback className="bg-orange-100 text-orange-700 text-xs">
                              {participant.name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-gray-900">{participant.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{participant.email}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">{participant.ticketType}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{participant.registrationDate}</span>
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(participant.paymentStatus)}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-900">{participant.amount}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {participants.length === 0 && (
            <Card className="p-12 text-center rounded-xl border-gray-100 border-dashed shadow-none bg-gray-50/30">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Aucun participant</h3>
              <p className="text-muted-foreground mb-6">
                Les participants à cet événement apparaîtront ici une fois les inscriptions ouvertes
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventEdit;