import Anthropic from "@anthropic-ai/sdk";
import type { FurnitureItem } from "@/lib/furniture";

/**
 * AI furniture-sourcing agent.
 *
 * Given a room's dimensions (and optional style keywords / category), Claude
 * Opus 4.8 searches the live web with the server-side `web_search` + `web_fetch`
 * tools to find real, currently-purchasable dorm furniture from major US
 * retailers, fetches each product page to read the true image URL + price, then
 * returns the catalogue through a structured `save_products` tool call.
 *
 * Requires ANTHROPIC_API_KEY. Callers should fall back to the static catalogue
 * (see recommendFurniture) when this returns null.
 */

export interface FurnitureQuery {
  widthFt: number;
  lengthFt: number;
  styles?: string[];
  category?: string; // optional focus, e.g. "desk"
  limit?: number;
}

// ── In-memory cache so re-opening the Shop tab doesn't re-scrape (cost/latency) ──
interface CacheEntry { items: FurnitureItem[]; at: number }
const CACHE = new Map<string, CacheEntry>();
const TTL_MS = 30 * 60 * 1000; // 30 minutes

function cacheKey(q: FurnitureQuery): string {
  return [
    Math.round(q.widthFt),
    Math.round(q.lengthFt),
    (q.styles ?? []).slice().sort().join(","),
    q.category ?? "all",
    q.limit ?? 8,
  ].join("|");
}

export function isAgentConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// JSON Schema for the structured product payload Claude returns.
const SAVE_PRODUCTS_TOOL = {
  name: "save_products",
  description:
    "Save the final list of real, currently-purchasable dorm furniture products you found. Call this exactly once, after you have searched and verified each product's live page.",
  input_schema: {
    type: "object" as const,
    properties: {
      products: {
        type: "array",
        description: "The furniture products to recommend.",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Product name as listed by the retailer." },
            retailer: {
              type: "string",
              enum: ["ikea", "target", "wayfair", "amazon"],
              description: "The retailer the product is sold by.",
            },
            price: { type: "number", description: "Current price in USD (number only, no symbol)." },
            imageUrl: {
              type: "string",
              description:
                "Direct https URL to the product's primary image on the retailer's CDN (the og:image you read from the product page). Must be a real, loadable image URL — never a guess or placeholder.",
            },
            productUrl: {
              type: "string",
              description: "Direct https URL to the live product page where it can be purchased.",
            },
            dimensions: {
              type: "object",
              description: "Physical dimensions in INCHES.",
              properties: {
                width: { type: "number" },
                depth: { type: "number" },
                height: { type: "number" },
              },
              required: ["width", "depth", "height"],
              additionalProperties: false,
            },
            category: {
              type: "string",
              enum: ["bed", "desk", "chair", "storage", "lighting", "decor", "rug", "shelf"],
            },
            style: {
              type: "array",
              items: { type: "string" },
              description: "Style descriptors, e.g. [\"minimalist\", \"scandinavian\"].",
            },
            colors: {
              type: "array",
              items: { type: "string" },
              description: "Available colour options.",
            },
          },
          required: ["name", "retailer", "price", "imageUrl", "productUrl", "dimensions", "category", "style", "colors"],
          additionalProperties: false,
        },
      },
    },
    required: ["products"],
    additionalProperties: false,
  },
};

function buildPrompt(q: FurnitureQuery): { system: string; user: string } {
  const limit = q.limit ?? 8;
  const styleLine =
    q.styles && q.styles.length > 0
      ? `Aesthetic the student is going for: ${q.styles.join(", ")}.`
      : `No specific aesthetic given — favour broadly popular, versatile dorm pieces.`;
  const categoryLine = q.category
    ? `Focus on the "${q.category}" category.`
    : `Span a useful mix of categories: desk, chair, storage, shelf, lighting, rug, bed, and decor.`;

  const system = [
    "You are a furniture-sourcing agent for college students furnishing a dorm room.",
    "Your job: find REAL, currently-purchasable products from major US retailers (IKEA, Target, Wayfair, Amazon) and return them as structured data.",
    "",
    "Method:",
    "1. Use web_search to find specific dorm-appropriate products that match the requested style and fit the room.",
    "2. For each promising product, use web_fetch on its product page to read the EXACT current price and the primary product image URL (the og:image / main image on the retailer's CDN).",
    "3. Only include a product if it physically fits the room (compare its footprint in inches to the room size) and you have a real, loadable image URL and a working product URL.",
    "4. Prefer small-footprint, dorm-friendly, affordable items. Beds should be twin/twin-XL scale.",
    "",
    "Do not invent products, prices, image URLs, or links. If you are unsure an image URL is real, fetch the page again and read it from the HTML. When finished, call save_products exactly once with the full list.",
  ].join("\n");

  const user = [
    `Find ${limit} pieces of dorm furniture for a room that is ${q.widthFt} ft by ${q.lengthFt} ft (about ${Math.round(q.widthFt * 12)}in × ${Math.round(q.lengthFt * 12)}in of floor).`,
    styleLine,
    categoryLine,
    `Return ${limit} products via the save_products tool.`,
  ].join("\n");

  return { system, user };
}

