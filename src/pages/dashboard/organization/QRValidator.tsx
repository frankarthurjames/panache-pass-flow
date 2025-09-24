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

const QRValidator = () => {
  const { user } = useAuth();
  const [qrData, setQrData] = useState("");
  const [validationResult, setValidationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

      const response = await fetch(`https://wlxbydzshqijlfejqafp.supabase.co/functions/v1/validate-ticket-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ qrData })
      });

      const result = await response.json();
      
      if (result.success && result.valid) {
        setValidationResult(result);
        setScanHistory(prev => [result, ...prev.slice(0, 9)]); // Garder les 10 derniers
        toast.success(result.message);
      } else {
        setValidationResult({ valid: false, error: result.error });
        toast.error(result.error || "Billet invalide");
      }
    } catch (error) {
      console.error('Error validating QR:', error);
      toast.error("Erreur lors de la validation du billet");
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
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Caméra arrière pour mobile
      });
      setStream(mediaStream);
      setIsScanning(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      // Démarrer la détection de QR code
      startQRDetection();
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error("Impossible d'accéder à la caméra");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const startQRDetection = () => {
    const detectQR = () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      // Dessiner l'image de la vidéo sur le canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Obtenir les données de l'image
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Détection simple de QR code (version basique)
      // Dans une vraie application, vous utiliseriez une librairie comme jsQR
      // Pour cette démo, on simule une détection
      setTimeout(detectQR, 100);
    };

    detectQR();
  };

  const captureQR = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir en base64 pour traitement
    const imageData = canvas.toDataURL('image/png');
    
    // Ici vous pourriez envoyer l'image à un service de reconnaissance QR
    // Pour cette démo, on simule une détection
    toast.info("QR code détecté ! (Fonctionnalité de détection automatique en développement)");
  };

  // Nettoyer la caméra quand le composant se démonte
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
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
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <h1 className="text-3xl font-bold">Validation des billets</h1>
        <p className="text-muted-foreground">
          Scannez les QR codes des billets pour vérifier leur validité
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scanner un billet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="qr-input">Données du QR code</Label>
                  <Input
                    id="qr-input"
                    placeholder="Collez ici les données du QR code"
                    value={qrData}
                    onChange={(e) => setQrData(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={handleQRScan} 
                    disabled={loading || !qrData.trim()}
                    className="flex-1"
                  >
                    {loading ? "Validation..." : "Valider le billet"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Fichier
                  </Button>
                </div>

                {/* Section Caméra */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {!isScanning ? (
                      <Button
                        onClick={startCamera}
                        variant="outline"
                        className="flex-1"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Ouvrir la caméra
                      </Button>
                    ) : (
                      <Button
                        onClick={stopCamera}
                        variant="outline"
                        className="flex-1"
                      >
                        <CameraOff className="w-4 h-4 mr-2" />
                        Fermer la caméra
                      </Button>
                    )}
                    
                    {isScanning && (
                      <Button
                        onClick={captureQR}
                        variant="default"
                        className="flex-1"
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        Capturer QR
                      </Button>
                    )}
                  </div>

                  {/* Aperçu de la caméra */}
                  {isScanning && (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        className="w-full h-64 object-cover rounded-lg border"
                        autoPlay
                        playsInline
                        muted
                      />
                      <canvas
                        ref={canvasRef}
                        className="hidden"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg flex items-center justify-center">
                          <QrCode className="w-16 h-16 text-white opacity-50" />
                        </div>
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

          {/* Result */}
          {validationResult && (
            <Card className={validationResult.valid ? 'border-green-200' : 'border-red-200'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(validationResult.status || (validationResult.valid ? 'valid' : 'invalid'))}
                  Résultat de la validation
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
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{validationResult.ticket.event.title}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{validationResult.ticket.user.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{formatDate(validationResult.ticket.event.starts_at)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{validationResult.ticket.event.venue}, {validationResult.ticket.event.city}</span>
                        </div>
                        
                        <div className="pt-2 border-t">
                          <div className="text-sm text-muted-foreground">
                            Type: {validationResult.ticket.ticket_type.name} • 
                            Prix: {(validationResult.ticket.ticket_type.price_cents / 100).toFixed(2)}€
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {validationResult.ticket.id}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600">
                    <p className="font-medium">Billet invalide</p>
                    <p className="text-sm mt-1">{validationResult.error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* History Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historique des validations</CardTitle>
            </CardHeader>
            <CardContent>
              {scanHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Aucune validation effectuée
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {scanHistory.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status || (result.valid ? 'valid' : 'invalid'))}
                        <div>
                          <div className="font-medium text-sm">
                            {result.ticket?.event?.title || 'Billet inconnu'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {result.ticket?.user?.name || 'Utilisateur inconnu'}
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(result.status || (result.valid ? 'valid' : 'invalid'))}>
                        {result.status || (result.valid ? 'Valide' : 'Invalide')}
                      </Badge>
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