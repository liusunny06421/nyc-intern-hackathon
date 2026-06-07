"use client";

import { Badge } from "@/components/ui/badge";
import { Sparkles, Box, ShoppingBag } from "lucide-react";
import RoomGenerator from "@/components/RoomGenerator";

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero + uploader */}
      <section className="relative flex flex-col items-center justify-center flex-1 px-6 pt-20 pb-16 text-center overflow-hidden">
        {/* Background color blobs using palette */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-10 blur-3xl" style={{ background: "var(--color-rose)" }} />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full opacity-[0.08] blur-3xl" style={{ background: "var(--color-sage)" }} />
        <div className="pointer-events-none absolute top-1/2 left-1/4 h-64 w-64 rounded-full opacity-[0.06] blur-3xl" style={{ background: "var(--color-mustard)" }} />

        <Badge variant="secondary" className="mb-6 gap-1.5 text-xs font-mono tracking-wide relative">
          <Sparkles className="h-3 w-3" style={{ color: "var(--color-rose)" }} />
          Powered by World Labs Marble
        </Badge>

        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-4 max-w-3xl relative">
          Turn a photo into a{" "}
          <span style={{ color: "var(--color-rose)" }}>3D dorm room</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl mb-10 relative">
          Upload a photo (or a few) of your dorm room and get a navigable 3D world in minutes —
          then style it and shop furniture that fits.
        </p>

        <div className="relative w-full">
          <RoomGenerator />
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-t border-border bg-card/50">
        <div className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { icon: Box, title: "Real 3D Worlds", desc: "World Labs reconstructs a navigable space from your photos — including walls and corners you didn't capture.", color: "var(--color-rose)", bg: "oklch(0.70 0.09 12 / 0.12)" },
            { icon: Sparkles, title: "AI Styling", desc: "Upload Pinterest inspo and restyle your room with looks that match your aesthetic.", color: "var(--color-sage)", bg: "oklch(0.52 0.07 145 / 0.12)" },
            { icon: ShoppingBag, title: "Shop What Fits", desc: "Real products from IKEA & Target, sized to your space. Buy with a click.", color: "var(--color-mustard)", bg: "oklch(0.74 0.15 85 / 0.12)" },
          ].map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="flex flex-col gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Palette swatch strip */}
      <div className="flex h-1.5 w-full">
        {["var(--color-rose)", "var(--color-beige)", "var(--color-sage)", "var(--color-burgundy)", "var(--color-mustard)", "var(--color-teal)"].map((c, i) => (
          <div key={i} className="flex-1" style={{ background: c }} />
        ))}
      </div>

      <footer className="border-t border-border py-6 px-6 text-center text-xs text-muted-foreground">
        DormDesign · Built for college students · Powered by World Labs Marble
      </footer>
    </main>
  );
}
