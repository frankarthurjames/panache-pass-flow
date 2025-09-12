import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useParams } from "react-router-dom";
import { ExternalLink, CreditCard, Mail, Webhook, BarChart3 } from "lucide-react";

const Integrations = () => {
  const { orgId } = useParams();

  // Mock data - sera remplacé par des données réelles
  const organization = {
    id: orgId,
    name: "SportClub Lyon",
    stripeConnected: false,
  };

  const integrations = [
    {
      id: "stripe",
      name: "Stripe",
      description: "Gérez les paiements et la comptabilité de vos événements",
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      connected: organization.stripeConnected,
      category: "Paiement",
      features: ["Paiements sécurisés", "Facturation automatique", "Rapports financiers"]
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      description: "Envoyez des emails et newsletters à vos participants",
      icon: Mail,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      connected: false,
      category: "Marketing",
      features: ["Campagnes email", "Segmentation", "Automatisation"]
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Automatisez vos tâches avec plus de 5000 applications",
      icon: Webhook,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      connected: false,
      category: "Automatisation",
      features: ["Webhooks", "Automatisation", "Synchronisation"]
    },
    {
      id: "google-analytics",
      name: "Google Analytics",
      description: "Analysez le trafic et les conversions de vos événements",
      icon: BarChart3,
      color: "text-green-600",
      bgColor: "bg-green-50",
      connected: false,
      category: "Analytics",
      features: ["Suivi des conversions", "Rapports détaillés", "Audiences"]
    }
  ];

  const categories = [...new Set(integrations.map(i => i.category))];

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
                <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${integration.bgColor}`}>
                          <integration.icon className={`w-8 h-8 ${integration.color}`} />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {integration.name}
                            {integration.connected && (
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
                      <Switch checked={integration.connected} />
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
                        {integration.connected ? (
                          <>
                            <Button variant="outline" size="sm">
                              Configurer
                            </Button>
                            <Button variant="ghost" size="sm">
                              Déconnecter
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm">
                              Connecter
                            </Button>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              En savoir plus
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}

      {/* Stripe Setup Guide */}
      {!organization.stripeConnected && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Configuration Stripe recommandée
            </CardTitle>
            <CardDescription>
              Connectez Stripe pour commencer à recevoir des paiements pour vos événements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Étapes de configuration :</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Créez un compte Stripe (si vous n'en avez pas)</li>
                    <li>Vérifiez votre identité sur Stripe</li>
                    <li>Connectez votre compte bancaire</li>
                    <li>Configurez vos préférences de paiement</li>
                  </ol>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Avantages :</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Paiements sécurisés par carte</li>
                    <li>• Virements automatiques</li>
                    <li>• Facturation et comptabilité</li>
                    <li>• Support client 24/7</li>
                  </ul>
                </div>
              </div>
              <Button className="w-full sm:w-auto">
                <CreditCard className="w-4 h-4 mr-2" />
                Connecter Stripe maintenant
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Integrations;