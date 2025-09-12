import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useParams } from "react-router-dom";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Shield, 
  Trash2,
  Upload,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const { orgId } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - sera remplacé par des données réelles
  const [orgData, setOrgData] = useState({
    name: "SportClub Lyon",
    description: "Club de tennis associatif lyonnais organisant des tournois et stages pour tous niveaux.",
    website: "https://sportclub-lyon.fr",
    email: "contact@sportclub-lyon.fr",
    phone: "04 78 12 34 56",
    address: "123 Avenue des Sports\n69000 Lyon\nFrance",
    siretNumber: "12345678901234",
    billingEmail: "facturation@sportclub-lyon.fr",
    logo: null,
    stripeConnected: true,
    notifications: {
      newRegistration: true,
      paymentReceived: true,
      eventReminder: false,
      weeklyReport: true
    }
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setOrgData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setOrgData(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value }
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Ici on sauvegarderait les données dans la base
      toast.success("Paramètres sauvegardés avec succès !");
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrganization = () => {
    // Confirmation dialog et suppression
    toast.error("Fonctionnalité de suppression pas encore implémentée");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Paramètres de l'organisation</h1>
        <p className="text-muted-foreground">
          Gérez les informations et la configuration de votre organisation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Informations générales
              </CardTitle>
              <CardDescription>
                Informations publiques de votre organisation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'organisation</Label>
                <Input
                  id="name"
                  value={orgData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={orgData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  type="url"
                  value={orgData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo">Logo de l'organisation</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    {orgData.logo ? (
                      <img src={orgData.logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Building2 className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Changer le logo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations de contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Informations de contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email principal</Label>
                <Input
                  id="email"
                  type="email"
                  value={orgData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={orgData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  value={orgData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Informations légales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Informations légales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="siretNumber">Numéro SIRET</Label>
                <Input
                  id="siretNumber"
                  value={orgData.siretNumber}
                  onChange={(e) => handleInputChange("siretNumber", e.target.value)}
                  maxLength={14}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="billingEmail">Email de facturation</Label>
                <Input
                  id="billingEmail"
                  type="email"
                  value={orgData.billingEmail}
                  onChange={(e) => handleInputChange("billingEmail", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configurez les notifications que vous souhaitez recevoir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Nouvelles inscriptions</Label>
                  <p className="text-sm text-muted-foreground">
                    Être notifié quand quelqu'un s'inscrit à un événement
                  </p>
                </div>
                <Switch
                  checked={orgData.notifications.newRegistration}
                  onCheckedChange={(checked) => handleNotificationChange("newRegistration", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Paiements reçus</Label>
                  <p className="text-sm text-muted-foreground">
                    Être notifié lors de la réception d'un paiement
                  </p>
                </div>
                <Switch
                  checked={orgData.notifications.paymentReceived}
                  onCheckedChange={(checked) => handleNotificationChange("paymentReceived", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rappels d'événements</Label>
                  <p className="text-sm text-muted-foreground">
                    Rappels automatiques 24h avant vos événements
                  </p>
                </div>
                <Switch
                  checked={orgData.notifications.eventReminder}
                  onCheckedChange={(checked) => handleNotificationChange("eventReminder", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rapport hebdomadaire</Label>
                  <p className="text-sm text-muted-foreground">
                    Résumé hebdomadaire de vos performances
                  </p>
                </div>
                <Switch
                  checked={orgData.notifications.weeklyReport}
                  onCheckedChange={(checked) => handleNotificationChange("weeklyReport", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stripe Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Stripe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <Badge variant={orgData.stripeConnected ? "default" : "secondary"}>
                  {orgData.stripeConnected ? "Connecté" : "Non connecté"}
                </Badge>
              </div>
              
              {orgData.stripeConnected ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Votre compte Stripe est connecté et configuré.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Dashboard Stripe
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      Déconnecter
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Connectez Stripe pour recevoir des paiements.
                  </p>
                  <Button size="sm" className="w-full">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Connecter Stripe
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleSave} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Sauvegarde..." : "Sauvegarder les modifications"}
              </Button>
              
              <Separator />
              
              <div className="space-y-2">
                <Label className="text-destructive">Zone de danger</Label>
                <p className="text-sm text-muted-foreground">
                  Cette action est irréversible et supprimera définitivement votre organisation.
                </p>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDeleteOrganization}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer l'organisation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;