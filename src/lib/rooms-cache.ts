import fs from "fs/promises";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), ".room-cache");

export interface CachedRoom {
  roomNumber: string;
  // World Labs generation state
  operationId?: string;
  worldId?: string;
  sceneUrl?: string;       // world_marble_url — full Marble viewer (opens in new tab)
  meshUrl?: string;        // collider_mesh_url (.glb) — rendered in-page via WebGL
  thumbnailUrl?: string;
  caption?: string;        // AI-generated scene description
  status?: "pending" | "done" | "failed";
  // Room data
  photos: string[];
  dimensions?: { width: number; length: number; height: number };
  sqft?: number;
  type: string;
  building: string;
  generatedAt?: string;
}

async function ensureCacheDir() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
}

export async function getCachedRoom(roomNumber: string): Promise<CachedRoom | null> {
  try {
    await ensureCacheDir();
    const data = await fs.readFile(path.join(CACHE_DIR, `${roomNumber.toUpperCase()}.json`), "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function setCachedRoom(room: CachedRoom): Promise<void> {
  await ensureCacheDir();
  await fs.writeFile(
    path.join(CACHE_DIR, `${room.roomNumber.toUpperCase()}.json`),
    JSON.stringify(room, null, 2)
  );
}
