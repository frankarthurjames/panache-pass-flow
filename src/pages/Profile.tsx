import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Calendar, Save, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    phone: '',
    location: '',
    bio: ''
  });

  // Initialiser les données du formulaire quand l'utilisateur est chargé
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        displayName: user.user_metadata?.display_name || '',
        phone: user.user_metadata?.phone || '',
        location: user.user_metadata?.location || '',
        bio: user.user_metadata?.bio || ''
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Mettre à jour les métadonnées utilisateur dans Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          display_name: formData.displayName,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio
        }
      });

      if (authError) throw authError;

      // Mettre à jour ou créer le profil dans la table users publique
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          display_name: formData.displayName,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      toast.success("Profil mis à jour avec succès !");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

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
                      {formData.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">
                    {formData.displayName || 'Utilisateur'}
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
                      {formData.location || 'France'}
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
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Votre prénom" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input 
                        id="lastName" 
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Votre nom" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Nom d'affichage</Label>
                    <Input 
                      id="displayName" 
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      placeholder="Comment voulez-vous être appelé ?" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biographie</Label>
                    <Textarea 
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
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
                      value={user?.email || ''}
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
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Localisation</Label>
                    <Input 
                      id="location" 
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Ville, Région"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button size="lg" onClick={handleSave} disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
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