// ─────────────────────────────────────────────────────────────────────────────
// Broadway Hall — room-level ground truth
// Source: Columbia Housing official floor plans (floors 3–13), scraped from
//   roomselection.housing.columbia.edu and parsed room-by-room.
//   Floor plan images: /public/reference/broadway/floorplans/floor-NN.jpg
//   Room photos:       /public/reference/broadway/403A*.jpg.webp (2023 Refresh)
//
// This is the "building-specific ground truth" wedge: exact room number → type +
// square footage, taken directly from the published plans.
// ─────────────────────────────────────────────────────────────────────────────

export type RoomType = "single" | "double";

export interface BroadwayRoom {
  room: string;        // full room number, e.g. "705"
  floor: number;
  type: RoomType;
  sqft: number;
  // Estimated rectangular footprint (feet) derived from sqft, ~9ft ceilings.
  dimensions: { width: number; length: number; height: number };
}

const CEILING_FT = 9;

// Derive a plausible rectangle from square footage (dorms are ~1:1.3 aspect).
function dims(sqft: number) {
  const width = Math.round(Math.sqrt(sqft / 1.3) * 10) / 10;
  const length = Math.round((sqft / width) * 10) / 10;
  return { width, length, height: CEILING_FT };
}

// Last-two-digits → { type, sqft } for the standard "tower" floors (6–13).
// Verified identical across floors 6, 7, 8, 9, 10, 11, 12, 13.
type Spec = { type: RoomType; sqft: number };
const TOWER: Record<string, Spec> = {
  "01": { type: "single", sqft: 103 },
  "03": { type: "single", sqft: 102 },
  "05": { type: "single", sqft: 102 },
  "07": { type: "single", sqft: 134 },
  "09": { type: "single", sqft: 102 },
  "11": { type: "single", sqft: 105 },
  "13": { type: "single", sqft: 103 },
  "14": { type: "single", sqft: 108 },
  "15": { type: "single", sqft: 103 },
  "16": { type: "single", sqft: 109 },
  "18": { type: "single", sqft: 125 },
  "19": { type: "single", sqft: 127 },
  "21": { type: "single", sqft: 111 },
  "22": { type: "double", sqft: 200 },
  "24": { type: "single", sqft: 114 },
  "25": { type: "single", sqft: 114 },
  "26": { type: "single", sqft: 114 },
  "27": { type: "single", sqft: 114 },
  "28": { type: "single", sqft: 107 },
  "29": { type: "single", sqft: 111 },
  "30": { type: "single", sqft: 105 },
  "31": { type: "single", sqft: 113 },
  "32": { type: "single", sqft: 105 },
  "33": { type: "single", sqft: 113 },
  "34": { type: "single", sqft: 107 },
  "35": { type: "single", sqft: 115 },
  "36": { type: "single", sqft: 107 },
  "38": { type: "single", sqft: 108 },
  "39": { type: "double", sqft: 165 },
  "40": { type: "double", sqft: 163 },
};

// Floor 5: Residential Program Apartment replaces 501/503; 505 & 507 differ.
const FLOOR5_OVERRIDE: Record<string, Spec | null> = {
  "01": null, // part of Residential Program Apartment
  "03": null, // part of Residential Program Apartment
  "05": { type: "single", sqft: 108 },
  "07": { type: "single", sqft: 102 },
};

// Floor 3 (base floor): full layout, 3xx series with a computer lab + extra lounges.
const FLOOR3: Record<string, Spec> = {
  "305": { type: "single", sqft: 154 },
  "307": { type: "single", sqft: 103 },
  "309": { type: "single", sqft: 101 },
  "311": { type: "single", sqft: 105 },
  "313": { type: "single", sqft: 102 },
  "314": { type: "single", sqft: 108 },
  "315": { type: "single", sqft: 102 },
  "316": { type: "single", sqft: 109 },
  "318": { type: "single", sqft: 125 },
  "319": { type: "single", sqft: 128 },
  "322": { type: "double", sqft: 200 },
  "324": { type: "single", sqft: 114 },
  "325": { type: "single", sqft: 118 },
  "326": { type: "single", sqft: 114 },
  "327": { type: "single", sqft: 114 },
  "328": { type: "single", sqft: 114 },
  "329": { type: "single", sqft: 111 },
  "330": { type: "single", sqft: 113 },
  "331": { type: "single", sqft: 113 },
  "332": { type: "single", sqft: 113 },
  "333": { type: "double", sqft: 150 },
  "334": { type: "single", sqft: 114 },
  "336": { type: "single", sqft: 107 },
  "338": { type: "single", sqft: 108 },
  "340": { type: "double", sqft: 214 },
  "342": { type: "single", sqft: 124 },
  "344": { type: "single", sqft: 109 },
  "346": { type: "single", sqft: 109 },
  "348": { type: "single", sqft: 109 },
  "350": { type: "single", sqft: 109 },
  "352": { type: "single", sqft: 122 },
  "354": { type: "single", sqft: 109 },
  "356": { type: "single", sqft: 103 },
};

