import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Settings = () => {
  const { orgId } = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [stripeStatus, setStripeStatus] = useState({
    connected: false,
    details_submitted: false,
    charges_enabled: false,
    business_profile: null
  });

  const [orgData, setOrgData] = useState({
    name: "",
    description: "",
    website: "",
    email: "",
    phone: "",
    address: "",
    siretNumber: "",
    billingEmail: "",
    logo: null,
    notifications: {
      newRegistration: true,
      paymentReceived: true,
      eventReminder: false,
      weeklyReport: true
    }
  });

  // Charger les données de l'organisation
  useEffect(() => {
    if (!orgId) return;
    
    const loadOrganizationData = async () => {
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', orgId)
          .single();

        if (error) throw error;

        setOrgData({
          name: data.name || "",
          description: "", // Ce champ n'existe pas dans la DB
          website: "", // Ce champ n'existe pas dans la DB
          email: data.billing_email || "",
          phone: "", // Ce champ n'existe pas dans la DB
          address: "", // Ce champ n'existe pas dans la DB
          siretNumber: data.siret_number || "",
          billingEmail: data.billing_email || "",
          logo: data.logo_url,
          notifications: {
            newRegistration: true,
            paymentReceived: true,
            eventReminder: false,
            weeklyReport: true
          }
        });

        // Vérifier le statut Stripe
        await checkStripeStatus();
      } catch (error) {
        console.error('Error loading organization:', error);
        toast.error("Erreur lors du chargement des données");
      }
    };

    loadOrganizationData();
  }, [orgId]);

  const checkStripeStatus = async () => {
    if (!user || !orgId) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('check-connect-status', {
        body: { organizationId: orgId }
      });

      if (error) throw error;

      setStripeStatus(data);
    } catch (error) {
      console.error('Error checking Stripe status:', error);
      setStripeStatus({ connected: false, details_submitted: false, charges_enabled: false, business_profile: null });
    }
  };

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
    if (!orgId) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: orgData.name,
          siret_number: orgData.siretNumber,
          billing_email: orgData.billingEmail,
          logo_url: orgData.logo
        })
        .eq('id', orgId);

      if (error) throw error;
      
      toast.success("Paramètres sauvegardés avec succès !");
    } catch (error) {
      console.error('Error saving organization:', error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    if (!user || !orgId) return;
    
    setLoadingStripe(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-connect-account', {
        body: {
          organizationId: orgId,
          organizationName: orgData.name,
          organizationEmail: orgData.billingEmail || user.email
        }
      });

      if (error) throw error;

      // Rediriger vers l'onboarding Stripe
      window.open(data.onboardingUrl, '_blank');
      toast.success("Redirection vers Stripe...");
    } catch (error) {
      console.error('Error connecting Stripe:', error);
      toast.error("Erreur lors de la connexion à Stripe");
    } finally {
      setLoadingStripe(false);
    }
  };

  const handleDisconnectStripe = async () => {
    if (!user || !orgId) return;
    
    setLoadingStripe(true);
    try {
      const { data, error } = await supabase.functions.invoke('disconnect-stripe', {
        body: { organizationId: orgId }
      });

      if (error) throw error;

      setStripeStatus({ connected: false, details_submitted: false, charges_enabled: false, business_profile: null });
      toast.success("Compte Stripe déconnecté avec succès");
    } catch (error) {
      console.error('Error disconnecting Stripe:', error);
      toast.error("Erreur lors de la déconnexion");
    } finally {
      setLoadingStripe(false);
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
                <Badge variant={stripeStatus.connected && stripeStatus.charges_enabled ? "default" : "secondary"}>
                  {stripeStatus.connected && stripeStatus.charges_enabled ? "Actif" : 
                   stripeStatus.connected ? "En cours de configuration" : "Non connecté"}
                </Badge>
              </div>
              
              {stripeStatus.connected ? (
                <div className="space-y-3">
                  {stripeStatus.charges_enabled ? (
                    <p className="text-sm text-muted-foreground">
                      Votre compte Stripe est connecté et peut recevoir des paiements.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Configuration en cours. Veuillez finaliser votre onboarding Stripe.
                    </p>
                  )}
                  
                  {stripeStatus.business_profile?.name && (
                    <p className="text-sm font-medium">
                      {stripeStatus.business_profile.name}
                    </p>
                  )}
                  
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open('https://dashboard.stripe.com/', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Dashboard Stripe
                    </Button>
                    {!stripeStatus.charges_enabled && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleConnectStripe}
                        disabled={loadingStripe}
                      >
                        Finaliser la configuration
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive"
                      onClick={handleDisconnectStripe}
                      disabled={loadingStripe}
                    >
                      {loadingStripe ? "Déconnexion..." : "Déconnecter"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Connectez Stripe pour recevoir des paiements pour vos événements.
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={handleConnectStripe}
                    disabled={loadingStripe || !orgData.name || !orgData.billingEmail}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {loadingStripe ? "Connexion..." : "Connecter Stripe"}
                  </Button>
                  {(!orgData.name || !orgData.billingEmail) && (
                    <p className="text-xs text-muted-foreground">
                      Veuillez d'abord renseigner le nom et l'email de facturation
                    </p>
                  )}
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