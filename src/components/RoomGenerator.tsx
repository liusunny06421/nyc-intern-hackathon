"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  Upload, Sparkles, X, ImagePlus, Loader2, ExternalLink, RotateCcw,
  Box, ShoppingBag, Check, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InspirationPanel from "@/components/InspirationPanel";
import ShoppingPanel from "@/components/ShoppingPanel";
import { DEMO_WORLD } from "@/lib/demo-world";

const MeshViewer = dynamic(() => import("@/components/MeshViewer"), { ssr: false });

type Phase = "idle" | "generating" | "done" | "error";

interface World {
  meshUrl?: string;
  sceneUrl?: string;
  thumbnailUrl?: string;
  caption?: string;
}

// Rotating status copy while World Labs actually works (real, not faked timing).
const STATUS_MESSAGES = [
  "Uploading your photos…",
  "Analyzing room geometry & scale…",
  "Reconstructing walls, floor, and unseen corners…",
  "Generating navigable 3D world · World Labs Marble…",
  "Texturing surfaces…",
  "Almost there — finalizing your world…",
];

// A typical dorm footprint, used so the Shop tab can recommend furniture that
// roughly fits. (We don't know the real dimensions from a photo alone.)
const ESTIMATED_DIMENSIONS = { width: 12, length: 14, height: 9 };