type RawProduct = {
  name: string;
  retailer: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  dimensions: { width: number; depth: number; height: number };
  category: string;
  style: string[];
  colors: string[];
};

function toFurnitureItems(raw: RawProduct[]): FurnitureItem[] {
  return raw
    .filter((p) => p && p.name && p.imageUrl?.startsWith("http") && p.productUrl?.startsWith("http"))
    .map((p, i) => ({
      id: `ai-${p.retailer ?? "shop"}-${i}-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`,
      name: p.name,
      retailer: (["ikea", "target", "wayfair", "amazon"].includes(p.retailer) ? p.retailer : "other") as FurnitureItem["retailer"],
      price: Math.round(Number(p.price) || 0),
      imageUrl: p.imageUrl,
      productUrl: p.productUrl,
      dimensions: {
        width: Number(p.dimensions?.width) || 0,
        depth: Number(p.dimensions?.depth) || 0,
        height: Number(p.dimensions?.height) || 0,
      },
      category: (p.category ?? "decor") as FurnitureItem["category"],
      style: Array.isArray(p.style) ? p.style : [],
      colors: Array.isArray(p.colors) ? p.colors : [],
    }));
}

/**
 * Run the agent. Returns the scraped furniture, or null if the agent is not
 * configured or fails (caller should fall back to the static catalogue).
 */
export async function searchFurnitureWithAgent(q: FurnitureQuery): Promise<FurnitureItem[] | null> {
  if (!isAgentConfigured()) return null;

  const key = cacheKey(q);
  const cached = CACHE.get(key);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.items;

  const client = new Anthropic();
  const { system, user } = buildPrompt(q);

  const tools: Anthropic.ToolUnion[] = [
    { type: "web_search_20260209", name: "web_search" },
    { type: "web_fetch_20260209", name: "web_fetch" },
    SAVE_PRODUCTS_TOOL,
  ];

  const messages: Anthropic.MessageParam[] = [{ role: "user", content: user }];

  try {
    // Manual loop: server tools (web_search/web_fetch) run inline; we drive the
    // loop to handle pause_turn and to capture the client-side save_products call.
    for (let iteration = 0; iteration < 8; iteration++) {
      const stream = client.messages.stream({
        model: "claude-opus-4-8",
        max_tokens: 16000,
        thinking: { type: "adaptive" },
        output_config: { effort: "medium" },
        system,
        tools,
        messages,
      });
      const message = await stream.finalMessage();

      // Did the model emit our structured payload?
      const save = message.content.find(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === "save_products",
      );
      if (save) {
        const raw = (save.input as { products?: RawProduct[] }).products ?? [];
        const items = toFurnitureItems(raw);
        CACHE.set(key, { items, at: Date.now() });
        return items;
      }

      // Server-tool loop hit its internal cap — resume by re-sending.
      if (message.stop_reason === "pause_turn") {
        messages.push({ role: "assistant", content: message.content });
        continue;
      }

      // Finished without producing products (or asked a question) — give up.
      if (message.stop_reason === "end_turn" || message.stop_reason === "max_tokens") {
        break;
      }

      // Any other tool_use (shouldn't happen — only server tools + save_products):
      // append and continue so we don't spin.
      messages.push({ role: "assistant", content: message.content });
    }
    return null;
  } catch (err) {
    console.error("[furniture-agent] failed:", err);
    return null;
  }
}
