import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Politique de Confidentialité"
        description="Consultez la politique de confidentialité de Panache pour savoir comment nous traitons vos données."
      />
      <Navbar />

      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <h1 className="text-4xl font-bold mb-8 text-foreground">
              Politique de Confidentialité
            </h1>

            <p className="text-muted-foreground mb-6">
              Dernière mise à jour : 12 janvier 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Collecte des données</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nous collectons les informations suivantes :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Données d'identification :</strong> nom, prénom, email, téléphone</li>
                <li><strong>Données de connexion :</strong> adresse IP, cookies, logs de navigation</li>
                <li><strong>Données de paiement :</strong> traitées par Stripe (nous ne stockons pas les données bancaires)</li>
                <li><strong>Données d'utilisation :</strong> interactions avec la plateforme</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Finalités du traitement</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Vos données sont utilisées pour :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Gérer votre compte utilisateur</li>
                <li>Traiter vos inscriptions aux événements</li>
                <li>Faciliter les paiements</li>
                <li>Améliorer nos services</li>
                <li>Vous envoyer des communications importantes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Base légale</h2>
              <p className="text-muted-foreground leading-relaxed">
                Le traitement de vos données repose sur :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
                <li>Votre consentement</li>
                <li>L'exécution du contrat de service</li>
                <li>Nos intérêts légitimes</li>
                <li>Le respect d'obligations légales</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Partage des données</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nous partageons vos données uniquement avec :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Stripe :</strong> pour le traitement des paiements</li>
                <li><strong>Organisateurs d'événements :</strong> pour gérer vos inscriptions</li>
                <li><strong>Prestataires techniques :</strong> hébergement et maintenance</li>
                <li><strong>Autorités compétentes :</strong> si requis par la loi</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Durée de conservation</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous conservons vos données :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
                <li><strong>Compte actif :</strong> pendant toute la durée d'utilisation</li>
                <li><strong>Compte inactif :</strong> 3 ans après la dernière connexion</li>
                <li><strong>Données de paiement :</strong> selon les obligations comptables (10 ans)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Vos droits</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Droit d'accès :</strong> consulter vos données</li>
                <li><strong>Droit de rectification :</strong> corriger vos données</li>
                <li><strong>Droit d'effacement :</strong> supprimer vos données</li>
                <li><strong>Droit de portabilité :</strong> récupérer vos données</li>
                <li><strong>Droit d'opposition :</strong> refuser certains traitements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Sécurité</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger
                vos données contre tout accès non autorisé, modification, divulgation ou destruction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                Pour exercer vos droits ou pour toute question :
                <a href="mailto:privacy@panache.fr" className="text-primary hover:underline ml-1">
                  privacy@panache.fr
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;