import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Ticket, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  Plus,
  Trash2
} from "lucide-react";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Informations générales
    title: "",
    description: "",
    category: "",
    images: [] as string[], // Multiple images instead of single coverImageUrl
    // Step 2: Date et lieu
    startsAt: null as Date | null,
    endsAt: null as Date | null,
    venue: "",
    city: "",
    capacity: "",
    // Step 3: Types de billets
    ticketTypes: [
      {
        id: 1,
        name: "Standard",
        priceCents: "",
        quantity: "",
        maxPerOrder: 10,
        currency: "EUR"
      }
    ],
    // Step 4: Configuration
    status: "draft" as "draft" | "published"
  });

  const steps = [
    {
      number: 1,
      title: "Informations générales",
      description: "Titre, description et catégorie",
      icon: CalendarIcon
    },
    {
      number: 2,
      title: "Date et lieu", 
      description: "Quand et où se déroule l'événement",
      icon: MapPin
    },
    {
      number: 3,
      title: "Types de billets",
      description: "Prix et types de billets disponibles",
      icon: Ticket
    },
    {
      number: 4,
      title: "Finalisation",
      description: "Vérification et publication",
      icon: CheckCircle
    }
  ];

  const categories = [
    "Tennis", "Football", "Basketball", "Volleyball", "Badminton", 
    "Course à pied", "Cyclisme", "Natation", "Arts martiaux", "Fitness", "Autre"
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTicketTypeChange = (index: number, field: string, value: string | number) => {
    const updatedTypes = [...formData.ticketTypes];
    updatedTypes[index] = { ...updatedTypes[index], [field]: value };
    setFormData(prev => ({ ...prev, ticketTypes: updatedTypes }));
  };

  const addTicketType = () => {
    const newType = {
      id: Date.now(),
      name: "",
      priceCents: "",
      quantity: "",
      maxPerOrder: 10,
      currency: "EUR"
    };
    setFormData(prev => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, newType]
    }));
  };

  const removeTicketType = (index: number) => {
    if (formData.ticketTypes.length > 1) {
      const updatedTypes = formData.ticketTypes.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, ticketTypes: updatedTypes }));
    }
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
        return formData.title.trim() !== "" && formData.category !== "";
      case 2:
        return formData.startsAt && 
               formData.venue.trim() !== "" && 
               formData.city.trim() !== "" &&
               (!formData.endsAt || formData.endsAt >= formData.startsAt); // End date must be after start date
      case 3:
        return formData.ticketTypes.every(t => 
          t.name.trim() !== "" && 
          t.quantity.trim() !== "" && 
          parseInt(t.quantity) > 0 && // Quantity must be positive
          (!t.priceCents || parseInt(t.priceCents) >= 0) // Price must be positive if set
        );
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!user || !orgId) {
      toast.error("Informations manquantes pour créer l'événement");
      return;
    }

    if (!formData.startsAt) {
      toast.error("La date de début est obligatoire");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create the event
      const eventData = {
        title: formData.title,
        description: formData.description || null,
        starts_at: formData.startsAt.toISOString(),
        ends_at: formData.endsAt ? formData.endsAt.toISOString() : formData.startsAt.toISOString(),
        venue: formData.venue,
        city: formData.city,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        organization_id: orgId,
        cover_image_url: formData.images.length > 0 ? formData.images[0] : null,
        status: formData.status
      };

      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();

      if (eventError) {
        console.error('Error creating event:', eventError);
        toast.error("Erreur lors de la création de l'événement");
        return;
      }

      // Create ticket types
      if (formData.ticketTypes.length > 0) {
        const ticketTypesData = formData.ticketTypes.map(ticket => ({
          event_id: event.id,
          name: ticket.name,
          price_cents: ticket.priceCents ? parseInt(ticket.priceCents) : 0,
          quantity: parseInt(ticket.quantity),
          max_per_order: ticket.maxPerOrder,
          currency: ticket.currency
        }));

        const { error: ticketError } = await supabase
          .from('ticket_types')
          .insert(ticketTypesData);

        if (ticketError) {
          console.error('Error creating ticket types:', ticketError);
          toast.error("Erreur lors de la création des types de billets");
          return;
        }
      }

      toast.success("Événement créé avec succès !");
      navigate(`/dashboard/org/${orgId}/events`);
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
              <Label htmlFor="title">Titre de l'événement *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Ex: Tournoi de Tennis Open 2025"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Décrivez votre événement, les règles, les prix..."
                rows={6}
              />
            </div>
            
            <ImageUpload
              value={formData.images}
              onChange={(images) => handleInputChange("images", images)}
              maxImages={5}
              label="Images de l'événement"
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de début *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.startsAt && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startsAt ? (
                        format(formData.startsAt, "PPP", { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.startsAt || undefined}
                      onSelect={(date) => handleInputChange("startsAt", date)}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Date de fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.endsAt && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endsAt ? (
                        format(formData.endsAt, "PPP", { locale: fr })
                      ) : (
                        <span>Même jour</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endsAt || undefined}
                      onSelect={(date) => handleInputChange("endsAt", date)}
                      disabled={(date) =>
                        date < (formData.startsAt || new Date())
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="venue">Lieu de l'événement *</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => handleInputChange("venue", e.target.value)}
                placeholder="Ex: Gymnase Jean Moulin"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Ex: Lyon"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacité maximale</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleInputChange("capacity", e.target.value)}
                placeholder="100"
              />
              <p className="text-sm text-muted-foreground">
                Laissez vide pour une capacité illimitée
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Types de billets</h3>
                <p className="text-sm text-muted-foreground">
                  Définissez les différents types de billets et leurs prix
                </p>
              </div>
              <Button onClick={addTicketType} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un type
              </Button>
            </div>
            
            <div className="space-y-4">
              {formData.ticketTypes.map((ticketType, index) => (
                <Card key={ticketType.id} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Type de billet #{index + 1}</h4>
                    {formData.ticketTypes.length > 1 && (
                      <Button
                        onClick={() => removeTicketType(index)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`name-${index}`}>Nom du billet *</Label>
                      <Input
                        id={`name-${index}`}
                        value={ticketType.name}
                        onChange={(e) => handleTicketTypeChange(index, "name", e.target.value)}
                        placeholder="Ex: Standard, VIP, Étudiant"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`price-${index}`}>Prix (€)</Label>
                      <Input
                        id={`price-${index}`}
                        type="number"
                        step="0.01"
                        value={ticketType.priceCents ? (parseInt(ticketType.priceCents) / 100).toString() : ""}
                        onChange={(e) => {
                          const euros = parseFloat(e.target.value) || 0;
                          const cents = Math.round(euros * 100);
                          handleTicketTypeChange(index, "priceCents", cents.toString());
                        }}
                        placeholder="25.00"
                      />
                      <p className="text-xs text-muted-foreground">
                        Laissez vide pour un billet gratuit
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`quantity-${index}`}>Quantité disponible *</Label>
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        value={ticketType.quantity}
                        onChange={(e) => handleTicketTypeChange(index, "quantity", e.target.value)}
                        placeholder="50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`maxPerOrder-${index}`}>Max par commande</Label>
                      <Input
                        id={`maxPerOrder-${index}`}
                        type="number"
                        value={ticketType.maxPerOrder}
                        onChange={(e) => handleTicketTypeChange(index, "maxPerOrder", Number(e.target.value))}
                        placeholder="10"
                      />
                    </div>
                  </div>
                  
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Événement prêt à être créé</h3>
              <p className="text-muted-foreground">
                Vérifiez les informations ci-dessous avant de finaliser
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Informations générales</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Titre :</span>
                    <span className="text-right">{formData.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Catégorie :</span>
                    <span>{formData.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Date :</span>
                    <span>
                      {formData.startsAt && format(formData.startsAt, "dd/MM/yyyy", { locale: fr })}
                      {formData.endsAt && format(formData.endsAt, " - dd/MM/yyyy", { locale: fr })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Lieu :</span>
                    <span className="text-right">{formData.venue}, {formData.city}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Types de billets</h4>
                <div className="space-y-3">
                  {formData.ticketTypes.map((ticket, index) => (
                    <div key={index} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{ticket.name}</span>
                        <div className="text-right">
                          <div className="font-semibold">
                            {ticket.priceCents && parseInt(ticket.priceCents) > 0 ? `${(parseInt(ticket.priceCents) / 100).toFixed(2)}€` : "Gratuit"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {ticket.quantity} billets
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Status de publication</h4>
                  <p className="text-sm text-muted-foreground">
                    Choisissez si vous voulez publier immédiatement ou sauvegarder en brouillon
                  </p>
                </div>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: "draft" | "published") => handleInputChange("status", value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Sauvegarder en brouillon</SelectItem>
                    <SelectItem value="published">Publier immédiatement</SelectItem>
                  </SelectContent>
                </Select>
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
        <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/org/${orgId}/events`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Créer un événement</h1>
          <p className="text-muted-foreground">
            Créez un nouvel événement sportif en quelques étapes
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
            className={`flex items-center space-x-3 p-3 rounded-lg border ${
              currentStep === step.number
                ? "border-primary bg-primary/5"
                : currentStep > step.number
                ? "border-green-200 bg-green-50"
                : "border-border bg-muted/30"
            }`}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === step.number
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
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between max-w-4xl mx-auto">
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
            {isSubmitting 
              ? "Création en cours..." 
              : formData.status === "published" 
                ? "Publier l'événement" 
                : "Sauvegarder en brouillon"
            }
            <CheckCircle className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateEvent;