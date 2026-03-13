import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Conditions Générales d'Utilisation"
        description="Consultez les conditions générales d'utilisation de la plateforme Panache."
      />
      <Navbar />

      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <h1 className="text-4xl font-bold mb-8 text-foreground">
              Conditions Générales d'Utilisation
            </h1>

            <p className="text-muted-foreground mb-6">
              Dernière mise à jour : 12 janvier 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Objet</h2>
              <p className="text-muted-foreground leading-relaxed">
                Les présentes conditions générales d'utilisation (CGU) régissent l'utilisation de la plateforme Panache,
                service de création et de gestion d'événements sportifs en ligne.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Définitions</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Plateforme :</strong> Le site web et l'application Panache</li>
                <li><strong>Utilisateur :</strong> Toute personne utilisant la plateforme</li>
                <li><strong>Organisateur :</strong> Utilisateur créant des événements</li>
                <li><strong>Participant :</strong> Utilisateur s'inscrivant à des événements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Accès au service</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                L'accès à Panache est gratuit pour la consultation. La création d'un compte est nécessaire pour :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Organiser des événements</li>
                <li>S'inscrire aux événements</li>
                <li>Accéder aux fonctionnalités avancées</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Obligations de l'utilisateur</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                En utilisant Panache, vous vous engagez à :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Fournir des informations exactes et à jour</li>
                <li>Respecter les lois et règlements en vigueur</li>
                <li>Ne pas porter atteinte aux droits des tiers</li>
                <li>Utiliser la plateforme de manière responsable</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Paiements et remboursements</h2>
              <p className="text-muted-foreground leading-relaxed">
                Les paiements sont traités de manière sécurisée via Stripe. Les conditions de remboursement
                dépendent des politiques définies par chaque organisateur d'événement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Responsabilité</h2>
              <p className="text-muted-foreground leading-relaxed">
                Panache agit en tant qu'intermédiaire technique. La responsabilité du contenu et de l'organisation
                des événements incombe entièrement aux organisateurs.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Modification des CGU</h2>
              <p className="text-muted-foreground leading-relaxed">
                Panache se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs
                seront informés des modifications par email ou via la plateforme.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                Pour toute question concernant ces conditions, contactez-nous à :
                <a href="mailto:legal@panache.fr" className="text-primary hover:underline ml-1">
                  legal@panache.fr
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

export default Terms;