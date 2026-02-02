import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, CheckCircle, XCircle, Clock, AlertCircle, User, Calendar, MapPin, Ticket, Camera, CameraOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import jsQR from "jsqr";

const QRValidator = () => {
  const { user } = useAuth();
  const [qrData, setQrData] = useState("");
  const [validationResult, setValidationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [detectionActive, setDetectionActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fonction pour charger l'historique depuis la BDD
  const loadScanHistory = async () => {
    try {
      // D'abord récupérer les validations récentes
      const { data: validations, error: validationsError } = await supabase
        .from('ticket_validations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (validationsError || !validations) {
        console.error('Error loading validations:', validationsError);
        return;
      }

      // Récupérer les registration_ids uniques
      const registrationIds = validations.map(v => v.registration_id);

      if (registrationIds.length === 0) {
        setScanHistory([]);
        return;
      }

      // Récupérer les détails des registrations
      const { data: registrations, error: registrationsError } = await supabase
        .from('registrations')
        .select(`
          id,
          events (
            id,
            title,
            starts_at,
            ends_at,
            venue,
            city,
            organizations (
              name
            )
          ),
          ticket_types (
            name,
            price_cents
          ),
          users (
            display_name,
            email
          ),
          orders (
            status
          )
        `)
        .in('id', registrationIds);

      if (registrationsError) {
        console.error('Error loading registrations:', registrationsError);
        return;
      }

      // Créer un map des registrations par ID pour faciliter la recherche
      const registrationMap = new Map(
        registrations?.map(reg => [reg.id, reg]) || []
      );

      // Formater l'historique en combinant les données
      const formattedHistory = validations.map(validation => {
        const registration = registrationMap.get(validation.registration_id);

        return {
          valid: ['validated', 'valid', 'active'].includes(validation.status),
          status: validation.status,
          message: `Billet validé avec succès`,
          validated_at: validation.validated_at,
          validated_by: validation.validated_by,
          registration_id: validation.registration_id,
          ticket: registration ? {
            id: registration.id,
            event: {
              title: registration.events?.title || 'Événement inconnu',
              starts_at: registration.events?.starts_at,
              ends_at: registration.events?.ends_at,
              venue: registration.events?.venue,
              city: registration.events?.city,
              organization: registration.events?.organizations?.name
            },
            ticket_type: {
              name: registration.ticket_types?.name || 'Type inconnu',
              price_cents: registration.ticket_types?.price_cents || 0
            },
            user: {
              name: registration.users?.display_name || registration.users?.email || 'Utilisateur inconnu',
              email: registration.users?.email
            },
            order: {
              status: registration.orders?.status
            }
          } : {
            event: { title: 'Événement inconnu' },
            user: { name: 'Utilisateur inconnu' },
            ticket_type: { name: 'Type inconnu' }
          }
        };
      });

      setScanHistory(formattedHistory);
    } catch (error) {
      console.error('Error loading scan history:', error);
    }
  };

  // Charger l'historique au démarrage
  useEffect(() => {
    loadScanHistory();
  }, []);

  const handleQRScan = async () => {
    if (!qrData.trim()) {
      toast.error("Veuillez saisir ou scanner un QR code");
      return;
    }

    try {
      setLoading(true);
      setValidationResult(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session expirée, veuillez vous reconnecter");
        return;
      }

      const { data: result, error: functionError } = await supabase.functions.invoke('validate-ticket-qr', {
        body: { qrData }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Erreur lors de la validation');
      }

      if (result.success && result.valid) {
        setValidationResult(result);
        setScanHistory(prev => [result, ...prev.slice(0, 9)]);
        toast.success(result.message);
        // Effacer automatiquement pour enchaîner les scans
        setQrData("");
        // Recharger l'historique depuis la BDD
        loadScanHistory();
      } else {
        // Améliorer l'affichage des erreurs de billet déjà validé
        const isAlreadyValidated = result.error && result.error.includes("déjà validé");
        setValidationResult({
          valid: false,
          error: result.error,
          alreadyValidated: isAlreadyValidated,
          validatedAt: isAlreadyValidated ? result.error.match(/le (\d{2}\/\d{2}\/\d{4} à \d{2}:\d{2}:\d{2})/)?.[1] : null
        });

        if (isAlreadyValidated) {
          toast.error(`⚠️ Billet déjà validé`, {
            description: result.error,
            duration: 5000,
          });
        } else {
          toast.error(result.error || "Billet invalide");
        }
        // Effacer également en cas d'erreur pour enchaîner
        setQrData("");
      }
    } catch (error) {
      console.error('Error validating QR:', error);
      const errorMessage = error.message || "Erreur lors de la validation du billet";

      // Vérifier si c'est un billet déjà validé
      const isAlreadyValidated = errorMessage.includes("déjà validé");
      if (isAlreadyValidated) {
        setValidationResult({
          valid: false,
          error: errorMessage,
          alreadyValidated: true,
          validatedAt: errorMessage.match(/le (\d{2}\/\d{2}\/\d{4} à \d{2}:\d{2}:\d{2})/)?.[1]
        });
        toast.error("⚠️ Billet déjà validé", {
          description: errorMessage,
          duration: 5000,
        });
      } else {
        toast.error(errorMessage);
      }
      // Effacer en cas d'erreur
      setQrData("");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setQrData(text);
    };
    reader.readAsText(file);
  };

  const startCamera = async () => {
    try {
      console.log("Démarrage de la caméra...");

      // Vérifier si getUserMedia est supporté
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Votre navigateur ne supporte pas l'accès à la caméra");
        return;
      }

      // Arrêter la caméra existante si elle existe
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      // Configuration plus permissive de la caméra
      let constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          facingMode: { ideal: 'environment' }
        }
      };

      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        // Fallback sans contrainte de facingMode pour desktop
        console.log("Tentative avec contraintes simplifiées...");
        constraints = {
          video: {
            width: { ideal: 640, min: 320 },
            height: { ideal: 480, min: 240 }
          }
        };
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      }

      console.log("Stream obtenu:", mediaStream);

      setStream(mediaStream);
      setIsScanning(true);

      // Attendre que le composant soit mis à jour
      setTimeout(() => {
        if (videoRef.current && mediaStream.active) {
          console.log("Configuration de l'élément vidéo...");
          videoRef.current.srcObject = mediaStream;

          // Événements de la vidéo
          videoRef.current.onloadedmetadata = () => {
            console.log("Métadonnées chargées, dimensions:", videoRef.current?.videoWidth, "x", videoRef.current?.videoHeight);
            // S'assurer que les dimensions sont disponibles
            if (videoRef.current && videoRef.current.videoWidth > 0) {
              setDetectionActive(true);
              startQRDetection();
            }
          };

          videoRef.current.oncanplay = () => {
            console.log("Vidéo prête à être lue");
          };

          videoRef.current.onplay = () => {
            console.log("Vidéo en cours de lecture");
          };

          videoRef.current.onerror = (error) => {
            console.error("Erreur vidéo:", error);
            toast.error("Erreur lors de l'affichage de la caméra");
          };

          // Forcer le démarrage avec gestion d'erreur améliorée
          const playVideo = async () => {
            try {
              videoRef.current!.muted = true;
              videoRef.current!.playsInline = true;
              await videoRef.current!.play();
              console.log("Vidéo démarrée avec succès");
            } catch (playError) {
              console.error("Erreur play:", playError);
              toast.error("Impossible de démarrer la vidéo. Vérifiez les permissions.");
            }
          };
          playVideo();
        } else {
          console.error("Référence vidéo non disponible ou stream inactif");
          toast.error("Erreur lors de l'initialisation de la caméra");
        }
      }, 200);

    } catch (error) {
      console.error('Error accessing camera:', error);
      if (error.name === 'NotAllowedError') {
        toast.error("Permission de caméra refusée. Veuillez autoriser l'accès à la caméra.");
      } else if (error.name === 'NotFoundError') {
        toast.error("Aucune caméra trouvée sur cet appareil.");
      } else if (error.name === 'NotReadableError') {
        toast.error("La caméra est utilisée par une autre application.");
      } else {
        toast.error(`Erreur caméra: ${error.message}`);
      }
    }
  };

  const stopCamera = () => {
    console.log("Arrêt de la caméra...");
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
    setDetectionActive(false);
  };

  const startQRDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    console.log("Démarrage de la détection automatique QR...");

    const detectQR = () => {
      if (!videoRef.current || !canvasRef.current || !isScanning || !detectionActive) {
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context || video.readyState !== video.HAVE_ENOUGH_DATA || video.videoWidth === 0) {
        return;
      }

      try {
        // S'assurer que les dimensions sont valides
        const width = video.videoWidth;
        const height = video.videoHeight;

        if (width === 0 || height === 0) {
          return;
        }

        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);

        const imageData = context.getImageData(0, 0, width, height);

        // Détection QR code avec jsQR - paramètres optimisés
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert"
        });

        if (code && code.data) {
          console.log("QR Code détecté automatiquement:", code.data);
          setQrData(code.data);
          stopCamera();
          toast.success("QR Code détecté ! Validation en cours...");

          // Auto-valider le QR code détecté et effacer pour enchaîner
          setTimeout(() => {
            handleQRScan();
          }, 500);
          return;
        }
      } catch (error) {
        console.error("Erreur lors de la détection QR automatique:", error);
      }
    };

    // Démarrer la détection avec un intervalle optimisé
    detectionIntervalRef.current = setInterval(detectQR, 200);
    console.log("Détection automatique démarrée");
  };

  const captureQR = () => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error("Caméra non disponible");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      toast.error("Erreur de contexte canvas");
      return;
    }

    // Vérifier que la vidéo est prête
    if (video.readyState !== video.HAVE_ENOUGH_DATA || video.videoWidth === 0) {
      toast.error("Vidéo non prête, veuillez attendre");
      return;
    }

    try {
      console.log("Capture de l'image pour détection QR...");

      // Capturer l'image de la vidéo
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Obtenir les données de l'image pour la détection QR
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      console.log("Recherche de QR code dans l'image capturée...");

      // Détection QR code avec jsQR
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert"
      });

      if (code && code.data) {
        console.log("QR Code détecté dans l'image:", code.data);
        setQrData(code.data);
        stopCamera();
        toast.success("QR Code détecté ! Validation en cours...");

        // Auto-valider le QR code détecté et effacer pour enchaîner
        setTimeout(() => {
          handleQRScan();
        }, 500);
      } else {
        console.log("Aucun QR code détecté dans l'image");
        toast.error("Aucun QR code détecté dans l'image. Essayez de repositionner le QR code.");
      }
    } catch (error) {
      console.error("Erreur lors de la capture et détection:", error);
      toast.error("Erreur lors de la détection du QR code");
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [stream]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
      case 'active':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'upcoming':
        return <Clock className="w-6 h-6 text-blue-500" />;
      case 'expired':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
      case 'active':
        return 'bg-green-100 text-green-800 border-0';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-0';
      case 'expired':
        return 'bg-red-100 text-red-800 border-0';
      default:
        return 'bg-gray-100 text-gray-800 border-0';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Validation des billets</h1>
        <p className="text-muted-foreground">
          Scannez les QR codes des billets pour vérifier leur validité
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="rounded-xl border-gray-100 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-orange-500" />
                Scanner un billet
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="qr-input">Données du QR code</Label>
                  <Input
                    id="qr-input"
                    placeholder="Collez ici les données du QR code"
                    value={qrData}
                    onChange={(e) => setQrData(e.target.value)}
                    className="rounded-xl border-gray-200 focus:ring-orange-500/20"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleQRScan}
                    disabled={loading || !qrData.trim()}
                    className="flex-1 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-md transition-all"
                  >
                    {loading ? "Validation..." : "Valider le billet"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full border-gray-200 hover:bg-gray-50"
                  >
                    Fichier
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    {!isScanning ? (
                      <Button
                        onClick={startCamera}
                        variant="outline"
                        className="flex-1 rounded-xl border-dashed border-2 border-gray-200 hover:border-orange-200 hover:bg-orange-50 h-32 flex flex-col gap-2"
                      >
                        <Camera className="w-8 h-8 text-gray-400" />
                        <span>Ouvrir la caméra</span>
                      </Button>
                    ) : (
                      <Button
                        onClick={stopCamera}
                        variant="outline"
                        className="flex-1 rounded-full border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        <CameraOff className="w-4 h-4 mr-2" />
                        Fermer la caméra
                      </Button>
                    )}

                    {isScanning && (
                      <Button
                        onClick={captureQR}
                        variant="default"
                        className="flex-1 rounded-full"
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        Capturer QR
                      </Button>
                    )}
                  </div>

                  {isScanning && (
                    <div className="relative rounded-xl overflow-hidden shadow-lg">
                      <video
                        ref={videoRef}
                        className="w-full h-64 object-cover bg-gray-900"
                        autoPlay
                        playsInline
                        muted
                        style={{
                          minHeight: '256px',
                        }}
                      />
                      <canvas
                        ref={canvasRef}
                        className="hidden"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-48 h-48 border-2 border-white/80 border-dashed rounded-lg flex items-center justify-center">
                          <QrCode className="w-16 h-16 text-white/50" />
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md text-sm backdrop-blur-sm">
                        {detectionActive ? "🔍 Recherche de QR code..." : "⏳ Initialisation..."}
                      </div>
                      {detectionActive && (
                        <div className="absolute top-2 right-2 bg-green-500/90 text-white px-2 py-1 rounded-md text-xs animate-pulse backdrop-blur-sm">
                          Détection active
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs text-center backdrop-blur-sm">
                        Positionnez le QR code dans le cadre pour une détection automatique
                      </div>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {validationResult && (
            <Card className={`rounded-xl shadow-md border-2 ${validationResult.valid ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30'}`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3">
                  {getStatusIcon(validationResult.status || (validationResult.valid ? 'valid' : 'invalid'))}
                  <span className={validationResult.valid ? 'text-green-800' : 'text-red-800'}>
                    {validationResult.valid ? 'Billet Valide' : 'Billet Invalide'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {validationResult.valid ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(validationResult.status)}>
                        {validationResult.message}
                      </Badge>
                    </div>

                    {validationResult.ticket && (
                      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-3">
                        <div className="flex items-center gap-2">
                          <Ticket className="w-4 h-4 text-orange-500" />
                          <span className="font-bold text-gray-900">{validationResult.ticket.event.title}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{validationResult.ticket.user.name}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{formatDate(validationResult.ticket.event.starts_at)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{validationResult.ticket.event.venue}, {validationResult.ticket.event.city}</span>
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            {validationResult.ticket.ticket_type.name}
                          </div>
                          <div className="font-bold text-gray-900">
                            {(validationResult.ticket.ticket_type.price_cents / 100).toFixed(2)}€
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-4 border border-red-100 shadow-sm">
                    <p className="font-medium text-red-700 text-lg mb-1">
                      {validationResult.alreadyValidated ? "Billet déjà validé" : "Validation impossible"}
                    </p>
                    <p className="text-gray-600">{validationResult.error}</p>
                    {validationResult.alreadyValidated && validationResult.validatedAt && (
                      <div className="mt-3 pt-3 border-t border-red-50 flex items-center gap-2 text-sm text-red-600">
                        <Clock className="w-4 h-4" />
                        Validé le {validationResult.validatedAt}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="rounded-xl border-gray-100 shadow-sm h-full flex flex-col">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between">
              <CardTitle>Historique des validations</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadScanHistory}
                className="text-muted-foreground hover:text-gray-900"
              >
                <Clock className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {scanHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Clock className="w-12 h-12 mb-4 text-gray-200" />
                  <p>Aucune validation effectuée</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {scanHistory.map((result, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.status || (result.valid ? 'valid' : 'invalid'))}
                          <div>
                            <div className="font-medium text-gray-900">
                              {result.ticket?.event?.title || 'Billet inconnu'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {result.ticket?.user?.name || 'Utilisateur inconnu'}
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(result.status || (result.valid ? 'valid' : 'invalid'))}>
                          {result.status || (result.valid ? 'Valide' : 'Invalide')}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-400 pl-9">
                        <span>{result.ticket?.ticket_type?.name}</span>
                        <span>{result.validated_at ? new Date(result.validated_at).toLocaleTimeString() : 'À l\'instant'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QRValidator;
