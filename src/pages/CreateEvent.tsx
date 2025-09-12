import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Users, 
  Euro, 
  Save, 
  Eye, 
  ArrowLeft,
  Plus,
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const CreateEvent = () => {
  const [date, setDate] = useState<Date>();
  const [ticketTypes, setTicketTypes] = useState([
    { id: 1, name: "Standard", price: "25", quantity: "100" }
  ]);

  const addTicketType = () => {
    const newId = Math.max(...ticketTypes.map(t => t.id)) + 1;
    setTicketTypes([...ticketTypes, { id: newId, name: "", price: "", quantity: "" }]);
  };

  const removeTicketType = (id: number) => {
    setTicketTypes(ticketTypes.filter(t => t.id !== id));
  };

  const updateTicketType = (id: number, field: string, value: string) => {
    setTicketTypes(ticketTypes.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au dashboard
              </Link>
            </Button>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Créer un événement</h1>
              <p className="text-muted-foreground">
                Configurez votre événement sportif en quelques étapes simples
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Prévisualiser
              </Button>
              <Button size="sm">
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder le brouillon
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8">
            
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
                <CardDescription>
                  Les informations de base de votre événement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'événement *</Label>
                  <Input 
                    id="title" 
                    placeholder="Ex: Tournoi de Tennis de Table Amateur 2025"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sport">Sport *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un sport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="football">Football</SelectItem>
                      <SelectItem value="tennis">Tennis</SelectItem>
                      <SelectItem value="basketball">Basketball</SelectItem>
                      <SelectItem value="running">Course à pied</SelectItem>
                      <SelectItem value="cyclisme">Cyclisme</SelectItem>
                      <SelectItem value="natation">Natation</SelectItem>
                      <SelectItem value="badminton">Badminton</SelectItem>
                      <SelectItem value="tennis-table">Tennis de table</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description"
                    placeholder="Décrivez votre événement, les règles, le niveau requis..."
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Date & Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Date et lieu
                </CardTitle>
                <CardDescription>
                  Quand et où aura lieu votre événement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date de l'événement *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP", { locale: fr }) : "Choisir une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time">Heure de début *</Label>
                    <Input id="time" type="time" defaultValue="14:00" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse *</Label>
                    <Input 
                      id="address" 
                      placeholder="123 Rue de la Paix"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville *</Label>
                    <Input 
                      id="city" 
                      placeholder="Paris"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">Nom du lieu</Label>
                  <Input 
                    id="venue" 
                    placeholder="Ex: Gymnase Jean Moulin, Stade Municipal..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ticketing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Euro className="w-5 h-5 mr-2" />
                  Billetterie
                </CardTitle>
                <CardDescription>
                  Configurez les types de billets et les tarifs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {ticketTypes.map((ticket) => (
                    <div key={ticket.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">Type de billet {ticket.id}</Badge>
                        {ticketTypes.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeTicketType(ticket.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Nom du billet</Label>
                          <Input 
                            placeholder="Ex: Standard, VIP, Étudiant"
                            value={ticket.name}
                            onChange={(e) => updateTicketType(ticket.id, 'name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Prix (€)</Label>
                          <Input 
                            type="number"
                            placeholder="25"
                            value={ticket.price}
                            onChange={(e) => updateTicketType(ticket.id, 'price', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Quantité disponible</Label>
                          <Input 
                            type="number"
                            placeholder="100"
                            value={ticket.quantity}
                            onChange={(e) => updateTicketType(ticket.id, 'quantity', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" onClick={addTicketType}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un type de billet
                </Button>
              </CardContent>
            </Card>

            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Participants
                </CardTitle>
                <CardDescription>
                  Définissez les règles de participation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minAge">Âge minimum</Label>
                    <Input id="minAge" type="number" placeholder="16" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAge">Âge maximum (optionnel)</Label>
                    <Input id="maxAge" type="number" placeholder="65" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="level">Niveau requis</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debutant">Débutant</SelectItem>
                      <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                      <SelectItem value="avance">Avancé</SelectItem>
                      <SelectItem value="expert">Expert/Professionnel</SelectItem>
                      <SelectItem value="tous">Tous niveaux</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between items-center pt-8">
              <Button variant="outline" asChild>
                <Link to="/dashboard">Annuler</Link>
              </Button>
              <div className="flex gap-4">
                <Button variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder le brouillon
                </Button>
                <Button>
                  Publier l'événement
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreateEvent;