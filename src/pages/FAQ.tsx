import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "Comment créer mon premier événement ?",
      answer: "Créez un compte, accédez à votre dashboard, puis cliquez sur 'Créer un événement'. Suivez les étapes pour définir les détails de votre événement, les types de billets et les informations pratiques."
    },
    {
      question: "Quels sont les frais de la plateforme ?",
      answer: "Panache prélève une commission de 3% + 0,30€ par transaction. Cette commission couvre les frais de paiement et l'utilisation de la plateforme."
    },
    {
      question: "Comment puis-je recevoir mes paiements ?",
      answer: "Les paiements sont traités via Stripe et virés automatiquement sur votre compte bancaire selon la fréquence que vous avez configurée (quotidienne, hebdomadaire ou mensuelle)."
    },
    {
      question: "Puis-je personnaliser mes billets ?",
      answer: "Oui, vous pouvez personnaliser vos billets avec votre logo, couleurs et informations spécifiques. Chaque billet contient un QR code unique pour la validation à l'entrée."
    },
    {
      question: "Comment gérer les remboursements ?",
      answer: "Vous définissez votre politique de remboursement lors de la création de l'événement. Les demandes de remboursement peuvent être traitées directement depuis votre dashboard."
    },
    {
      question: "La plateforme supporte-t-elle les événements gratuits ?",
      answer: "Absolument ! Vous pouvez créer des événements entièrement gratuits. Dans ce cas, aucune commission n'est prélevée."
    },
    {
      question: "Comment vérifier l'identité des participants ?",
      answer: "Chaque billet contient un QR code unique. Utilisez notre application mobile pour scanner les codes à l'entrée et vérifier la validité des billets."
    },
    {
      question: "Puis-je limiter le nombre de billets par personne ?",
      answer: "Oui, vous pouvez définir une limite maximale de billets par commande pour chaque type de billet de votre événement."
    },
    {
      question: "Comment promouvoir mon événement ?",
      answer: "Votre événement apparaît automatiquement dans notre catalogue public. Vous pouvez aussi partager le lien direct de votre événement sur vos réseaux sociaux."
    },
    {
      question: "Que se passe-t-il si j'annule mon événement ?",
      answer: "En cas d'annulation, vous devez rembourser les participants selon votre politique de remboursement. Nous vous accompagnons dans cette démarche depuis votre dashboard."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Questions Fréquentes"
        description="Besoin d'aide ? Consultez notre FAQ pour tout savoir sur l'utilisation de Panache."
      />
      <Navbar />

      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              Questions Fréquentes
            </h1>
            <p className="text-xl text-muted-foreground">
              Trouvez rapidement les réponses à vos questions sur Panache
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6">
                <AccordionTrigger className="text-left text-foreground hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center mt-12 p-8 bg-muted/30 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Vous ne trouvez pas votre réponse ?
            </h2>
            <p className="text-muted-foreground mb-6">
              Notre équipe support est là pour vous aider
            </p>
            <a
              href="mailto:support@panache.fr"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Contactez le support
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQ;