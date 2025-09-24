import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Calendar, MapPin, User, Ticket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

const ValidateTicket = () => {
  const [searchParams] = useSearchParams();
  const [validationResult, setValidationResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateTicket = async () => {
      // Récupérer les paramètres depuis l'URL
      const registrationId = searchParams.get('registrationId');
      const eventId = searchParams.get('eventId');
      const userId = searchParams.get('userId');

      if (!registrationId || !eventId || !userId) {
        setError("Paramètres de validation manquants");
        setLoading(false);
        return;
      }

      try {
        // Appeler la fonction de validation
        const { data, error: validationError } = await supabase.functions.invoke('validate-ticket-qr', {
          body: {
            qrData: JSON.stringify({
              registrationId,
              eventId,
              userId,
              timestamp: new Date().toISOString()
            })
          }
        });

        if (validationError) {
          throw validationError;
        }

        setValidationResult(data);
      } catch (err: any) {
        setError(err.message || "Erreur lors de la validation");
      } finally {
        setLoading(false);
      }
    };

    validateTicket();
  }, [searchParams]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
      case 'validated':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'expired':
      case 'used':
      case 'invalid':
        return <XCircle className="h-8 w-8 text-red-600" />;
      default:
        return <XCircle className="h-8 w-8 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
      case 'validated':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      case 'used':
      case 'invalid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'valid':
        return 'Billet valide - Accès autorisé';
      case 'validated':
        return 'Billet déjà validé';
      case 'expired':
        return 'Billet expiré';
      case 'used':
        return 'Billet déjà utilisé';
      case 'invalid':
        return 'Billet invalide';
      default:
        return 'Statut inconnu';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background px-4 py-4">
          <Logo size="md" />
        </header>
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Validation du billet en cours...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background px-4 py-4">
          <Logo size="md" />
        </header>
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <XCircle className="h-12 w-12 text-red-600 mx-auto mb-2" />
              <CardTitle className="text-red-600">Erreur de validation</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background px-4 py-4">
        <Logo size="md" />
      </header>
      
      <div className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {getStatusIcon(validationResult?.status)}
              </div>
              <CardTitle>Validation du billet</CardTitle>
              <Badge className={getStatusColor(validationResult?.status)}>
                {getStatusMessage(validationResult?.status)}
              </Badge>
            </CardHeader>
            
            {validationResult?.ticket && (
              <CardContent className="space-y-6">
                {/* Informations de l'événement */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {validationResult.ticket.event?.title}
                  </h3>
                  
                  {validationResult.ticket.event?.starts_at && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(validationResult.ticket.event.starts_at).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                  
                  {(validationResult.ticket.event?.venue || validationResult.ticket.event?.city) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {validationResult.ticket.event.venue && validationResult.ticket.event.city
                        ? `${validationResult.ticket.event.venue}, ${validationResult.ticket.event.city}`
                        : validationResult.ticket.event.venue || validationResult.ticket.event.city}
                    </div>
                  )}
                </div>

                {/* Informations du participant */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    Titulaire du billet
                  </h4>
                  <p className="text-muted-foreground">
                    {validationResult.ticket.user?.display_name || validationResult.ticket.user?.email || 'Non spécifié'}
                  </p>
                  {validationResult.ticket.user?.email && validationResult.ticket.user?.display_name && (
                    <p className="text-sm text-muted-foreground">{validationResult.ticket.user.email}</p>
                  )}
                </div>

                {/* Type de billet */}
                {validationResult.ticket.ticket_type && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <Ticket className="h-4 w-4" />
                      Type de billet
                    </h4>
                    <Badge variant="outline">
                      {validationResult.ticket.ticket_type.name}
                    </Badge>
                  </div>
                )}

                {/* Détails de validation */}
                {validationResult.validatedAt && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Détails de validation</h4>
                    <p className="text-sm text-muted-foreground">
                      Validé le {new Date(validationResult.validatedAt).toLocaleDateString('fr-FR')} à{' '}
                      {new Date(validationResult.validatedAt).toLocaleTimeString('fr-FR')}
                    </p>
                    {validationResult.validatedBy && (
                      <p className="text-sm text-muted-foreground">
                        Par: {validationResult.validatedBy}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ValidateTicket;