// Floor 4 (base floor): adds corner doubles 402/456/439, 4xx series.
const FLOOR4: Record<string, Spec> = {
  "402": { type: "double", sqft: 206 },
  "405": { type: "single", sqft: 154 },
  "407": { type: "single", sqft: 103 },
  "409": { type: "single", sqft: 101 },
  "411": { type: "single", sqft: 105 },
  "413": { type: "single", sqft: 102 },
  "414": { type: "single", sqft: 108 },
  "415": { type: "single", sqft: 102 },
  "416": { type: "single", sqft: 109 },
  "418": { type: "single", sqft: 125 },
  "419": { type: "single", sqft: 128 },
  "422": { type: "double", sqft: 200 },
  "424": { type: "single", sqft: 114 },
  "425": { type: "single", sqft: 118 },
  "426": { type: "single", sqft: 114 },
  "427": { type: "single", sqft: 114 },
  "428": { type: "single", sqft: 107 },
  "429": { type: "single", sqft: 111 },
  "430": { type: "single", sqft: 105 },
  "431": { type: "single", sqft: 113 },
  "432": { type: "single", sqft: 105 },
  "433": { type: "double", sqft: 150 },
  "434": { type: "single", sqft: 107 },
  "436": { type: "single", sqft: 107 },
  "438": { type: "single", sqft: 108 },
  "439": { type: "double", sqft: 176 },
  "440": { type: "double", sqft: 162 },
  "442": { type: "single", sqft: 119 },
  "444": { type: "single", sqft: 109 },
  "446": { type: "single", sqft: 109 },
  "448": { type: "single", sqft: 109 },
  "450": { type: "single", sqft: 109 },
  "452": { type: "single", sqft: 122 },
  "454": { type: "single", sqft: 109 },
  "456": { type: "double", sqft: 173 },
};

const TOTAL_FLOORS = 13;

function specForRoom(floor: number, suffix: string): Spec | null {
  if (floor === 3) return FLOOR3[`3${suffix}`] ?? null;
  if (floor === 4) return FLOOR4[`4${suffix}`] ?? null;
  if (floor === 5) {
    if (suffix in FLOOR5_OVERRIDE) return FLOOR5_OVERRIDE[suffix];
    return TOWER[suffix] ?? null;
  }
  return TOWER[suffix] ?? null; // floors 6–13
}

/** Look up a single room by its full number, e.g. "705" or "1233". */
export function getBroadwayRoom(roomNumber: string): BroadwayRoom | null {
  const m = roomNumber.match(/^(\d{1,2})(\d{2})$/);
  if (!m) return null;
  const floor = parseInt(m[1], 10);
  const suffix = m[2];
  if (floor < 3 || floor > TOTAL_FLOORS) return null;

  const spec = specForRoom(floor, suffix);
  if (!spec) return null;

  return {
    room: roomNumber,
    floor,
    type: spec.type,
    sqft: spec.sqft,
    dimensions: dims(spec.sqft),
  };
}

/** All rooms on a given floor. */
export function getFloorRooms(floor: number): BroadwayRoom[] {
  const rooms: BroadwayRoom[] = [];
  // Try every plausible suffix for this floor.
  const suffixes =
    floor === 3 ? Object.keys(FLOOR3).map((r) => r.slice(1))
    : floor === 4 ? Object.keys(FLOOR4).map((r) => r.slice(1))
    : Object.keys(TOWER);
  for (const suffix of suffixes) {
    const room = `${floor}${suffix}`;
    const r = getBroadwayRoom(room);
    if (r) rooms.push(r);
  }
  return rooms.sort((a, b) => parseInt(a.room) - parseInt(b.room));
}

/** Every room in Broadway Hall. */
export function getAllBroadwayRooms(): BroadwayRoom[] {
  const all: BroadwayRoom[] = [];
  for (let f = 3; f <= TOTAL_FLOORS; f++) all.push(...getFloorRooms(f));
  return all;
}

/** Floor-plan image path for a given floor. */
export function floorPlanPath(floor: number): string | null {
  if (floor < 3 || floor > TOTAL_FLOORS) return null;
  return `/reference/broadway/floorplans/floor-${String(floor).padStart(2, "0")}.jpg`;
}

// Curated real reference photos from the 2023 Refresh, by room type.
export const BROADWAY_PHOTOS: Record<RoomType, string[]> = {
  single: [
    "/reference/broadway/403A0105.jpg.webp", // Broadway Single
    "/reference/broadway/403A0180.jpg.webp", // Single room
  ],
  double: [
    "/reference/broadway/403A0141.jpg.webp", // Double room
    "/reference/broadway/403A0213_0.jpg.webp", // Double room
    "/reference/broadway/403A0203.jpg.webp", // Double room
  ],
};

export const BROADWAY_COMMON_PHOTOS = [
  "/reference/broadway/403A0890.jpg.webp", // lounge
  "/reference/broadway/403A1016.jpg.webp", // lobby
  "/reference/broadway/403A0829.jpg.webp", // shared kitchen
];
