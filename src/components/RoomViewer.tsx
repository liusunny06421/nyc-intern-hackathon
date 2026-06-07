"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Loader2, Box, Info, ExternalLink } from "lucide-react";
import Image from "next/image";
import { DEMO_WORLD } from "@/lib/demo-world";

// WebGL viewer is client-only (no SSR)
const MeshViewer = dynamic(() => import("@/components/MeshViewer"), { ssr: false });

interface Props {
  sceneUrl?: string;   // Marble full viewer (opens in new tab)
  meshUrl?: string;    // .glb collider mesh (rendered in-page)
  thumbnailUrl?: string;
  photos: string[];
  generating: boolean;
  dimensions?: { width: number; length: number; height: number };
  floorPlanUrl?: string;
  roomNumber?: string;
}

export default function RoomViewer({ sceneUrl, meshUrl, thumbnailUrl, photos, generating, dimensions, floorPlanUrl, roomNumber }: Props) {
  const has3D = !generating && !!meshUrl;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Main 3D viewer */}
      <div className="lg:col-span-2">
        <div className="relative w-full aspect-video rounded-xl border border-border bg-card overflow-hidden">
          {generating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card/90 z-10">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--color-rose)" }} />
              <p className="text-sm text-muted-foreground">Generating 3D world via World Labs Marble…</p>
              <p className="text-xs text-muted-foreground/60">This can take a few minutes — your reference photo is shown meanwhile</p>
            </div>
          )}

          {has3D ? (
            <MeshViewer spzUrl={DEMO_WORLD.spzUrl!} meshUrl={meshUrl!} />
          ) : thumbnailUrl && !generating ? (
            <Image src={thumbnailUrl} alt="Room thumbnail" fill className="object-cover" />
          ) : photos[0] ? (
            <div className="relative w-full h-full">
              <Image src={photos[0]} alt="Room photo" fill className="object-cover" />
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-black/60 text-white border-0 text-xs backdrop-blur-sm">
                  Reference photo{generating ? " · 3D generating…" : ""}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <Box className="h-12 w-12 opacity-20" />
              <p className="text-sm">Loading room data…</p>
            </div>
          )}
        </div>

        {has3D && (
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Drag to rotate · Scroll to zoom · Right-click to pan
            </p>
            {sceneUrl && (
              <a
                href={sceneUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border transition-colors hover:bg-accent/10"
                style={{ color: "var(--color-rose)", borderColor: "var(--color-rose)" }}
              >
                Open full world in Marble <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Sidebar: room info + photo strip */}
      <div className="flex flex-col gap-4">
        {dimensions && (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Room Dimensions</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Width", value: `${dimensions.width}′` },
                { label: "Length", value: `${dimensions.length}′` },
                { label: "Height", value: `${dimensions.height}′` },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-secondary p-2">
                  <div className="text-lg font-mono font-bold text-primary">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Floor plan */}
        {floorPlanUrl && (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Floor Plan</span>
              {roomNumber && (
                <Badge variant="secondary" className="text-xs font-mono">{roomNumber}</Badge>
              )}
            </div>
            <a href={floorPlanUrl} target="_blank" rel="noopener noreferrer" className="block relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-white">
              <Image src={floorPlanUrl} alt="Floor plan" fill className="object-contain" />
            </a>
            <p className="text-xs text-muted-foreground mt-2">
              Official Columbia Housing plan · click to enlarge
            </p>
          </div>
        )}

        {/* Photo strip */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium mb-3">Reference Photos</p>
          <div className="flex flex-col gap-2">
            {photos.length > 0 ? (
              photos.map((url, i) => (
                <div key={i} className="relative w-full aspect-video rounded-lg overflow-hidden bg-secondary">
                  <Image src={url} alt={`Room photo ${i + 1}`} fill className="object-cover" />
                </div>
              ))
            ) : (
              <>
                <Skeleton className="w-full aspect-video rounded-lg" />
                <Skeleton className="w-full aspect-video rounded-lg" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
