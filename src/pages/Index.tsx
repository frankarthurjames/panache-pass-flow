
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/landing/Hero";
import { SportsSpotlight } from "@/components/landing/SportsSpotlight";
import { LatestActivities } from "@/components/landing/LatestActivities";

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
      <Navbar />

      <Hero stats={stats} loading={loading} />

      <main>
        <SportsSpotlight />

        <LatestActivities />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
