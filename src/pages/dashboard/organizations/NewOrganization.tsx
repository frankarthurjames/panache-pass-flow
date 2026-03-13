import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Building2, CreditCard, FileText, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const NewOrganization = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Informations générales
    name: "",
    slug: "",
    logoUrls: [] as string[], // Changed from logoUrl to logoUrls array
    // Step 2: Informations légales
    siretNumber: "",
    billingEmail: "",
    billingCountry: "FR",
    // Step 3: Configuration Stripe
    stripeAccountId: "",
    acceptStripeTerms: false,
    category: "company", // Default category
  });

  const steps = [
    {
      number: 1,
      title: "Informations générales",
      description: "Nom et description de votre organisation",
      icon: Building2
    },
    {
      number: 2,
      title: "Informations légales",
      description: "SIRET et informations de facturation",
      icon: FileText
    },
    {
      number: 3,
      title: "Paiements Stripe",
      description: "Configuration des paiements (optionnel)",
      icon: CreditCard
    },
    {
      number: 4,
      title: "Confirmation",
      description: "Vérification et création",
      icon: CheckCircle
    }
  ];

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Auto-generate slug when name changes
      ...(field === 'name' && typeof value === 'string' ? {
        slug: value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Remove multiple consecutive hyphens
          .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      } : {})
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedFromStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.name.trim() !== "" && formData.slug.trim() !== "";
      case 2:
        return formData.billingEmail.trim() !== "" &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.billingEmail); // Email validation
      case 3:
        return true; // Stripe est optionnel
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour créer une organisation");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the organization with only essential fields to avoid RLS issues
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: formData.name,
          slug: formData.slug,
          created_by_user_id: user.id,
          billing_email: formData.billingEmail || null,
          billing_country: formData.billingCountry || 'FR'
        })
        .select()
        .single();

      if (orgError) {
        console.error('Error creating organization:', orgError);
        toast.error(`Erreur lors de la création de l'organisation: ${orgError.message}`);
        return;
      }

      // Update with optional fields in a separate query to avoid RLS issues
      const updateFields: any = {};
      if (formData.logoUrls[0]) updateFields.logo_url = formData.logoUrls[0];
      if (formData.siretNumber) updateFields.siret_number = formData.siretNumber;
      if (formData.stripeAccountId) updateFields.stripe_account_id = formData.stripeAccountId;

      if (Object.keys(updateFields).length > 0) {
        const { error: updateError } = await supabase
          .from('organizations')
          .update(updateFields)
          .eq('id', organization.id);

        if (updateError) {
          console.warn('Warning: Could not update optional fields:', updateError);
          // Don't fail the whole process, just log the warning
        }
      }

      // Add the creator as owner in organization_members
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: organization.id,
          user_id: user.id,
          role: 'owner'
        });

      if (memberError) {
        console.error('Error adding organization member:', memberError);
        toast.error("Erreur lors de l'ajout du membre");
        return;
      }

      toast.success("Organisation créée avec succès !");
      navigate(`/dashboard/org/${organization.id}`);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("Erreur inattendue lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'organisation *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ex: Club Sportif de Lyon"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Identifiant unique (slug) *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                placeholder="club-sportif-lyon"
              />
              <p className="text-sm text-muted-foreground">
                Utilisé dans l'URL de vos pages publiques
              </p>
            </div>

            <ImageUpload
              value={formData.logoUrls}
              onChange={(images) => handleInputChange("logoUrls", images)}
              maxImages={1}
              label="Logo de l'organisation"
            />

            <div className="space-y-2">
              <Label>Type d'organisation</Label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'club', label: 'Club', icon: Building2 },
                  { id: 'company', label: 'Entreprise', icon: Building2 },
                ].map((type) => (
                  <div
                    key={type.id}
                    className={`cursor-pointer rounded-lg border-2 p-4 flex flex-col items-center gap-2 transition-all ${formData.category === type.id
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                      }`}
                    onClick={() => handleInputChange("category", type.id)}
                  >
                    <type.icon className={`w-6 h-6 ${formData.category === type.id ? "text-primary" : "text-muted-foreground"
                      }`} />
                    <span className={`text-sm font-medium ${formData.category === type.id ? "text-primary" : "text-muted-foreground"
                      }`}>
                      {type.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="siretNumber">Numéro SIRET</Label>
              <Input
                id="siretNumber"
                value={formData.siretNumber}
                onChange={(e) => handleInputChange("siretNumber", e.target.value)}
                placeholder="14 chiffres"
                maxLength={14}
              />
              <p className="text-sm text-muted-foreground">
                Obligatoire pour émettre des factures en France
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingEmail">Email de facturation *</Label>
              <Input
                id="billingEmail"
                type="email"
                value={formData.billingEmail}
                onChange={(e) => handleInputChange("billingEmail", e.target.value)}
                placeholder="facturation@votre-organisation.fr"
              />
            </div>

          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg border">
              <div className="flex items-start space-x-3">
                <CreditCard className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Configuration Stripe (Recommandée)
                  </h3>
                  <p className="text-sm text-blue-700 mb-4">
                    Connectez votre compte Stripe pour recevoir les paiements de vos événements.
                    Cette étape peut être faite plus tard depuis votre dashboard.
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Paiements sécurisés par carte bancaire</li>
                    <li>• Virements automatiques sur votre compte</li>
                    <li>• Gestion des remboursements</li>
                    <li>• Rapports financiers détaillés</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <Button variant="outline" size="lg">
                <CreditCard className="w-5 h-5 mr-2" />
                Connecter Stripe maintenant
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Ou ignorez cette étape et configurez Stripe plus tard
            </p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Prêt à créer votre organisation</h3>
              <p className="text-muted-foreground">
                Vérifiez les informations ci-dessous avant de finaliser
              </p>
            </div>

            <div className="space-y-4">
              {formData.logoUrls.length > 0 && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Logo :</span>
                  <img
                    src={formData.logoUrls[0]}
                    alt="Logo"
                    className="w-12 h-12 rounded object-cover"
                  />
                </div>
              )}
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Nom :</span>
                <span>{formData.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Type :</span>
                <Badge variant="outline" className="capitalize">
                  {formData.category === 'club' ? 'Club' : 'Entreprise'}
                </Badge>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Slug :</span>
                <span>{formData.slug}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Email de facturation :</span>
                <span>{formData.billingEmail}</span>
              </div>
              {formData.siretNumber && (
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">SIRET :</span>
                  <span>{formData.siretNumber}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Stripe :</span>
                <Badge variant={formData.stripeAccountId ? "default" : "secondary"}>
                  {formData.stripeAccountId ? "Configuré" : "À configurer"}
                </Badge>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Créer une organisation</h1>
          <p className="text-muted-foreground">
            Configurez votre organisation pour commencer à créer des événements
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Étape {currentStep} sur {steps.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round((currentStep / steps.length) * 100)}% terminé
          </span>
        </div>
        <Progress value={(currentStep / steps.length) * 100} className="h-2" />
      </div>

      {/* Steps Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`flex items-center space-x-3 p-3 rounded-lg border ${currentStep === step.number
              ? "border-primary bg-primary/5"
              : currentStep > step.number
                ? "border-green-200 bg-green-50"
                : "border-border bg-muted/30"
              }`}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === step.number
                ? "bg-primary text-primary-foreground"
                : currentStep > step.number
                  ? "bg-green-600 text-white"
                  : "bg-muted text-muted-foreground"
                }`}
            >
              {currentStep > step.number ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <step.icon className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{step.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Form Content */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between max-w-2xl mx-auto">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Précédent
        </Button>

        {currentStep < steps.length ? (
          <Button
            onClick={nextStep}
            disabled={!canProceedFromStep(currentStep)}
          >
            Suivant
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Création en cours..." : "Créer l'organisation"}
            <CheckCircle className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default NewOrganization;