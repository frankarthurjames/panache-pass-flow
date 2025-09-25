import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Mail, Phone, Globe, Shield } from "lucide-react";

const Mentions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Mentions légales
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Informations légales concernant le site Panache et la société éditrice
            </p>
          </div>

          <div className="space-y-8">
            {/* Éditeur du site */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Éditeur du site
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Dénomination sociale</h3>
                  <p className="text-muted-foreground">Panache SAS</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Forme juridique</h3>
                  <p className="text-muted-foreground">Société par Actions Simplifiée</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Capital social</h3>
                  <p className="text-muted-foreground">100 000 €</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Numéro SIRET</h3>
                  <p className="text-muted-foreground">123 456 789 00012</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Code APE</h3>
                  <p className="text-muted-foreground">6202A - Conseil en systèmes et logiciels informatiques</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Numéro TVA intracommunautaire</h3>
                  <p className="text-muted-foreground">FR12345678901</p>
                </div>
              </CardContent>
            </Card>

            {/* Siège social */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Siège social et contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Adresse du siège social</h3>
                  <address className="text-muted-foreground not-italic">
                    123 Avenue des Sports<br />
                    75008 Paris<br />
                    France
                  </address>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Téléphone</h3>
                  <p className="text-muted-foreground">+33 1 23 45 67 89</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <a href="mailto:legal@panache.fr" className="text-primary hover:underline">
                    legal@panache.fr
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Directeur de publication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Directeur de publication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Le directeur de la publication est Monsieur Jean Dupont, 
                  Président de la société Panache SAS.
                </p>
              </CardContent>
            </Card>

            {/* Hébergement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Hébergement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Site web</h3>
                  <p className="text-muted-foreground">
                    Ce site est hébergé par :<br />
                    <strong>Vercel Inc.</strong><br />
                    340 S Lemon Ave #4133<br />
                    Walnut, CA 91789<br />
                    États-Unis
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Base de données et services backend</h3>
                  <p className="text-muted-foreground">
                    Les services backend sont hébergés par :<br />
                    <strong>Supabase Inc.</strong><br />
                    970 Toa Payoh North #07-04<br />
                    Singapore 318992
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Propriété intellectuelle */}
            <Card>
              <CardHeader>
                <CardTitle>Propriété intellectuelle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  L'ensemble de ce site relève de la législation française et internationale 
                  sur le droit d'auteur et la propriété intellectuelle. Tous les droits de 
                  reproduction sont réservés, y compris pour les documents téléchargeables 
                  et les représentations iconographiques et photographiques.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  La reproduction de tout ou partie de ce site sur un support électronique 
                  quel qu'il soit est formellement interdite sauf autorisation expresse 
                  du directeur de la publication.
                </p>
              </CardContent>
            </Card>

            {/* Données personnelles */}
            <Card>
              <CardHeader>
                <CardTitle>Protection des données personnelles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Conformément à la loi "Informatique et Libertés" du 6 janvier 1978 modifiée 
                  et au Règlement Général sur la Protection des Données (RGPD), vous disposez 
                  d'un droit d'accès, de rectification, de suppression et d'opposition aux 
                  données personnelles vous concernant.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Pour exercer ces droits, contactez-nous à : 
                  <a href="mailto:privacy@panache.fr" className="text-primary hover:underline ml-1">
                    privacy@panache.fr
                  </a>
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Pour plus d'informations, consultez notre 
                  <a href="/legal/privacy" className="text-primary hover:underline ml-1">
                    politique de confidentialité
                  </a>.
                </p>
              </CardContent>
            </Card>

            {/* Responsabilité */}
            <Card>
              <CardHeader>
                <CardTitle>Limitation de responsabilité</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  L'éditeur s'efforce d'assurer au mieux de ses possibilités l'exactitude 
                  et la mise à jour des informations diffusées sur ce site. Toutefois, 
                  il ne peut garantir l'exactitude, la précision ou l'exhaustivité des 
                  informations mises à disposition sur ce site.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  En conséquence, l'éditeur décline toute responsabilité pour toute 
                  imprécision, inexactitude ou omission portant sur des informations 
                  disponibles sur ce site.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Pour toute question relative aux présentes mentions légales, 
                  vous pouvez nous contacter :
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                  <li>
                    Par email : 
                    <a href="mailto:legal@panache.fr" className="text-primary hover:underline ml-1">
                      legal@panache.fr
                    </a>
                  </li>
                  <li>
                    Par téléphone : +33 1 23 45 67 89
                  </li>
                  <li>
                    Par courrier : Panache SAS, 123 Avenue des Sports, 75008 Paris
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Dernière mise à jour */}
          <div className="text-center mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour : 25 septembre 2025
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Mentions;