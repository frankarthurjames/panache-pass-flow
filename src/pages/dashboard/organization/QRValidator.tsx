import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, CheckCircle, XCircle, Clock, AlertCircle, User, Calendar, MapPin, Ticket, Camera, CameraOff, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import QrScanner from "qr-scanner";
import { cn } from "@/lib/utils";

const QRValidator = () => {
  const { user } = useAuth();
  const [qrData, setQrData] = useState("");
  const [validationResult, setValidationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [detectionActive, setDetectionActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  // Fonction pour charger l'historique depuis la BDD
  const loadScanHistory = async () => {
    try {
      const { data: validations, error: validationsError } = await supabase
        .from('ticket_validations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (validationsError || !validations || validations.length === 0) {
        setScanHistory([]);
        return;
      }

      const registrationIds = validations.map(v => v.registration_id);

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

      const registrationMap = new Map(
        registrations?.map(reg => [reg.id, reg]) || []
      );

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
          } : null
        };
      });

      setScanHistory(formattedHistory);
    } catch (error) {
      console.error('Error loading scan history:', error);
    }
  };

  useEffect(() => {
    loadScanHistory();
  }, []);

  const handleQRScan = async (scannedData?: string) => {
    const dataToValidate = scannedData || qrData;
    if (!dataToValidate.trim()) {
      toast.error("Veuillez saisir ou scanner un QR code");
      return;
    }

    try {
      setLoading(true);
      setValidationResult(null);

      const { data: result, error: functionError } = await supabase.functions.invoke('validate-ticket-qr', {
        body: { qrData: dataToValidate }
      });

      if (functionError) throw new Error(functionError.message);

      if (result.success && result.valid) {
        setValidationResult(result);
        toast.success(result.message);
        setQrData("");
        loadScanHistory();
      } else {
        const isAlreadyValidated = result.error && result.error.includes("déjà validé");
        setValidationResult({
          valid: false,
          error: result.error,
          alreadyValidated: isAlreadyValidated,
          validatedAt: isAlreadyValidated ? result.error.match(/le (\d{2}\/\d{2}\/\d{4} à \d{2}:\d{2}:\d{2})/)?.[1] : null
        });
        toast.error(isAlreadyValidated ? "⚠️ Billet déjà validé" : result.error || "Billet invalide");
        setQrData("");
      }
    } catch (error: any) {
      console.error('Error validating QR:', error);
      toast.error(error.message || "Erreur lors de la validation du billet");
      setQrData("");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true });
      if (result && result.data) {
        setQrData(result.data);
        toast.success("QR Code détecté dans l'image !");
        handleQRScan(result.data);
      } else {
        toast.error("Aucun QR code trouvé dans cette image.");
      }
    } catch (err) {
      console.error("Scan error:", err);
      toast.error("Impossible de lire le QR code depuis ce fichier.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startCamera = async () => {
    if (!videoRef.current) return;

    setIsScanning(true);
    setDetectionActive(true);

    try {
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          if (result && result.data) {
            setQrData(result.data);
            stopCamera();
            toast.success("QR Code détecté ! Validation...");
            handleQRScan(result.data);
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 5
        }
      );

      await qrScannerRef.current.start();
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Erreur d'accès à la caméra");
      setIsScanning(false);
      setDetectionActive(false);
    }
  };

  const stopCamera = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
    setDetectionActive(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

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
          <Card className="rounded-xl border-gray-100 shadow-sm overflow-hidden">
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
                    onClick={() => handleQRScan()}
                    disabled={loading || !qrData.trim()}
                    className="flex-1 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-md transition-all h-11"
                  >
                    {loading ? "Validation..." : "Valider manuellement"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full border-gray-200 hover:bg-gray-50 h-11 px-6"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Importer Image
                  </Button>
                </div>

                <div className="space-y-3">
                  {!isScanning ? (
                    <Button
                      onClick={startCamera}
                      variant="outline"
                      className="w-full rounded-2xl border-dashed border-2 border-gray-200 hover:border-orange-200 hover:bg-orange-50 h-48 flex flex-col gap-3 transition-all group"
                    >
                      <div className="p-4 rounded-full bg-gray-50 group-hover:bg-orange-100 transition-colors">
                        <Camera className="w-10 h-10 text-gray-400 group-hover:text-orange-500" />
                      </div>
                      <div className="text-center">
                        <span className="block font-bold text-gray-700">Activer la caméra</span>
                        <span className="text-xs text-gray-400 font-medium tracking-tight">Détection automatique ultra-fluide</span>
                      </div>
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video border-4 border-white">
                        <video
                          ref={videoRef}
                          className="w-full h-full object-cover"
                          autoPlay
                          playsInline
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-48 h-48 border-2 border-orange-500/50 border-dashed rounded-3xl flex items-center justify-center animate-pulse">
                            <div className="w-full h-[2px] bg-orange-500/30 absolute shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
                          </div>
                        </div>
                        <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          SCANNER ACTIF
                        </div>
                        <Button
                          onClick={stopCamera}
                          variant="destructive"
                          size="sm"
                          className="absolute top-4 right-4 rounded-full h-8 w-8 p-0"
                        >
                          <CameraOff className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-center text-sm text-muted-foreground font-medium">
                        Positionnez le QR code face à la caméra pour une détection instantanée
                      </p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {validationResult && (
            <Card className={`rounded-2xl shadow-xl border-2 overflow-hidden transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 ${validationResult.valid ? 'border-green-100 bg-green-50/20' : 'border-red-100 bg-red-50/20'
              }`}>
              <CardHeader className={`${validationResult.valid ? 'bg-green-100/50' : 'bg-red-100/50'} border-b border-white`}>
                <CardTitle className="flex items-center gap-3">
                  {getStatusIcon(validationResult.status || (validationResult.valid ? 'valid' : 'invalid'))}
                  <span className={`font-black uppercase tracking-tight ${validationResult.valid ? 'text-green-800' : 'text-red-800'}`}>
                    {validationResult.valid ? 'Billet Valide' : 'Billet Invalide'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {validationResult.valid ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(validationResult.status)} rounded-full px-4 py-1 font-bold`}>
                        {validationResult.message}
                      </Badge>
                    </div>

                    {validationResult.ticket && (
                      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-orange-50">
                            <Ticket className="w-5 h-5 text-orange-500" />
                          </div>
                          <span className="font-black text-gray-900 text-lg uppercase leading-tight">{validationResult.ticket.event.title}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-full bg-gray-50">
                              <User className="w-4 h-4 text-gray-400" />
                            </div>
                            <span className="text-gray-700 font-bold truncate">{validationResult.ticket.user.name}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-full bg-gray-50">
                              <Calendar className="w-4 h-4 text-gray-400" />
                            </div>
                            <span className="text-gray-600 font-medium text-sm truncate">{new Date(validationResult.ticket.event.starts_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-dashed border-gray-100 flex justify-between items-center">
                          <div className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            {validationResult.ticket.ticket_type.name}
                          </div>
                          <div className="font-black text-2xl text-orange-500">
                            {(validationResult.ticket.ticket_type.price_cents / 100).toFixed(2)}€
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-6 border border-red-100 shadow-sm">
                    <p className="font-black text-red-700 text-xl mb-2 uppercase tracking-tight">
                      {validationResult.alreadyValidated ? "Déjà Validé" : "Erreur"}
                    </p>
                    <p className="text-gray-600 font-medium leading-relaxed">{validationResult.error}</p>
                    {validationResult.alreadyValidated && validationResult.validatedAt && (
                      <div className="mt-4 pt-4 border-t border-red-50 flex items-center gap-3 text-sm text-red-600 font-bold">
                        <Clock className="w-4 h-4" />
                        VALIDÉ LE {validationResult.validatedAt}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-gray-100 shadow-sm h-full flex flex-col overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-100 flex flex-row items-center justify-between p-6">
              <CardTitle className="text-lg font-black uppercase tracking-tight">Historique des validations</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadScanHistory}
                className="text-muted-foreground hover:text-orange-500 rounded-full"
              >
                <Clock className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {scanHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 text-muted-foreground p-12">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <QrCode className="w-10 h-10 text-gray-100" />
                  </div>
                  <p className="font-bold text-gray-300 uppercase tracking-widest text-center">Aucune validation effectuée</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 max-h-[700px] overflow-y-auto">
                  {scanHistory.map((result, index) => (
                    <div key={index} className="p-5 hover:bg-orange-50/30 transition-all group border-l-4 border-transparent hover:border-orange-500">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-4">
                          <div className={cn("p-2 rounded-xl", result.valid ? "bg-green-50" : "bg-red-50")}>
                            {getStatusIcon(result.status || (result.valid ? 'valid' : 'invalid'))}
                          </div>
                          <div>
                            <div className="font-black text-gray-900 uppercase tracking-tight text-sm leading-none mb-1">
                              {result.ticket?.event?.title || 'Billet inconnu'}
                            </div>
                            <div className="text-xs text-gray-400 font-bold uppercase tracking-tighter">
                              {result.ticket?.user?.name || 'Utilisateur inconnu'}
                            </div>
                          </div>
                        </div>
                        <Badge className={cn("rounded-full px-3 py-0.5 text-[10px] font-black uppercase", getStatusColor(result.status || (result.valid ? 'valid' : 'invalid')))}>
                          {result.status || (result.valid ? 'Valide' : 'Invalide')}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-gray-300 pl-14 font-black tracking-widest uppercase">
                        <span>{result.ticket?.ticket_type?.name}</span>
                        <span>{result.validated_at ? new Date(result.validated_at).toLocaleTimeString() : 'Maintenant'}</span>
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
