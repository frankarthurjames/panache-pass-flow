import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const TestQR = () => {
  const [registrationId, setRegistrationId] = useState("380526ed-e825-4038-b663-b58f0bcae39e");
  const [loading, setLoading] = useState(false);

  const generateQRCode = async () => {
    if (!registrationId.trim()) {
      toast.error("Veuillez saisir un ID de registration");
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('https://wlxbydzshqijlfejqafp.supabase.co/functions/v1/generate-ticket-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ registrationId })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success("QR code généré avec succès!");
        console.log("Result:", result);
      } else {
        toast.error(`Erreur: ${result.error}`);
        console.error("Error:", result);
      }
      
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erreur lors de la génération du QR code");
    } finally {
      setLoading(false);
    }
  };

  const generateAllMissing = async () => {
    const registrationIds = [
      "380526ed-e825-4038-b663-b58f0bcae39e",
      "f8803dc5-76ec-42ea-8ba5-22fc3602e253",
      "9f2ff989-a5a1-4048-a5d8-ea7b6d7b73f8",
      "bfb33fa5-7245-40e0-af3b-cd3defe0b56c",
      "e6ba9a04-712b-4d57-a8d4-37fd75d59e02",
      "1af633a2-f068-4e2e-a2d6-e66d5db6c766",
      "52409d7a-38f1-41e1-a845-b494dabea88f",
      "c9f88442-8946-4dc8-83c9-fb55510d8263",
      "99633a95-62a2-4dac-8d3e-605732f2638b",
      "3295cf64-b2c9-4a8e-8c70-4e8c5806eb18"
    ];

    setLoading(true);
    let success = 0;
    let errors = 0;

    for (const id of registrationIds) {
      try {
        console.log(`Generating QR code for ${id}`);
        
        const response = await fetch('https://wlxbydzshqijlfejqafp.supabase.co/functions/v1/generate-ticket-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ registrationId: id })
        });

        const result = await response.json();
        
        if (result.success) {
          success++;
          console.log(`✅ QR code generated for ${id}`);
        } else {
          errors++;
          console.error(`❌ Failed for ${id}:`, result.error);
        }
        
        // Attendre 500ms entre chaque appel
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        errors++;
        console.error(`❌ Error for ${id}:`, error);
      }
    }

    setLoading(false);
    toast.success(`Terminé! ${success} succès, ${errors} erreurs`);
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Test génération QR codes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              value={registrationId}
              onChange={(e) => setRegistrationId(e.target.value)}
              placeholder="ID de registration"
            />
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={generateQRCode}
              disabled={loading}
            >
              {loading ? "Génération..." : "Générer QR Code"}
            </Button>
            
            <Button 
              onClick={generateAllMissing}
              disabled={loading}
              variant="secondary"
            >
              {loading ? "Génération..." : "Générer tous les QR manquants"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestQR;