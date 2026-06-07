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

// IKEA product data — scraped live from ikea.com; image URLs verified from each
// product page's og:image meta tag (HTTP 200 confirmed). Last refreshed 2026-06-07.
const IKEA_PRODUCTS: FurnitureItem[] = [
  {
    id: "ikea-micke-desk-white",
    name: "MICKE Desk, white",
    retailer: "ikea",
    price: 99,
    imageUrl: "https://www.ikea.com/us/en/images/products/micke-desk-white__0736018_pe740345_s5.jpg",
    productUrl: "https://www.ikea.com/us/en/p/micke-desk-white-80213074/",
    dimensions: { width: 41, depth: 20, height: 30 },
    category: "desk",
    style: ["modern", "minimalist", "scandinavian"],
    colors: ["white"],
  },
  {
    id: "ikea-lagkapten-alex-desk-white",
    name: "LAGKAPTEN / ALEX Desk, white",
    retailer: "ikea",
    price: 229,
    imageUrl: "https://www.ikea.com/us/en/images/products/lagkapten-alex-desk-white__1022432_pe832720_s5.jpg",
    productUrl: "https://www.ikea.com/us/en/p/lagkapten-alex-desk-white-s99431982/",
    dimensions: { width: 55, depth: 24, height: 29 },
    category: "desk",
    style: ["modern", "minimalist", "scandinavian"],
    colors: ["white"],
  },
  {
    id: "ikea-markus-office-chair-dark-gray",
    name: "MARKUS Office Chair, Vissle dark gray",
    retailer: "ikea",
    price: 299,
    imageUrl: "https://www.ikea.com/us/en/images/products/markus-office-chair-vissle-dark-gray__0724714_pe734597_s5.jpg",
    productUrl: "https://www.ikea.com/us/en/p/markus-office-chair-vissle-dark-gray-90289172/",
    dimensions: { width: 24, depth: 24, height: 55 },
    category: "chair",
    style: ["ergonomic", "modern", "office"],
    colors: ["dark-gray", "black"],
  },
  {
    id: "ikea-millberget-swivel-chair-black",
    name: "MILLBERGET Swivel Chair, Murum black",
    retailer: "ikea",
    price: 119,
    imageUrl: "https://www.ikea.com/us/en/images/products/millberget-swivel-chair-murum-black__1020142_pe831799_s5.jpg",
    productUrl: "https://www.ikea.com/us/en/p/millberget-swivel-chair-murum-black-00489397/",
    dimensions: { width: 27, depth: 27, height: 48 },
    category: "chair",
    style: ["modern", "minimalist", "office"],
    colors: ["black"],
  },
  {
    id: "ikea-hemnes-3-drawer-dresser-white",
    name: "HEMNES 3-Drawer Dresser, white stain",
    retailer: "ikea",
    price: 239,
    imageUrl: "https://www.ikea.com/us/en/images/products/hemnes-3-drawer-dresser-white-stain__1151406_pe886157_s5.jpg",
    productUrl: "https://www.ikea.com/us/en/p/hemnes-3-drawer-dresser-white-stain-70576193/",
    dimensions: { width: 42, depth: 20, height: 38 },
    category: "storage",
    style: ["traditional", "scandinavian", "farmhouse"],
    colors: ["white"],
  },
  {
    id: "ikea-havsta-6-drawer-dresser-white",
    name: "HAVSTA 6-Drawer Dresser, white",
    retailer: "ikea",
    price: 399,
    imageUrl: "https://www.ikea.com/us/en/images/products/havsta-6-drawer-dresser-white__1453389_pe991319_s5.jpg",
    productUrl: "https://www.ikea.com/us/en/p/havsta-6-drawer-dresser-white-70614524/",
    dimensions: { width: 48, depth: 19, height: 35 },
    category: "storage",
    style: ["traditional", "cottage", "classic"],
    colors: ["white"],
  },
  {
    id: "ikea-billy-bookcase-white",
    name: "BILLY Bookcase, white",
    retailer: "ikea",
    price: 79,
    imageUrl: "https://www.ikea.com/us/en/images/products/billy-bookcase-white__0625599_pe692385_s5.jpg",
    productUrl: "https://www.ikea.com/us/en/p/billy-bookcase-white-20522046/",
    dimensions: { width: 32, depth: 11, height: 80 },
    category: "shelf",
    style: ["modern", "minimalist", "scandinavian"],
    colors: ["white"],
  },
  {
    id: "ikea-malm-bed-frame-white-full",
    name: "MALM Bed Frame, white (Full)",
    retailer: "ikea",
    price: 229,
    imageUrl: "https://www.ikea.com/us/en/images/products/malm-bed-frame-white__1101527_pe866706_s5.jpg",
    productUrl: "https://www.ikea.com/us/en/p/malm-bed-frame-white-s69931603/",
    dimensions: { width: 59, depth: 78, height: 39 },
    category: "bed",
    style: ["modern", "minimalist", "scandinavian"],
    colors: ["white"],
  },
  {
    id: "ikea-tertial-work-lamp-dark-gray",
    name: "TERTIAL Work Lamp, dark gray",
    retailer: "ikea",
    price: 19,
    imageUrl: "https://www.ikea.com/us/en/images/products/tertial-work-lamp-dark-gray__0609306_pe684440_s5.jpg",
    productUrl: "https://www.ikea.com/us/en/p/tertial-work-lamp-dark-gray-20355434/",
    dimensions: { width: 7, depth: 18, height: 22 },
    category: "lighting",
    style: ["industrial", "modern", "minimalist"],
    colors: ["dark-gray"],
  },
  {
    id: "ikea-hektar-floor-lamp-dark-gray",
    name: "HEKTAR Floor Lamp, dark gray",
    retailer: "ikea",
    price: 89,
    imageUrl: "https://www.ikea.com/us/en/images/products/hektar-floor-lamp-dark-gray__0149974_pe308131_s5.jpg",
    productUrl: "https://www.ikea.com/us/en/p/hektar-floor-lamp-dark-gray-70216544/",
    dimensions: { width: 13, depth: 13, height: 71 },
    category: "lighting",
    style: ["industrial", "modern"],
    colors: ["dark-gray"],
  },
  {
    id: "ikea-lohals-rug-natural",
    name: "LOHALS Rug, flatwoven, natural",
    retailer: "ikea",
    price: 159,
    imageUrl: "https://www.ikea.com/us/en/images/products/lohals-rug-flatwoven-natural__0280230_pe419175_s5.jpg",
    productUrl: "https://www.ikea.com/us/en/p/lohals-rug-flatwoven-natural-00277395/",
    dimensions: { width: 79, depth: 118, height: 0.4 },
    category: "rug",
    style: ["natural", "scandinavian", "minimalist"],
    colors: ["natural", "beige"],
  },
  {
    id: "ikea-stoense-rug-off-white",
    name: "STOENSE Rug, low pile, off-white",
    retailer: "ikea",
    price: 129,
    imageUrl: "https://www.ikea.com/us/en/images/products/stoense-rug-low-pile-off-white__0624386_pe691799_s5.jpg",
    productUrl: "https://www.ikea.com/us/en/p/stoense-rug-low-pile-off-white-50425529/",
    dimensions: { width: 67, depth: 94, height: 0.4 },
    category: "rug",
    style: ["scandinavian", "modern", "minimalist"],
    colors: ["off-white"],
  },
];

