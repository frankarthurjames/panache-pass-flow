import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useParams } from "react-router-dom";
import { ExternalLink, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Integrations = () => {
  const { orgId } = useParams();
  const [stripeStatus, setStripeStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Récupérer le statut Stripe
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

          if (!stripeError && stripeData) {
            setStripeStatus(stripeData);
          }
        }
      } catch (error) {
        console.error('Error checking Stripe status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkStripeStatus();
  }, [orgId]);

  const organization = {
    id: orgId,
    name: "SportClub Lyon",
    stripeConnected: stripeStatus?.connected && stripeStatus?.charges_enabled,
  };

  const integrations = [
    {
      id: "stripe",
      name: "Stripe",
      description: "Gérez vous-même la comptabilité et les fonds de vos événements. Stripe est actuellement la seule solution disponible pour encaisser vos recettes en toute sécurité.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      connected: organization.stripeConnected,
      category: "Paiement",
      available: true,
      features: ["Paiements sécurisés", "Facturation automatique", "Rapports financiers"]
    },

  ];

  const categories = [...new Set(integrations.map(i => i.category))];

  // Handlers pour Stripe
  const handleConnectStripe = async () => {
    if (!orgId) return;

    try {
      const { data, error } = await supabase.functions.invoke('create-connect-account', {
        body: {
          organizationId: orgId,
          organizationName: "Organisation",
          organizationEmail: "contact@example.com"
        }
      });

      if (error) throw error;

      // Rediriger vers l'onboarding Stripe
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
      const { error } = await supabase.functions.invoke('disconnect-stripe', {
        body: { organizationId: orgId }
      });

      if (error) throw error;

      setStripeStatus({ connected: false, details_submitted: false, charges_enabled: false });
      toast.success("Compte Stripe déconnecté avec succès");
    } catch (error) {
      console.error('Error disconnecting Stripe:', error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Intégrations</h1>
        <p className="text-muted-foreground">
          Connectez vos outils préférés pour automatiser votre workflow
        </p>
      </div>

      {/* Categories */}
      {categories.map((category) => (
        <div key={category} className="space-y-4">
          <h2 className="text-xl font-semibold">{category}</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {integrations
              .filter(integration => integration.category === category)
              .map((integration) => (
                <Card key={integration.id} className={`transition-all duration-200 border-gray-100 shadow-sm hover:shadow-md rounded-xl ${integration.available ? 'hover:border-orange-200' : 'opacity-60'}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">

                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {integration.id === 'stripe' ? (
                              <img src="/stripe.png" alt="Stripe" className="h-8 object-contain" />
                            ) : (
                              integration.name
                            )}
                            {!integration.available && (
                              <Badge variant="secondary" className="bg-muted text-muted-foreground">
                                Bientôt disponible
                              </Badge>
                            )}
                            {integration.id === 'stripe' ? (
                              loading ? (
                                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                  Vérification...
                                </Badge>
                              ) : integration.connected ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  Stripe actif
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                  Non connecté
                                </Badge>
                              )
                            ) : integration.connected && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Connecté
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {integration.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Fonctionnalités</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {integration.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-2">
                        {integration.id === 'stripe' ? (
                          integration.connected ? (
                            <>
                              <Button variant="outline" size="sm" onClick={() => window.open('https://dashboard.stripe.com/', '_blank')}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Dashboard Stripe
                              </Button>
                              <Button variant="ghost" size="sm" onClick={handleDisconnectStripe}>
                                Déconnecter
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" onClick={handleConnectStripe}>
                                Connecter Stripe
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => window.open('https://stripe.com/fr', '_blank')}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                En savoir plus
                              </Button>
                            </>
                          )
                        ) : (
                          integration.connected ? (
                            <>
                              <Button variant="outline" size="sm" disabled={!integration.available}>
                                Configurer
                              </Button>
                              <Button variant="ghost" size="sm" disabled={!integration.available}>
                                Déconnecter
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" disabled={!integration.available}>
                                {integration.available ? 'Connecter' : 'Bientôt disponible'}
                              </Button>
                              <Button variant="ghost" size="sm" disabled={!integration.available}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                En savoir plus
                              </Button>
                            </>
                          )
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}


    </div>
  );
};

export default Integrations;