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
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'expired':
      case 'used':
      case 'invalid':
        return <XCircle className="h-12 w-12 text-red-500" />;
      default:
        return <XCircle className="h-12 w-12 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
      case 'validated':
        return 'bg-green-100 text-green-800 border-0';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800 border-0';
      case 'used':
      case 'invalid':
        return 'bg-red-100 text-red-800 border-0';
      default:
        return 'bg-gray-100 text-gray-800 border-0';
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
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100 px-4 py-4 shadow-sm">
          <div className="container mx-auto">
            <Logo size="md" />
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground font-medium">Validation du billet en cours...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100 px-4 py-4 shadow-sm">
          <div className="container mx-auto">
            <Logo size="md" />
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <Card className="w-full max-w-md rounded-xl border-red-100 shadow-sm">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-red-50 p-3 rounded-full w-fit mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-red-900">Erreur de validation</CardTitle>
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4 shadow-sm">
        <div className="container mx-auto">
          <Logo size="md" />
        </div>
      </header>

      <div className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className={`rounded-xl shadow-md border-2 ${['valid', 'validated'].includes(validationResult?.status) ? 'border-green-100' : 'border-red-100'
            }`}>
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-6">
                <div className={`p-4 rounded-full ${['valid', 'validated'].includes(validationResult?.status) ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                  {getStatusIcon(validationResult?.status)}
                </div>
              </div>
              <CardTitle className="text-2xl mb-2">Validation du billet</CardTitle>
              <div className="flex justify-center">
                <Badge className={`${getStatusColor(validationResult?.status)} text-base px-4 py-1 rounded-full`}>
                  {getStatusMessage(validationResult?.status)}
                </Badge>
              </div>
            </CardHeader>

            {validationResult?.ticket && (
              <CardContent className="space-y-6">
                {/* Informations de l'événement */}
                <div className="bg-gray-50/50 rounded-xl p-6 space-y-4 border border-gray-100">
                  <h3 className="font-bold text-xl flex items-start gap-3 text-gray-900">
                    <Calendar className="h-6 w-6 text-orange-500 mt-0.5" />
                    {validationResult.ticket.event?.title}
                  </h3>

                  <div className="space-y-2 pl-9">
                    {validationResult.ticket.event?.starts_at && (
                      <div className="flex items-center gap-2 text-gray-600">
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
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {validationResult.ticket.event.venue && validationResult.ticket.event.city
                          ? `${validationResult.ticket.event.venue}, ${validationResult.ticket.event.city}`
                          : validationResult.ticket.event.venue || validationResult.ticket.event.city}
                      </div>
                    )}
                  </div>
                </div>

                {/* Informations du participant */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <h4 className="font-semibold flex items-center gap-2 mb-2 text-gray-900">
                      <User className="h-4 w-4 text-orange-500" />
                      Titulaire du billet
                    </h4>
                    <p className="text-gray-600 font-medium">
                      {validationResult.ticket.user?.display_name || validationResult.ticket.user?.email || 'Non spécifié'}
                    </p>
                    {validationResult.ticket.user?.email && validationResult.ticket.user?.display_name && (
                      <p className="text-sm text-gray-400">{validationResult.ticket.user.email}</p>
                    )}
                  </div>

                  {/* Type de billet */}
                  {validationResult.ticket.ticket_type && (
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <h4 className="font-semibold flex items-center gap-2 mb-2 text-gray-900">
                        <Ticket className="h-4 w-4 text-orange-500" />
                        Type de billet
                      </h4>
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        {validationResult.ticket.ticket_type.name}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Détails de validation */}
                {validationResult.validatedAt && (
                  <div className="text-center pt-4 border-t border-gray-100">
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