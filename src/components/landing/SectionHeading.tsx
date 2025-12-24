
import React from "react";

interface SectionHeadingProps {
  kicker?: string;
  title: string;
  subtitle?: string;
}

export const SectionHeading = ({ kicker, title, subtitle }: SectionHeadingProps) => (
  <div className="text-center mb-16">
    {kicker && (
      <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-widest border-orange-500/30 text-orange-600">
        {kicker}
      </div>
    )}
    <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-foreground">{title}</h2>
    {subtitle && <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
  </div>
);
