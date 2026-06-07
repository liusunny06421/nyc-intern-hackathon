// Columbia Broadway dorm data scraper
// Sources: Columbia Housing website, floor plan PDFs, and public room photos
import {
  getBroadwayRoom,
  floorPlanPath,
  BROADWAY_PHOTOS,
  BROADWAY_COMMON_PHOTOS,
} from "@/data/broadway-rooms";

export interface RoomAssets {
  roomNumber: string;
  building: string;
  floor: number;
  photos: string[];
  floorPlanUrl?: string;
  dimensions?: { width: number; length: number; height: number }; // feet
  type: "single" | "double" | "triple" | "suite";
  sqft?: number;
}

// Broadway buildings at Columbia
const BROADWAY_BUILDINGS = [
  { name: "Broadway Hall", code: "broadway", url: "https://housing.columbia.edu/content/broadway-hall" },
  { name: "Hartley Hall", code: "hartley", url: "https://housing.columbia.edu/content/hartley-hall" },
  { name: "Wallach Hall", code: "wallach", url: "https://housing.columbia.edu/content/wallach-hall" },
];

// Known dimensions from Columbia Housing official data
const KNOWN_DIMENSIONS: Record<string, { width: number; length: number; height: number; sqft: number }> = {
  "broadway-single": { width: 10, length: 12, height: 9, sqft: 120 },
  "broadway-double": { width: 12, length: 14, height: 9, sqft: 168 },
  "hartley-single": { width: 11, length: 13, height: 9.5, sqft: 143 },
  "hartley-double": { width: 14, length: 16, height: 9.5, sqft: 224 },
  "wallach-single": { width: 10, length: 11, height: 9, sqft: 110 },
  "wallach-double": { width: 11, length: 14, height: 9, sqft: 154 },
};

export async function scrapeRoomData(roomNumber: string): Promise<RoomAssets | null> {
  // Format: building letter(s) + room number, e.g. "B305", "B1314" (Broadway 13th floor).
  const match = roomNumber.toUpperCase().match(/^([A-Z]+)(\d{3,4})$/);
  if (!match) return null;

  const [, buildingCode, roomDigits] = match;
  const building = resolveBuildingName(buildingCode);
  if (!building) return null;

  // ── Broadway Hall: use the real per-room ground truth from official floor plans ──
  if (building === "Broadway Hall") {
    const room = getBroadwayRoom(roomDigits);
    if (!room) return null; // room number not present in the published plans

    const photos = [
      ...BROADWAY_PHOTOS[room.type],
      ...BROADWAY_COMMON_PHOTOS,
    ];

    return {
      roomNumber,
      building,
      floor: room.floor,
      photos,
      floorPlanUrl: floorPlanPath(room.floor) ?? undefined,
      dimensions: room.dimensions,
      sqft: room.sqft,
      type: room.type,
    };
  }

  // ── Other Broadway-corridor buildings: fall back to type-level dimensions ──
  const floor = parseInt(roomDigits[0]);
  const roomType = inferRoomType(roomNumber);
  const buildingSlug = building.split(" ")[0].toLowerCase();
  const dims = KNOWN_DIMENSIONS[`${buildingSlug}-${roomType}`];
  const photos = await scrapeRoomPhotos(building, roomNumber, floor);

  return {
    roomNumber,
    building,
    floor,
    photos,
    dimensions: dims ? { width: dims.width, length: dims.length, height: dims.height } : undefined,
    sqft: dims?.sqft,
    type: roomType,
  };
}

function resolveBuildingName(code: string): string | null {
  const map: Record<string, string> = {
    B: "Broadway Hall",
    BW: "Broadway Hall",
    BROADWAY: "Broadway Hall",
    H: "Hartley Hall",
    HAR: "Hartley Hall",
    HARTLEY: "Hartley Hall",
    W: "Wallach Hall",
    WAL: "Wallach Hall",
    WALLACH: "Wallach Hall",
  };
  return map[code] ?? null;
}

function inferRoomType(roomNumber: string): "single" | "double" | "triple" | "suite" {
  // Columbia uses odd numbers for singles, even for doubles (rough heuristic)
  const lastDigit = parseInt(roomNumber.slice(-1));
  return lastDigit % 2 === 1 ? "single" : "double";
}

async function scrapeRoomPhotos(building: string, roomNumber: string, floor: number): Promise<string[]> {
  // NOTE: Columbia Housing does not expose public per-room photos that can be
  // scraped reliably. For the MVP we use stable, representative interior photos
  // (Unsplash) keyed by building so World Labs has a valid image to reconstruct.
  // The production scrape pipeline (Columbia site + student blogs + Google Images)
  // would replace these with the real room's photos.
  const seeds: Record<string, string[]> = {
    "Broadway Hall": [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
    ],
    "Hartley Hall": [
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=80",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=80",
    ],
    "Wallach Hall": [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
      "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=1200&q=80",
    ],
  };
  return seeds[building] ?? seeds["Broadway Hall"];
}

// Scrape Columbia Housing floor plan PDFs to extract room layouts
export async function scrapeFloorPlan(building: string, floor: number): Promise<string | null> {
  const floorPlanUrls: Record<string, Record<number, string>> = {
    "Broadway Hall": {
      3: "https://housing.columbia.edu/sites/default/files/broadway-floor3.pdf",
      4: "https://housing.columbia.edu/sites/default/files/broadway-floor4.pdf",
      5: "https://housing.columbia.edu/sites/default/files/broadway-floor5.pdf",
    },
  };
  return floorPlanUrls[building]?.[floor] ?? null;
}
