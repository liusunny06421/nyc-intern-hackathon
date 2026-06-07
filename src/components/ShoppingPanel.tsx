"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, ShoppingCart, Ruler, Filter, Sparkles } from "lucide-react";
import Image from "next/image";
import type { FurnitureItem } from "@/lib/furniture";

interface Props {
  dimensions?: { width: number; length: number; height: number };
  roomNumber: string;
  styles?: string[];
}

const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  desk: "Desks",
  chair: "Chairs",
  storage: "Storage",
  lighting: "Lighting",
  rug: "Rugs",
  bed: "Beds",
  shelf: "Shelves",
};

export default function ShoppingPanel({ dimensions, roomNumber, styles }: Props) {
  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [source, setSource] = useState<"ai" | "static" | null>(null);

  const styleKey = (styles ?? []).join(",");

  useEffect(() => {
    if (!dimensions) { setLoading(false); return; }
    setLoading(true);
    fetch("/api/furniture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        width: dimensions.width,
        length: dimensions.length,
        styles: styleKey ? styleKey.split(",") : [],
      }),
    })
      .then((r) => r.json())
      .then((data) => { setItems(data.items ?? []); setSource(data.source ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [dimensions, styleKey]);

  const filtered = category === "all" ? items : items.filter((i) => i.category === category);
  const categories = ["all", ...Array.from(new Set(items.map((i) => i.category)))];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Furniture That Fits</h2>
            {source === "ai" && !loading && (
              <Badge variant="secondary" className="gap-1 text-xs" style={{ color: "var(--color-grass)" }}>
                <Sparkles className="h-3 w-3" /> Live from the web
              </Badge>
            )}
          </div>
          {dimensions && (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Ruler className="h-3.5 w-3.5" />
              {loading
                ? "Searching the web for real furniture that fits your room…"
                : `All items sized for your ${dimensions.width}′ × ${dimensions.length}′ room`}
            </p>
          )}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 sm:ml-auto flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`
                px-3 py-1 rounded-full text-xs font-medium border transition-colors
                ${category === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary border-border hover:border-primary/50"
                }
              `}
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>
      </div>

      {!dimensions && (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground text-sm">
          Room dimensions not found — furniture sizing unavailable. Try uploading inspo to get started.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                <Skeleton className="w-full aspect-square" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-8 w-full mt-3" />
                </div>
              </div>
            ))
          : filtered.map((item) => (
              <FurnitureCard key={item.id} item={item} />
            ))
        }
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No items in this category. Try &quot;All&quot;.
        </div>
      )}
    </div>
  );
}

function FurnitureCard({ item }: { item: FurnitureItem }) {
  // Use palette colors for retailer badges
  const retailerStyle: Record<string, { bg: string; color: string; border: string }> = {
    ikea:    { bg: "oklch(0.54 0.11 210 / 0.12)", color: "var(--color-teal)",     border: "oklch(0.54 0.11 210 / 0.25)" },
    target:  { bg: "oklch(0.40 0.14 15 / 0.12)",  color: "var(--color-burgundy)", border: "oklch(0.40 0.14 15 / 0.25)" },
    wayfair: { bg: "oklch(0.52 0.07 145 / 0.12)", color: "var(--color-sage)",     border: "oklch(0.52 0.07 145 / 0.25)" },
    amazon:  { bg: "oklch(0.74 0.15 85 / 0.14)",  color: "var(--color-marigold)", border: "oklch(0.74 0.15 85 / 0.28)" },
    other:   { bg: "color-mix(in srgb, var(--color-navy) 8%, transparent)", color: "var(--color-navy)", border: "color-mix(in srgb, var(--color-navy) 18%, transparent)" },
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col group hover:border-primary/30 transition-colors">
      <div className="relative aspect-square bg-secondary overflow-hidden">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://placehold.co/400x400/1a1a1a/555?text=${encodeURIComponent(item.name)}`;
          }}
        />
        <span
          className="absolute top-2 left-2 text-xs capitalize px-2 py-0.5 rounded-full font-medium border"
          style={{
            background: retailerStyle[item.retailer]?.bg,
            color: retailerStyle[item.retailer]?.color,
            borderColor: retailerStyle[item.retailer]?.border,
          }}
        >
          {item.retailer}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="font-medium text-sm leading-tight">{item.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {item.dimensions.width}″W × {item.dimensions.depth}″D
            {item.dimensions.height > 1 ? ` × ${item.dimensions.height}″H` : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          {item.style.slice(0, 2).map((s) => (
            <Badge key={s} variant="secondary" className="text-xs capitalize">{s}</Badge>
          ))}
        </div>

        <Separator />

        <div className="flex items-center justify-between mt-auto">
          <span className="font-bold text-lg">${item.price}</span>
          <a
            href={item.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
          >
            Buy <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
