import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

const Integrations = () => {
  const { orgId } = useParams();
  const [stripeStatus, setStripeStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStripeStatus = async () => {
      if (!orgId) return;
      try {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('stripe_account_id')
          .eq('id', orgId)
          .single();

        if (orgData?.stripe_account_id) {
          const { data: stripeData, error: stripeError } = await supabase.functions.invoke('check-connect-status', {
            body: { organizationId: orgId }
          });
          if (!stripeError && stripeData) setStripeStatus(stripeData);
        }
      } catch (error) {
        console.error('Error checking Stripe status:', error);
      } finally {
        setLoading(false);
      }
    };
    checkStripeStatus();
  }, [orgId]);

  const stripeConnected = stripeStatus?.connected && stripeStatus?.charges_enabled;

  const handleConnectStripe = async () => {
    if (!orgId) return;
    try {
      const { data, error } = await supabase.functions.invoke('create-connect-account', {
        body: { organizationId: orgId, organizationName: "Organisation", organizationEmail: "contact@example.com" }
      });
      if (error) throw error;
      window.open(data.onboardingUrl, '_blank');
      toast.success("Redirection vers Stripe...");
    } catch (error) {
      console.error('Error connecting Stripe:', error);
      toast.error("Erreur lors de la connexion à Stripe");
    }
  };

  const handleDisconnectStripe = async () => {
    if (!orgId) return;
    try {
      const { error } = await supabase.functions.invoke('disconnect-stripe', { body: { organizationId: orgId } });
      if (error) throw error;
      setStripeStatus({ connected: false, details_submitted: false, charges_enabled: false });
      toast.success("Compte Stripe déconnecté avec succès");
    } catch (error) {
      console.error('Error disconnecting Stripe:', error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Intégrations"
        description="Connectez vos outils préférés pour automatiser votre workflow"
      />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Paiement</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="transition-all duration-200 border-gray-100 shadow-sm hover:shadow-md rounded-xl hover:border-orange-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 flex-wrap">
                    <img src="/stripe.png" alt="Stripe" className="h-8 object-contain" />
                    {loading ? (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600">Vérification...</Badge>
                    ) : stripeConnected ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Stripe actif</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">Non connecté</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Gérez vous-même la comptabilité et les fonds de vos événements. Stripe est actuellement la seule solution disponible pour encaisser vos recettes en toute sécurité.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Fonctionnalités</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {["Paiements sécurisés", "Facturation automatique", "Rapports financiers"].map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {stripeConnected ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => window.open('https://dashboard.stripe.com/', '_blank')}>
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Dashboard Stripe
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleDisconnectStripe}>Déconnecter</Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" onClick={handleConnectStripe}>Connecter Stripe</Button>
                      <Button variant="ghost" size="sm" onClick={() => window.open('https://stripe.com/fr', '_blank')}>
                        <ExternalLink className="w-4 h-4 mr-1" />
                        En savoir plus
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default Integrations;
