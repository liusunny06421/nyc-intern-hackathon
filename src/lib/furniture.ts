export interface FurnitureItem {
  id: string;
  name: string;
  retailer: "ikea" | "target" | "wayfair" | "amazon" | "other";
  price: number;
  imageUrl: string;
  productUrl: string;
  dimensions: { width: number; depth: number; height: number }; // inches
  category: "bed" | "desk" | "chair" | "storage" | "lighting" | "decor" | "rug" | "shelf";
  style: string[];
  colors: string[];
}

export interface RoomConstraints {
  width: number; // feet
  length: number; // feet
  hasLoftedBed: boolean;
}

// IKEA product data (sampled from their catalog)
const IKEA_PRODUCTS: FurnitureItem[] = [
  {
    id: "ikea-malm-desk",
    name: "MALM Desk",
    retailer: "ikea",
    price: 199,
    imageUrl: "https://www.ikea.com/us/en/images/products/malm-desk-white__0735031_pe740073_s5.jpg",
    productUrl: "https://www.ikea.com/us/en/p/malm-desk-white-20403590/",
    dimensions: { width: 55, depth: 22, height: 29 },
    category: "desk",
    style: ["modern", "minimalist", "scandinavian"],
    colors: ["white", "black-brown", "oak"],
  },
  {
    id: "ikea-alex-drawers",
    name: "ALEX Drawer Unit",
    retailer: "ikea",
    price: 129,
    imageUrl: "https://www.ikea.com/us/en/images/products/alex-drawer-unit-white__0714958_pe730021_s5.jpg",
    productUrl: "https://www.ikea.com/us/en/p/alex-drawer-unit-white-00473546/",
    dimensions: { width: 14, depth: 23, height: 28 },
    category: "storage",
    style: ["modern", "minimalist"],
    colors: ["white", "black"],
  },
  {
    id: "ikea-kallax-shelf",
    name: "KALLAX Shelf Unit",
    retailer: "ikea",
    price: 69,
    imageUrl: "https://www.ikea.com/us/en/images/products/kallax-shelf-unit-white__0644757_pe702938_s5.jpg",
    productUrl: "https://www.ikea.com/us/en/p/kallax-shelf-unit-white-10275814/",
    dimensions: { width: 30, depth: 15, height: 30 },
    category: "shelf",
    style: ["modern", "minimalist", "scandinavian"],
    colors: ["white", "black-brown", "birch"],
  },
  {
    id: "ikea-nominell-rug",
    name: "NOMINELL Rug",
    retailer: "ikea",
    price: 49,
    imageUrl: "https://www.ikea.com/us/en/images/products/nominell-rug-low-pile-white__0836177_pe777574_s5.jpg",
    productUrl: "https://www.ikea.com/us/en/p/nominell-rug-low-pile-white-80427773/",
    dimensions: { width: 63, depth: 90, height: 0.4 },
    category: "rug",
    style: ["modern", "minimalist"],
    colors: ["white", "beige", "gray"],
  },
  {
    id: "ikea-ranarp-lamp",
    name: "RANARP Work Lamp",
    retailer: "ikea",
    price: 49,
    imageUrl: "https://www.ikea.com/us/en/images/products/ranarp-work-lamp-off-white__0713397_pe729452_s5.jpg",
    productUrl: "https://www.ikea.com/us/en/p/ranarp-work-lamp-off-white-20340444/",
    dimensions: { width: 8, depth: 8, height: 18 },
    category: "lighting",
    style: ["industrial", "vintage", "modern"],
    colors: ["off-white", "black"],
  },
  {
    id: "ikea-hauga-bed",
    name: "HAUGA Upholstered Bed Frame",
    retailer: "ikea",
    price: 299,
    imageUrl: "https://www.ikea.com/us/en/images/products/hauga-upholstered-bed-frame-vissle-gray__0837481_pe777784_s5.jpg",
    productUrl: "https://www.ikea.com/us/en/p/hauga-upholstered-bed-frame-vissle-gray-00469296/",
    dimensions: { width: 42, depth: 80, height: 44 },
    category: "bed",
    style: ["modern", "cozy", "scandinavian"],
    colors: ["gray", "beige"],
  },
  {
    id: "ikea-millberget-chair",
    name: "MILLBERGET Swivel Chair",
    retailer: "ikea",
    price: 129,
    imageUrl: "https://www.ikea.com/us/en/images/products/millberget-swivel-chair-bomstad-black__0714962_pe730025_s5.jpg",
    productUrl: "https://www.ikea.com/us/en/p/millberget-swivel-chair-bomstad-black-30340796/",
    dimensions: { width: 24, depth: 24, height: 36 },
    category: "chair",
    style: ["modern", "ergonomic"],
    colors: ["black", "beige", "gray"],
  },
];

