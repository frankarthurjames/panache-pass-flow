import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import { EventCard } from "@/components/EventCard";
import { SearchSection } from "@/components/SearchSection";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";

/**
 * Petits helpers UI internes (typo/sections).
 */
const SectionHeading = ({ kicker, title, subtitle }: { kicker?: string; title: string; subtitle?: string }) => (
  <div className="text-center mb-16">
    {kicker && (
      <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-widest"
           style={{ borderColor: "rgba(249,115,22,.3)", color: "#EA580C" }}>
        {kicker}
      </div>
    )}
    <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-foreground">{title}</h2>
    {subtitle && <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
  </div>
);

type PopularEvent = {
  id: string;
  title: string;
  date: string;
  price: string;
  location: string;
  participants: string;
  image: string;
};

const Index = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [popularEvents, setPopularEvents] = useState<PopularEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats] = useState({
    totalEvents: 250,
    totalTickets: 15000,
    satisfaction: 98,
  });

  const goSearch = () => {
    const q = searchQuery.trim();
    navigate(q ? `/events?q=${encodeURIComponent(q)}` : "/events");
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") goSearch();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("events")
          .select(`
            *,
            organizations ( id, name, logo_url ),
            registrations ( id ),
            ticket_types ( id, price_cents, currency )
          `)
          .eq("status", "published")
          .gte("starts_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(3);

        if (!error && data) {
          const formatted = data.map((e: any) => {
            const participantsCount = e.registrations?.length || 0;
            const minPrice = e.ticket_types?.length ? Math.min(...e.ticket_types.map((t: any) => t.price_cents)) : 0;
            return {
              id: e.id,
              title: e.title,
              date: new Date(e.starts_at).toLocaleDateString("fr-FR", {
                day: "numeric", month: "short", year: "numeric",
              }),
              price: minPrice > 0 ? `${(minPrice / 100).toFixed(0)}€` : "Gratuit",
              location: e.city || "Lieu à confirmer",
              participants: `${participantsCount}/${e.capacity || "∞"}`,
              image:
                Array.isArray(e.images) && e.images.length
                  ? e.images[0]
                  : "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop",
            } as PopularEvent;
          });
          setPopularEvents(formatted);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <header className="relative overflow-hidden">
        {/* Glow d'arrière-plan subtil */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full blur-3xl"
               style={{ background: "radial-gradient(closest-side, rgba(249,115,22,.18), transparent 70%)" }} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center max-w-5xl">
          <Badge variant="secondary" className="mb-6 border-0"
                 style={{ background: "rgba(249,115,22,.12)", color: "#EA580C" }}>
            Plateforme de billetterie sportive
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight text-foreground">
            La billetterie <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(90deg, #F97316, #EA580C)" }}>taillée pour le sport</span>
          </h1>

          <p className="mt-6 text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Crée, vends et contrôle tes billets depuis une interface simple et exigeante — sans friction.
          </p>

          {/* Barre de recherche compacte */}
          <div className="mt-10 max-w-2xl mx-auto">
            <div className="flex gap-2 rounded-xl border bg-card px-2 py-2 shadow-sm">
              <Input
                placeholder="Rechercher un événement…"
                className="h-12 border-0 focus-visible:ring-0 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={onKeyDown}
              />
              <Button onClick={goSearch} className="h-12 px-6 font-semibold"
                      style={{ background: "#F97316", color: "#111827" }}
                      onMouseOver={(e) => (e.currentTarget.style.background = "#EA580C")}
                      onMouseOut={(e) => (e.currentTarget.style.background = "#F97316")}>
                Rechercher
              </Button>
            </div>
          </div>

          {/* CTA primaire */}
          <div className="mt-8 flex justify-center">
            <Button asChild className="h-12 px-7 text-base font-semibold"
                    style={{ background: "#F97316", color: "#111827" }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "#EA580C")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "#F97316")}>
              <Link to="/auth?tab=signup">
                Créer mon événement <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Stats épurées */}
          <div className="mt-14 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            {[
              { label: "Événements créés", value: `${stats.totalEvents}+` },
              { label: "Billets vendus", value: `${stats.totalTickets}+` },
              { label: "Satisfaction", value: `${stats.satisfaction}%` },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-foreground">{loading ? "—" : s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main>
        {/* Section recherche avancée existante */}
        <SearchSection />

        {/* Process en 3 étapes — sans icônes, numéros sobres */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="container mx-auto">
            <SectionHeading
              kicker="Comment ça marche"
              title="Simple comme 1-2-3"
              subtitle="Lance ton événement en moins de 10 minutes."
            />
            <div className="grid lg:grid-cols-3 gap-10 max-w-5xl mx-auto">
              {[{
                n: 1, t: "Crée ton événement",
                d: "Titre, date, lieu et description — l'essentiel, sans superflu."
              }, {
                n: 2, t: "Ouvre la billetterie",
                d: "Types de billets, quotas, tarifs. Stripe s'occupe du paiement."
              }, {
                n: 3, t: "Partage et contrôle",
                d: "Suis les ventes et valide les entrées via QR depuis ton dashboard."
              }].map((step) => (
                <div key={step.n} className="group rounded-2xl border bg-card p-6">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm"
                       style={{ background: "rgba(249,115,22,.12)", color: "#EA580C" }}>
                    {step.n}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{step.t}</h3>
                  <p className="mt-2 text-muted-foreground">{step.d}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-14">
              <Button asChild className="h-12 px-7 text-base font-semibold"
                      style={{ background: "#F97316", color: "#111827" }}
                      onMouseOver={(e) => (e.currentTarget.style.background = "#EA580C")}
                      onMouseOut={(e) => (e.currentTarget.style.background = "#F97316")}>
                <Link to="/auth?tab=signup">Commencer maintenant <ArrowRight className="ml-1 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Propositions de valeur — listes courtes, sans pictos */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <SectionHeading
              title="Tout ce qu'il faut — sans l'inutile"
              subtitle="Des outils pro, centrés sur la vitesse et la fiabilité."
            />
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  t: "Création ultra-rapide",
                  f: ["Formulaire guidé", "Brouillons et publication immédiate", "Médias & SEO natifs"],
                },
                {
                  t: "Paiements maîtrisés",
                  f: ["Stripe intégré", "Payouts directs", "Frais clairs et transparents"],
                },
                {
                  t: "Opérations fluides",
                  f: ["Tableau de bord temps réel", "Validation QR offline-ready", "Export participants"],
                },
              ].map((card, idx) => (
                <div key={idx} className="rounded-2xl border bg-card p-6">
                  <h3 className="text-lg font-semibold">{card.t}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {card.f.map((x) => (
                      <li key={x} className="leading-relaxed">— {x}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Événements populaires */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="container mx-auto">
            <SectionHeading title="Événements populaires"
                            subtitle="Découvre ce qui cartonne sur Panache Esport." />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card p-6">
                      <div className="h-48 w-full rounded-lg bg-muted animate-pulse" />
                      <div className="mt-4 h-4 w-3/4 bg-muted animate-pulse rounded" />
                      <div className="mt-2 h-3 w-1/2 bg-muted animate-pulse rounded" />
                    </div>
                  ))
                : popularEvents.length
                  ? popularEvents.map((e) => (
                      <EventCard
                        key={e.id}
                        id={e.id}
                        title={e.title}
                        date={e.date}
                        price={e.price}
                        location={e.location}
                        participants={e.participants}
                        image={e.image}
                      />
                    ))
                  : (
                    <div className="col-span-full text-center text-muted-foreground py-12">
                      <p>Aucun événement disponible pour le moment.</p>
                    </div>
                  )}
            </div>
            <div className="text-center">
              <Button variant="outline" asChild className="h-12 px-7 text-base">
                <Link to="/events">Explorer tous les événements <ArrowRight className="ml-1 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="py-24 px-4 sm:px-6 lg:px-8"
                 style={{ background: "linear-gradient(135deg, #F97316, #EA580C)" }}>
          <div className="container mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ton prochain événement commence ici
            </h2>
            <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto leading-relaxed">
              Rejoins plus de 250 organisateurs qui ont choisi Panache 
              pour créer des événements sportifs exceptionnels.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" variant="secondary" asChild className="text-lg px-10 py-4 h-auto bg-white text-[#EA580C] hover:bg-gray-50">
                <Link to="/auth?tab=signup">
                  Créer mon événement gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <div className="text-white/80 text-sm">
                ✨ Aucune carte bancaire requise
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
