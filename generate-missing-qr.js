// Script pour générer les QR codes manquants
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

async function generateQRCodes() {
  for (const registrationId of registrationIds) {
    try {
      console.log(`Generating QR code for registration: ${registrationId}`);
      
      const response = await fetch('https://wlxbydzshqijlfejqafp.supabase.co/functions/v1/generate-ticket-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_SERVICE_ROLE_KEY'
        },
        body: JSON.stringify({ registrationId })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ QR code generated for ${registrationId}`);
      } else {
        console.error(`❌ Failed for ${registrationId}:`, result.error);
      }
      
      // Attendre un peu entre chaque appel
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error for ${registrationId}:`, error.message);
    }
  }
}

// Pour utiliser ce script:
// 1. Remplacez YOUR_SERVICE_ROLE_KEY par votre vraie clé
// 2. Exécutez dans la console du navigateur ou avec Node.js

console.log("Script ready. Call generateQRCodes() to start.");