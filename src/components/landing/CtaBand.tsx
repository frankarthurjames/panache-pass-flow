
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CtaBand = () => {
    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-500 to-orange-600">
            <div className="container mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                    Ton prochain événement commence ici
                </h2>
                <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto leading-relaxed">
                    Rejoins plus de 250 organisateurs qui ont choisi Panache
                    pour créer des événements sportifs exceptionnels.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button size="lg" variant="secondary" asChild className="text-lg px-10 py-4 h-auto bg-white text-orange-600 hover:bg-gray-50">
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
    );
};
