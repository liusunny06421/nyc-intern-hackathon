"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Box, ShoppingBag } from "lucide-react";

// Real Broadway Hall rooms (from official floor plans): single, double, big single, big double.
const EXAMPLE_ROOMS = ["B305", "B333", "B707", "B522", "B1119"];

export default function HomePage() {
  const router = useRouter();
  const [roomNumber, setRoomNumber] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (room?: string) => {
    const val = (room ?? roomNumber).trim().toUpperCase();
    if (!val) { setError("Enter a room number"); return; }
    if (!/^[A-Z]{1,8}\d{3,4}$/.test(val)) {
      setError("Format: building letter + room # (e.g. B304, H205, W412)");
      return;
    }
    router.push(`/room/${val}`);
  };

  return (
    <main className="flex flex-col min-h-screen">
      {/* Subtle warm vignette behind hero */}
      <section className="relative flex flex-col items-center justify-center flex-1 px-6 pt-24 pb-16 text-center overflow-hidden">
        {/* Background color blobs using palette */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "var(--color-rose)" }} />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full opacity-8 blur-3xl"
          style={{ background: "var(--color-sage)" }} />
        <div className="pointer-events-none absolute top-1/2 left-1/4 h-64 w-64 rounded-full opacity-6 blur-3xl"
          style={{ background: "var(--color-mustard)" }} />

        <Badge variant="secondary" className="mb-6 gap-1.5 text-xs font-mono tracking-wide relative">
          <Sparkles className="h-3 w-3" style={{ color: "var(--color-rose)" }} />
          Columbia Broadway Dorms · Powered by World Labs
        </Badge>

        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-4 max-w-3xl relative">
          See your dorm{" "}
          <span style={{ color: "var(--color-rose)" }}>before you move in</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl mb-12 relative">
          Enter your room number. Get a navigable 3D model of your actual room,
          AI furniture recommendations that fit, and buy directly from IKEA &amp; Target.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mb-3 relative">
          <Input
            placeholder="Room number (e.g. B304)"
            value={roomNumber}
            onChange={(e) => { setRoomNumber(e.target.value.toUpperCase()); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="h-12 text-base font-mono bg-card border-border"
          />
          <Button size="lg" className="h-12 gap-2 shrink-0" onClick={() => handleSubmit()}>
            Explore <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {error && <p className="text-sm mb-3 relative" style={{ color: "var(--color-burgundy)" }}>{error}</p>}

        <div className="flex flex-wrap gap-2 justify-center relative">
          <span className="text-xs text-muted-foreground self-center">Try:</span>
          {EXAMPLE_ROOMS.map((r) => (
            <button
              key={r}
              onClick={() => handleSubmit(r)}
              className="font-mono text-xs px-3 py-1.5 rounded-md bg-secondary hover:bg-accent/20 transition-colors border border-border"
            >
              {r}
            </button>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-card/50">
        <div className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              icon: Box,
              title: "Real 3D Models",
              desc: "Generated from actual floor plans and photos via World Labs. Walk through your room before move-in.",
              color: "var(--color-rose)",
              bg: "oklch(0.70 0.09 12 / 0.12)",
            },
            {
              icon: Sparkles,
              title: "AI Styling",
              desc: "Upload Pinterest inspo. See your room restyled with furniture that actually fits your dimensions.",
              color: "var(--color-sage)",
              bg: "oklch(0.52 0.07 145 / 0.12)",
            },
            {
              icon: ShoppingBag,
              title: "Shop & Place in AR",
              desc: "Real products from IKEA & Target. Preview items in AR before you buy. No more returns.",
              color: "var(--color-mustard)",
              bg: "oklch(0.74 0.15 85 / 0.12)",
            },
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
        {[
          "var(--color-rose)",
          "var(--color-beige)",
          "var(--color-sage)",
          "var(--color-burgundy)",
          "var(--color-mustard)",
          "var(--color-teal)",
        ].map((c, i) => (
          <div key={i} className="flex-1" style={{ background: c }} />
        ))}
      </div>

      <footer className="border-t border-border py-6 px-6 text-center text-xs text-muted-foreground">
        DormDesign · Built for Columbia students · Hackathon MVP 2026
      </footer>
    </main>
  );
}