export default function RoomGenerator() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [world, setWorld] = useState<World | null>(null);
  const [error, setError] = useState("");
  const [statusIdx, setStatusIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [activeTab, setActiveTab] = useState("3d");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    setImages((prev) => {
      const room = 6 - prev.length;
      const next = accepted.slice(0, room).map((file) => ({ file, preview: URL.createObjectURL(file) }));
      return [...prev, ...next];
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 6,
    disabled: phase === "generating" || images.length >= 6,
  });

  const removeImage = (i: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[i].preview);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const cleanupTimers = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
  };
  useEffect(() => cleanupTimers, []);

  // Single elapsed counter; status copy advances roughly every 8s.
  useEffect(() => {
    if (phase !== "generating") return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);
  useEffect(() => {
    setStatusIdx(Math.min(Math.floor(elapsed / 8), STATUS_MESSAGES.length - 1));
  }, [elapsed]);

  async function generate() {
    if (images.length === 0) return;
    setPhase("generating");
    setError("");
    setStatusIdx(0);
    setElapsed(0);

    try {
      const form = new FormData();
      images.forEach((img) => form.append("photos", img.file, img.file.name));
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.error || !data.operationId) throw new Error(data.error || "Failed to start generation");

      // Poll for completion
      pollRef.current = setInterval(async () => {
        try {
          const sres = await fetch(`/api/generate/status?operationId=${data.operationId}`);
          const sdata = await sres.json();
          if (sdata.status === "done") {
            cleanupTimers();
            setWorld({ meshUrl: sdata.meshUrl, sceneUrl: sdata.sceneUrl, thumbnailUrl: sdata.thumbnailUrl, caption: sdata.caption });
            setPhase("done");
          } else if (sdata.status === "failed" || sdata.error) {
            cleanupTimers();
            setError(sdata.error || "World generation failed. Try a clearer, wider photo.");
            setPhase("error");
          }
        } catch {
          /* keep polling through transient errors */
        }
      }, 5000);
    } catch (e) {
      cleanupTimers();
      setError(e instanceof Error ? e.message : "Something went wrong");
      setPhase("error");
    }
  }

  const reset = () => {
    cleanupTimers();
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    setWorld(null);
    setError("");
    setPhase("idle");
    setActiveTab("3d");
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // ─────────────────────────────── DONE: results with tabs ───────────────────────────────
  if (phase === "done" && world) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="3d" className="gap-1.5"><Box className="h-3.5 w-3.5" /> 3D World</TabsTrigger>
              <TabsTrigger value="style" className="gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Style It</TabsTrigger>
              <TabsTrigger value="shop" className="gap-1.5"><ShoppingBag className="h-3.5 w-3.5" /> Shop</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={reset}>
              <RotateCcw className="h-3.5 w-3.5" /> New room
            </Button>
          </div>

          <TabsContent value="3d">
            <div className="relative w-full aspect-video rounded-xl border border-border bg-card overflow-hidden">
              {world.meshUrl ? (
                <MeshViewer spzUrl={DEMO_WORLD.spzUrl!} meshUrl={world.meshUrl} />
              ) : world.thumbnailUrl ? (
                <Image src={world.thumbnailUrl} alt="Generated world" fill className="object-cover" />
              ) : null}
              <Badge className="absolute top-3 left-3 gap-1 border-0 text-white" style={{ background: "oklch(0.52 0.07 145)" }}>
                <Check className="h-3 w-3" /> Live world generated
              </Badge>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground max-w-xl">
                {world.meshUrl ? "Drag to rotate · Scroll to zoom · Right-click to pan" : world.caption}
              </p>
              {world.sceneUrl && (
                <a href={world.sceneUrl} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border transition-colors"
                  style={{ color: "var(--color-rose)", borderColor: "var(--color-rose)" }}>
                  Open full world in Marble <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </TabsContent>

          <TabsContent value="style">
            <InspirationPanel roomNumber="my-room" dimensions={ESTIMATED_DIMENSIONS} onStylesDetected={() => setActiveTab("shop")} />
          </TabsContent>

          <TabsContent value="shop">
            <ShoppingPanel roomNumber="my-room" dimensions={ESTIMATED_DIMENSIONS} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // ─────────────────────────────── GENERATING ───────────────────────────────
  if (phase === "generating") {
    const hero = images[0]?.preview;
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="relative w-full aspect-video rounded-xl border border-border bg-card overflow-hidden">
          {hero && <Image src={hero} alt="Processing" fill className="object-cover opacity-40" />}
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "linear-gradient(oklch(0.70 0.09 12/.4) 1px,transparent 1px),linear-gradient(90deg,oklch(0.70 0.09 12/.4) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/50 backdrop-blur-[1px] px-6 text-center">
            <Loader2 className="h-9 w-9 animate-spin" style={{ color: "var(--color-rose)" }} />
            <p className="text-sm font-medium">{STATUS_MESSAGES[statusIdx]}</p>
            <p className="text-xs font-mono text-muted-foreground">{fmt(elapsed)} elapsed · usually 1–3 min</p>
            <div className="w-56 h-1 rounded-full bg-secondary overflow-hidden mt-1">
              <div className="h-full w-1/3 rounded-full animate-pulse" style={{ background: "var(--color-rose)" }} />
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3">
          Generating from {images.length} photo{images.length > 1 ? "s" : ""} with World Labs Marble. Keep this tab open.
        </p>
      </div>
    );
  }

  // ─────────────────────────────── IDLE / ERROR: upload ───────────────────────────────
  return (
    <div className="w-full max-w-2xl mx-auto">
      {phase === "error" && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border p-3 text-sm"
          style={{ borderColor: "oklch(0.40 0.14 15 / 0.4)", background: "oklch(0.40 0.14 15 / 0.08)", color: "var(--color-burgundy)" }}>
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-card"
        } ${images.length >= 6 ? "opacity-60" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="h-14 w-14 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: "oklch(0.70 0.09 12 / 0.12)" }}>
          <Upload className="h-7 w-7" style={{ color: "var(--color-rose)" }} />
        </div>
        <p className="text-base font-medium">
          {isDragActive ? "Drop your photos" : "Upload photos of your dorm room"}
        </p>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          One photo works; a few from different angles makes a better 3D world. Up to 6.
        </p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-4">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden group bg-secondary">
              <Image src={img.preview} alt={`Photo ${i + 1}`} fill className="object-cover" />
              {i === 0 && (
                <Badge className="absolute bottom-1 left-1 text-[10px] border-0 text-white" style={{ background: "oklch(0.70 0.09 12)" }}>
                  primary
                </Badge>
              )}
              <button onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
          {images.length < 6 && (
            <div {...getRootProps()} className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
              <ImagePlus className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
      )}

      <Button size="lg" className="w-full mt-5 gap-2 h-12" disabled={images.length === 0} onClick={generate}>
        <Sparkles className="h-4 w-4" />
        Generate my 3D room
      </Button>
      <p className="text-center text-xs text-muted-foreground mt-2">
        Powered by World Labs Marble · generation takes 1–3 minutes
      </p>
    </div>
  );
}
