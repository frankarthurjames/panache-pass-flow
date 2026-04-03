
import React from "react";
import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const SPORTS = [
    { name: "Athlétisme", slug: "athletisme", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800" },
    { name: "Tennis", slug: "tennis", image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=60" },
    { name: "Kayak", slug: "kayak", image: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&auto=format&fit=crop&q=60" },
    { name: "Natation", slug: "natation", image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&auto=format&fit=crop&q=60" },
];

export const SportsSpotlight = () => {
    return (
        <section className="relative py-24 overflow-hidden">
            <div
                className="absolute inset-0 bg-[#F97316]"
                style={{
                    zIndex: 0,
                    clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)"
                }}
            />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <h2 className="text-3xl font-bold text-white mb-8">Les sports à la une</h2>

                {/* Desktop Grid */}
                <div className="hidden md:grid md:grid-cols-4 gap-6">
                    {SPORTS.map((sport) => (
                        <SportCard key={sport.name} sport={sport} />
                    ))}
                </div>

                {/* Mobile Carousel */}
                <div className="md:hidden">
                    <Carousel className="w-full max-w-xs mx-auto">
                        <CarouselContent>
                            {SPORTS.map((sport) => (
                                <CarouselItem key={sport.name}>
                                    <SportCard sport={sport} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-[-20px] bg-white/20 text-white border-white/40" />
                        <CarouselNext className="right-[-20px] bg-white/20 text-white border-white/40" />
                    </Carousel>
                </div>
            </div>
        </section>
    );
};

const SportCard = ({ sport }: { sport: { name: string; slug: string; image: string } }) => (
    <Link
        to={`/events?sport=${sport.slug}`}
        className="group relative h-40 overflow-hidden rounded-lg shadow-lg block"
    >
        <img
            src={sport.image}
            alt={sport.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
        <div className="absolute bottom-0 left-0 w-full p-4">
            <h3 className="text-xl font-bold text-white text-center">{sport.name}</h3>
        </div>
    </Link>
);
