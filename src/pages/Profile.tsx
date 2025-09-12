import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Calendar, Save } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">Mon Profil</h1>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles et préférences de compte
          </p>
        </div>
      </section>

      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Profile Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="text-xl">
                      {user?.user_metadata?.display_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">
                    {user?.user_metadata?.display_name || 'Utilisateur'}
                  </CardTitle>
                  <CardDescription>{user?.email}</CardDescription>
                  <Badge variant="secondary" className="mt-2">
                    Organisateur vérifié ✓
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm space-y-2">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      Membre depuis janvier 2024
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      France
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Statistiques</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Événements créés</span>
                        <span className="font-medium">3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Billets vendus</span>
                        <span className="font-medium">157</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Note moyenne</span>
                        <span className="font-medium">4.8 ⭐</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Informations personnelles
                  </CardTitle>
                  <CardDescription>
                    Modifiez vos informations de profil public
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input 
                        id="firstName" 
                        defaultValue={user?.user_metadata?.first_name || ''}
                        placeholder="Votre prénom" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input 
                        id="lastName" 
                        defaultValue={user?.user_metadata?.last_name || ''}
                        placeholder="Votre nom" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Nom d'affichage</Label>
                    <Input 
                      id="displayName" 
                      defaultValue={user?.user_metadata?.display_name || ''}
                      placeholder="Comment voulez-vous être appelé ?" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biographie</Label>
                    <Textarea 
                      id="bio"
                      placeholder="Parlez-nous de vous et de votre expérience en organisation d'événements..."
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Coordonnées
                  </CardTitle>
                  <CardDescription>
                    Vos informations de contact pour les participants
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      defaultValue={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      L'email ne peut pas être modifié pour des raisons de sécurité
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input 
                      id="phone" 
                      placeholder="+33 6 12 34 56 78"
                      defaultValue={user?.user_metadata?.phone || ''}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Localisation</Label>
                    <Input 
                      id="location" 
                      placeholder="Ville, Région"
                      defaultValue={user?.user_metadata?.location || ''}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button size="lg">
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder les modifications
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;