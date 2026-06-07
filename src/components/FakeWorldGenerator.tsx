"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Upload, Sparkles, Check, ExternalLink, RotateCcw, Box, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DEMO_WORLD, isWorldBaked } from "@/lib/demo-world";

const MeshViewer = dynamic(() => import("@/components/MeshViewer"), { ssr: false });

type Phase = "idle" | "working" | "done";

// Staged "generation" steps — purely cosmetic, but they sell the illusion.
const STEPS = [
  { label: "Uploading photo…", pct: 12, ms: 1400 },
  { label: "Detecting room geometry & scale…", pct: 34, ms: 2200 },
  { label: "Reconstructing unseen walls and corners…", pct: 58, ms: 2600 },
  { label: "Generating 3D world · World Labs Marble…", pct: 82, ms: 2600 },
  { label: "Finalizing navigable scene…", pct: 100, ms: 1400 },
];

interface Props {
  roomNumber: string;
  dimensions?: { width: number; length: number; height: number };
  floorPlanUrl?: string;
  photos?: string[];
}

export default function FakeWorldGenerator({ roomNumber, dimensions, floorPlanUrl, photos = [] }: Props) {
  const [phase, setPhase] = useState<Phase>("done");
  const [preview, setPreview] = useState<string | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [pct, setPct] = useState(0);
  const [meshUrl, setMeshUrl] = useState<string | null>(null);
  const [sceneUrl, setSceneUrl] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsed = useRef(0);

  const baked = isWorldBaked();

  const clearGenerationTimers = useCallback(() => {
    if (pollTimer.current) clearInterval(pollTimer.current);
    if (tickTimer.current) clearInterval(tickTimer.current);
    pollTimer.current = null;
    tickTimer.current = null;
  }, []);

  const runIllusion = useCallback(() => {
    setPhase("working");
    setStepIdx(0);
    setPct(0);
    let acc = 0;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    STEPS.forEach((step, i) => {
      acc += step.ms;
      timers.current.push(
        setTimeout(() => {
          setStepIdx(i);
          setPct(step.pct);
          if (i === STEPS.length - 1) {
            timers.current.push(setTimeout(() => setPhase("done"), 700));
          }
        }, acc - step.ms + 50)
      );
    });
  }, []);

  // Maps elapsed seconds of real polling onto the cosmetic STEPS timeline.
  const stepForElapsed = (sec: number) => {
    if (sec < 15) return 0;
    if (sec < 30) return 1;
    if (sec < 60) return 2;
    return 3;
  };

  const pollGeneration = useCallback((operationId: string) => {
    elapsed.current = 0;
    setStepIdx(0);
    setPct(STEPS[0].pct);

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/generate/status?operationId=${encodeURIComponent(operationId)}`);
        const data = await res.json();
        if (data.status === "done") {
          clearGenerationTimers();
          setStepIdx(STEPS.length - 1);
          setPct(100);
          setMeshUrl(data.meshUrl ?? null);
          setSceneUrl(data.sceneUrl ?? null);
          timers.current.push(setTimeout(() => setPhase("done"), 700));
        } else if (data.status === "failed") {
          clearGenerationTimers();
          setGenError(data.error || "Generation failed.");
          timers.current.push(
            setTimeout(() => {
              setGenError(null);
              setPhase("idle");
            }, 4000)
          );
        }
        // "pending" / "processing" — keep polling, ticker drives the UI.
      } catch {
        // transient network hiccup — keep polling on the next tick
      }
    };

    tickTimer.current = setInterval(() => {
      elapsed.current += 1;
      const idx = stepForElapsed(elapsed.current);
      setStepIdx(idx);
      setPct(STEPS[idx].pct);
    }, 1000);

    pollTimer.current = setInterval(checkStatus, 8000);
    checkStatus();
  }, [clearGenerationTimers]);

  const startGeneration = useCallback(async (file: File) => {
    setPhase("working");
    setStepIdx(0);
    setPct(0);
    setMeshUrl(null);
    setSceneUrl(null);
    setGenError(null);
    timers.current.forEach(clearTimeout);
    timers.current = [];
    clearGenerationTimers();

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/generate", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.operationId) {
        // No API key configured, or the upstream call failed — fall back to the demo illusion.
        runIllusion();
        return;
      }
      pollGeneration(data.operationId);
    } catch {
      runIllusion();
    }
  }, [clearGenerationTimers, pollGeneration, runIllusion]);

  const onDrop = useCallback((files: File[]) => {
    if (!files[0]) return;
    setPreview(URL.createObjectURL(files[0]));
    startGeneration(files[0]);
  }, [startGeneration]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    disabled: phase === "working",
  });

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    clearGenerationTimers();
  }, [clearGenerationTimers]);

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    timers.current.forEach(clearTimeout);
    timers.current = [];
    clearGenerationTimers();
    setPreview(null);
    setMeshUrl(null);
    setSceneUrl(null);
    setGenError(null);
    setPhase("idle");
  };

  // The image shown during/after generation: the user's upload, or the demo source photo.
  const displayPhoto = preview ?? DEMO_WORLD.sourcePhoto;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <div className="relative w-full aspect-video rounded-xl border border-border bg-card overflow-hidden">
          {/* IDLE — fake upload dropzone */}
          {phase === "idle" && (
            <div
              {...getRootProps()}
              className={`absolute inset-0 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
                isDragActive ? "bg-primary/5" : "hover:bg-card"
              }`}
            >
              <input {...getInputProps()} />
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center" style={{ background: "oklch(0.70 0.09 12 / 0.12)" }}>
                <Upload className="h-7 w-7" style={{ color: "var(--color-rose)" }} />
              </div>
              <p className="text-base font-medium">
                {isDragActive ? "Drop your room photo" : "Upload a photo of your room"}
              </p>
              <p className="text-sm text-muted-foreground max-w-xs text-center">
                We&apos;ll reconstruct a navigable 3D world from a single photo — including walls you didn&apos;t capture.
              </p>
              <Badge variant="secondary" className="mt-1 gap-1 text-xs font-mono">
                <Sparkles className="h-3 w-3" style={{ color: "var(--color-rose)" }} /> Powered by World Labs Marble
              </Badge>
            </div>
          )}

          {/* WORKING — staged progress over the uploaded photo */}
          {phase === "working" && (
            <>
              <Image src={displayPhoto} alt="Processing" fill className="object-cover opacity-40" />
              {/* Scan-line sweep */}
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className="absolute left-0 right-0 h-24 blur-xl"
                  style={{
                    top: `${pct}%`,
                    background: "linear-gradient(to bottom, transparent, oklch(0.70 0.09 12 / 0.5), transparent)",
                    transition: "top 1.6s ease-in-out",
                  }}
                />
                {/* wireframe grid hint */}
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: "linear-gradient(oklch(0.70 0.09 12/.4) 1px,transparent 1px),linear-gradient(90deg,oklch(0.70 0.09 12/.4) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/40 backdrop-blur-[1px]">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--color-rose)" }} />
                <p className="text-sm font-medium">{STEPS[stepIdx].label}</p>
                <div className="w-64 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-[1600ms] ease-out"
                    style={{ width: `${pct}%`, background: "var(--color-rose)" }} />
                </div>
                <p className="text-xs font-mono text-muted-foreground">{pct}%</p>
                {genError && (
                  <p className="text-xs font-mono text-destructive max-w-xs text-center px-4">{genError}</p>
                )}
              </div>
            </>
          )}

          {/* DONE — reveal the generated world (or the pre-baked demo as fallback) */}
          {phase === "done" && (
            meshUrl || (baked && DEMO_WORLD.meshUrl) ? (
              <MeshViewer url={meshUrl ?? DEMO_WORLD.meshUrl!} />
            ) : (
              <div className="relative w-full h-full">
                <Image src={DEMO_WORLD.thumbnailUrl || displayPhoto} alt="Generated world" fill className="object-cover" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <Badge className="gap-1 text-xs border-0 text-white" style={{ background: "oklch(0.52 0.07 145)" }}>
                    <Check className="h-3 w-3" /> 3D world ready
                  </Badge>
                </div>
              </div>
            )
          )}
        </div>

        {/* Caption / controls under the viewer */}
        {phase === "done" && (
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {meshUrl || (baked && DEMO_WORLD.meshUrl) ? "Drag to rotate · Scroll to zoom · Right-click to pan" : DEMO_WORLD.caption}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={reset} className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border border-border hover:bg-accent/10 transition-colors">
                <RotateCcw className="h-3 w-3" /> Try another
              </button>
              {(sceneUrl || DEMO_WORLD.sceneUrl) && (
                <a href={sceneUrl ?? DEMO_WORLD.sceneUrl!} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border transition-colors"
                  style={{ color: "var(--color-rose)", borderColor: "var(--color-rose)" }}>
                  Open full world in Marble <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Box className="h-4 w-4" style={{ color: "var(--color-rose)" }} />
            <span className="text-sm font-medium">How it works</span>
          </div>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Upload one photo of your room</li>
            <li>World Labs reconstructs the full 3D space</li>
            <li>Walk through it — even unseen corners</li>
            <li>Drop in furniture and shop what fits</li>
          </ol>
        </div>

        {!baked && (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-4 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Demo note:</span> a real World Labs world hasn&apos;t been baked yet.
            Run <code className="font-mono">bake-world.mjs</code> with the room photo to replace this reveal with a live 3D mesh.
          </div>
        )}

        {dimensions && (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium mb-3">Room Dimensions</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Width", value: `${dimensions.width}′` },
                { label: "Length", value: `${dimensions.length}′` },
                { label: "Height", value: `${dimensions.height}′` },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-secondary p-2">
                  <div className="text-lg font-mono font-bold" style={{ color: "var(--color-rose)" }}>{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {floorPlanUrl && (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Floor Plan</span>
              <Badge variant="secondary" className="text-xs font-mono">{roomNumber}</Badge>
            </div>
            <a href={floorPlanUrl} target="_blank" rel="noopener noreferrer" className="block relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-white">
              <Image src={floorPlanUrl} alt="Floor plan" fill className="object-contain" />
            </a>
            <p className="text-xs text-muted-foreground mt-2">Official Columbia Housing plan · click to enlarge</p>
          </div>
        )}
      </div>
    </div>
  );
}
