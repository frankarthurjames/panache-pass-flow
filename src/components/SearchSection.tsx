import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export const SearchSection = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Trouve ton prochain{" "}
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              événement sportif
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Panache rassemble les tournois et matchs près de chez toi
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl p-8 shadow-lg border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Sport</label>
                <Select>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Tous les sports" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tous">Tous les sports</SelectItem>
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
                <label className="text-sm font-medium text-muted-foreground">Région</label>
                <Select>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Toutes les régions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="toutes">Toutes les régions</SelectItem>
                    <SelectItem value="ile-de-france">Île-de-France</SelectItem>
                    <SelectItem value="auvergne-rhone-alpes">Auvergne-Rhône-Alpes</SelectItem>
                    <SelectItem value="paca">Provence-Alpes-Côte d'Azur</SelectItem>
                    <SelectItem value="nouvelle-aquitaine">Nouvelle-Aquitaine</SelectItem>
                    <SelectItem value="occitanie">Occitanie</SelectItem>
                    <SelectItem value="hauts-de-france">Hauts-de-France</SelectItem>
                    <SelectItem value="grand-est">Grand Est</SelectItem>
                    <SelectItem value="pays-de-la-loire">Pays de la Loire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Mot-clé</label>
                <Input 
                  placeholder="Nom, lieu, équipe..." 
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground invisible">Rechercher</label>
                <Button size="lg" className="w-full h-12 text-base">
                  <Search className="mr-2 h-5 w-5" />
                  Rechercher
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};