import demoWorld from "@/data/demo-world.json";

export interface DemoWorld {
  roomNumber: string;
  worldId: string | null;
  displayName: string;
  sceneUrl: string | null;       // Marble viewer URL (opens in new tab)
  meshUrl: string | null;        // local .glb collider mesh (rendered in-page)
  thumbnailUrl: string | null;
  caption?: string;
  panoUrl?: string | null;
  sourcePhoto: string;           // the photo the world was generated from
  bakedAt: string | null;
}

export const DEMO_WORLD = demoWorld as DemoWorld;

// Has a real World Labs world been baked yet?
export const isWorldBaked = () => Boolean(DEMO_WORLD.bakedAt && (DEMO_WORLD.meshUrl || DEMO_WORLD.sceneUrl));