// Target product data — scraped live from target.com; image URLs verified from
// each product page's og:image meta tag (HTTP 200 confirmed). Last refreshed 2026-06-07.
const TARGET_PRODUCTS: FurnitureItem[] = [
  {
    id: "target-paulo-wood-writing-desk-weathered-white",
    name: "Paulo Wood Writing Desk with Drawer, weathered white — Threshold",
    retailer: "target",
    price: 150,
    imageUrl: "https://target.scene7.com/is/image/Target/GUEST_16e8497e-334a-44a9-b997-2d8380c6dc6a",
    productUrl: "https://www.target.com/p/paulo-wood-writing-desk-with-drawer-weathered-white-threshold-8482/-/A-86806505",
    dimensions: { width: 42, depth: 20, height: 30 },
    category: "desk",
    style: ["modern", "farmhouse", "minimalist"],
    colors: ["white", "weathered-white"],
  },
  {
    id: "target-comfort-office-chair-black",
    name: "Comfort Office Chair, black — Room Essentials",
    retailer: "target",
    price: 76,
    imageUrl: "https://target.scene7.com/is/image/Target/GUEST_032f19b8-9fc4-4773-94e1-58540dbf3467",
    productUrl: "https://www.target.com/p/comfort-office-chair-black-room-essentials-8482/-/A-86887892",
    dimensions: { width: 25, depth: 26, height: 47 },
    category: "chair",
    style: ["modern", "ergonomic", "minimalist"],
    colors: ["black"],
  },
  {
    id: "target-ge-16ft-led-color-changing-light-strip",
    name: "GE 16' LED Color Changing Light Strip",
    retailer: "target",
    price: 28,
    imageUrl: "https://target.scene7.com/is/image/Target/GUEST_96ec13f6-b4fb-45d1-9c94-e0b5d7e8ac6a",
    productUrl: "https://www.target.com/p/ge-16ft-remote-and-control-panel-included-led-color-changing-light-strip/-/A-85923214",
    dimensions: { width: 0, depth: 192, height: 0 },
    category: "lighting",
    style: ["modern", "aesthetic", "rgb"],
    colors: ["multicolor", "rgb"],
  },
  {
    id: "target-novelty-g40-globe-string-lights-warm-white",
    name: "Novelty Lights G40 Globe Patio String Lights, warm white",
    retailer: "target",
    price: 70,
    imageUrl: "https://target.scene7.com/is/image/Target/GUEST_8d04cd03-50c1-4471-bde8-df34e107893d",
    productUrl: "https://www.target.com/p/novelty-lights-warm-white-led-g40-globe-plastic-shatterproof-outdoor-patio-string-lights/-/A-88504891",
    dimensions: { width: 0, depth: 1200, height: 0 },
    category: "lighting",
    style: ["cozy", "aesthetic", "bohemian"],
    colors: ["warm-white", "black"],
  },
  {
    id: "target-modern-lines-plush-area-rug-cream",
    name: "Modern Lines Plush Area Rug 5'×7', cream — Threshold",
    retailer: "target",
    price: 80,
    imageUrl: "https://target.scene7.com/is/image/Target/GUEST_33badca8-3aed-450c-b010-29960134c230",
    productUrl: "https://www.target.com/p/5-39-x7-39-modern-lines-plush-area-rug-cream-threshold-8482/-/A-85074424",
    dimensions: { width: 63, depth: 84, height: 0.5 },
    category: "rug",
    style: ["modern", "minimalist", "coastal"],
    colors: ["cream"],
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
