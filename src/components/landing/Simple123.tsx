
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

export const Simple123 = () => {
    return (
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
                            <div className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm bg-orange-500/10 text-orange-600">
                                {step.n}
                            </div>
                            <h3 className="mt-4 text-xl font-semibold">{step.t}</h3>
                            <p className="mt-2 text-muted-foreground">{step.d}</p>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-14">
                    <Button asChild className="h-12 px-7 text-base font-semibold bg-orange-500 hover:bg-orange-600 text-white">
                        <Link to="/auth?tab=signup">Commencer maintenant <ArrowRight className="ml-1 h-5 w-5" /></Link>
                    </Button>
                </div>
            </div>
        </section>
    );
};