const TARGET_PRODUCTS: FurnitureItem[] = [
  {
    id: "target-threshold-desk",
    name: "Fulton Writing Desk",
    retailer: "target",
    price: 179,
    imageUrl: "https://target.scene7.com/is/image/Target/GUEST_a7c0d0ef-d5c4-4a41-a40e-55f37a1e6bed",
    productUrl: "https://www.target.com/p/fulton-writing-desk-white/-/A-84527312",
    dimensions: { width: 47, depth: 20, height: 30 },
    category: "desk",
    style: ["modern", "minimalist"],
    colors: ["white", "espresso"],
  },
  {
    id: "target-led-strip",
    name: "LED Strip Lights 16.4ft",
    retailer: "target",
    price: 19,
    imageUrl: "https://target.scene7.com/is/image/Target/GUEST_led-strip",
    productUrl: "https://www.target.com/p/led-strip-lights/-/A-80085921",
    dimensions: { width: 0, depth: 196, height: 0 },
    category: "lighting",
    style: ["modern", "aesthetic", "cozy"],
    colors: ["rgb", "white", "warm-white"],
  },
  {
    id: "target-string-lights",
    name: "Globe String Lights",
    retailer: "target",
    price: 24,
    imageUrl: "https://target.scene7.com/is/image/Target/GUEST_string-lights",
    productUrl: "https://www.target.com/p/string-lights/-/A-54620899",
    dimensions: { width: 0, depth: 120, height: 0 },
    category: "lighting",
    style: ["cozy", "aesthetic", "bohemian"],
    colors: ["warm-white", "multi"],
  },
  {
    id: "target-threshold-rug",
    name: "Woven Stripe Rug 5×7",
    retailer: "target",
    price: 79,
    imageUrl: "https://target.scene7.com/is/image/Target/GUEST_woven-rug",
    productUrl: "https://www.target.com/p/woven-stripe-rug/-/A-86073521",
    dimensions: { width: 60, depth: 84, height: 0.5 },
    category: "rug",
    style: ["bohemian", "coastal", "modern"],
    colors: ["cream-blue", "terracotta", "gray-white"],
  },
];

const ALL_PRODUCTS = [...IKEA_PRODUCTS, ...TARGET_PRODUCTS];

export function recommendFurniture(
  constraints: RoomConstraints,
  inspirationStyles: string[] = [],
  limit = 8
): FurnitureItem[] {
  const roomWidthIn = constraints.width * 12;
  const roomLengthIn = constraints.length * 12;

  return ALL_PRODUCTS
    .filter((item) => {
      // Must fit in room (excluding rugs/lighting which have special rules)
      if (item.category === "lighting" || item.category === "decor") return true;
      if (item.category === "rug") return item.dimensions.width <= roomWidthIn && item.dimensions.depth <= roomLengthIn;
      return item.dimensions.width <= roomWidthIn - 24 && item.dimensions.depth <= roomLengthIn - 24;
    })
    .sort((a, b) => {
      // Boost style matches
      const aMatch = inspirationStyles.filter((s) => a.style.includes(s)).length;
      const bMatch = inspirationStyles.filter((s) => b.style.includes(s)).length;
      return bMatch - aMatch;
    })
    .slice(0, limit);
}
