import { NextRequest, NextResponse } from "next/server";
import { recommendFurniture } from "@/lib/furniture";
import { searchFurnitureWithAgent, isAgentConfigured } from "@/lib/furniture-agent";

// The web-scraping agent can take a while (live web_search + web_fetch round trips).
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const { width, length, styles = [], category } = await req.json();
  if (!width || !length) {
    return NextResponse.json({ error: "width and length (in feet) are required" }, { status: 400 });
  }

  // Prefer the live AI agent that scrapes real products from the web.
  if (isAgentConfigured()) {
    const aiItems = await searchFurnitureWithAgent({
      widthFt: width,
      lengthFt: length,
      styles,
      category,
    });
    if (aiItems && aiItems.length > 0) {
      return NextResponse.json({ items: aiItems, source: "ai" });
    }
  }

  // Fallback: curated static catalogue (no API key, or the agent came up empty).
  const items = recommendFurniture({ width, length, hasLoftedBed: false }, styles);
  return NextResponse.json({ items, source: "static" });
}
