
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/landing/Hero";
import { SportsSpotlight } from "@/components/landing/SportsSpotlight";
import { LatestActivities } from "@/components/landing/LatestActivities";
import { CtaBand } from "@/components/landing/CtaBand";
import { SEO } from "@/components/SEO";

const Index = () => {
  const [loading] = useState(false);

  // Mock stats not really used in new design but kept for prop compatibility if needed
  const [stats] = useState({
    totalEvents: 250,
    totalTickets: 15000,
    satisfaction: 98,
  });

  return (
    <div className="min-h-screen bg-background font-sans">
      <SEO
        title="Réservez vos activités sportives"
        description="Trouvez et réservez les meilleures activités sportives et événements près de chez vous avec Panache."
      />
      <Navbar />

      <Hero stats={stats} loading={loading} />

      <main>
        <SportsSpotlight />

        <LatestActivities />

        <CtaBand />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
