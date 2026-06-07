"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { fileToBase64 } from "@/lib/utils";
import Wordmark from "../components/Wordmark";
import RoomScene from "../components/RoomScene";
import StringLights from "../components/StringLights";
import IvyVine from "../components/IvyVine";
import {
  ArrowUpRight,
  ArrowRight,
  Building,
  Check,
  Cube,
  Upload,
  Sparkle,
  Pin,
  Smiley,
} from "../components/icons";

const SCHOOLS = ["Columbia", "Barnard", "NYU", "Cornell", "Fordham"];

// Broadway Hall is the building with real floor-plan + 3D ground truth wired up
// (building code "B" in the engine). Others are shown as coming-soon.
const BUILDINGS = [
  { name: "Broadway Hall", meta: "Mixed · floors 3–13 · live 3D", live: true },
  { name: "Carman Hall", meta: "First-year · 14 floors", live: false },
  { name: "John Jay Hall", meta: "First-year · 15 floors", live: false },
  { name: "Furnald Hall", meta: "First-year · 10 floors", live: false },
  { name: "Hartley Hall", meta: "Mixed · 8 floors", live: false },
  { name: "Wallach Hall", meta: "Upper · 10 floors", live: false },
];

const KEYWORDS = [
  "Minimalist",
  "Japandi",
  "Boho Cottage",
  "Mid-century",
  "Cottagecore",
  "Scandi",
  "Dark Academia",
  "Coastal",
  "Industrial",
  "Maximalist",
];

const SUGGESTED = new Set(["Japandi", "Minimalist", "Scandi"]);

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [school, setSchool] = useState("Columbia");
  const [building, setBuilding] = useState<string | null>(null);
  // Defaults point at the baked demo room (Broadway B1207) so the happy path
  // lands on the rich 3D world out of the box; users can change them.
  const [room, setRoom] = useState("1207");
  const [floor, setFloor] = useState("12");
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [keywords, setKeywords] = useState<string[]>(["Japandi"]);

  const steps = ["Building", "Room", "Inspiration"];
  const canNext =
    (step === 0 && !!building) ||
    (step === 1 && room.trim().length > 0 && floor.trim().length > 0) ||
    step === 2;

  // The engine resolves Broadway Hall rooms by code "B" + digits (e.g. "B1207").
  // Fall back to the baked demo room if the number is blank/invalid.
  const roomDigits = room.replace(/\D/g, "");
  const roomId = roomDigits ? `B${roomDigits}` : "B1207";
  const roomHref = `/room/${roomId}`;

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files)
      .slice(0, 6 - images.length)
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...next]);
  };
  const removeImage = (i: number) =>
    setImages((prev) => {
      URL.revokeObjectURL(prev[i].preview);
      return prev.filter((_, idx) => idx !== i);
    });

  // Analyze any uploaded inspo with Claude vision, then enter the room carrying
  // the detected/selected styles so the Shop tab recommends matching furniture.
  const enterRoom = async () => {
    setSubmitting(true);
    let styles = [...keywords];
    try {
      if (images.length > 0) {
        const payload = await Promise.all(
          images.map(async (img) => ({
            media_type: img.file.type || "image/jpeg",
            data: await fileToBase64(img.file),
          })),
        );
        const res = await fetch("/api/analyze-style", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images: payload }),
        });
        const data = await res.json();
        if (Array.isArray(data.styles) && data.styles.length) {
          styles = Array.from(new Set([...data.styles, ...keywords]));
        }
      }
    } catch {
      /* fall back to the manually-picked keywords */
    }
    const qs = styles.length ? `?styles=${encodeURIComponent(styles.join(","))}` : "";
    router.push(`${roomHref}${qs}`);
  };

  const toggleKeyword = (k: string) =>
    setKeywords((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]));

  return (
    <main className="relative flex min-h-[100dvh] flex-1 flex-col overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-[-6rem] -top-10 h-[30rem] w-[30rem] rounded-full bg-sun/22 blur-3xl animate-drift" />
        <div className="absolute -left-40 top-20 h-[30rem] w-[30rem] rounded-full bg-sky/22 blur-3xl animate-float-slower" />
        <div className="absolute -right-32 bottom-0 h-[30rem] w-[30rem] rounded-full bg-grass/12 blur-3xl animate-float-slower" />
      </div>

      {/* string lights + ivy */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0">
        <StringLights className="w-full" />
      </div>
      <div aria-hidden className="pointer-events-none absolute -right-2 top-0 z-0 hidden w-20 lg:block">
        <IvyVine flip />
      </div>

      {/* top bar */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-8">
        <Link href="/">
          <Wordmark className="h-7 w-auto" />
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-ink-soft transition-colors hover:text-navy"
        >
          Save &amp; exit
        </Link>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-10 px-4 pb-12 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:items-center">
        {/* ---------- left: context + live preview ---------- */}
        <div className="order-2 lg:order-1">
          <span className="inline-flex items-center gap-2 rounded-full bg-card/70 px-3 py-1 hairline backdrop-blur-sm">
            <Pin className="h-3.5 w-3.5 text-blue" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
              Step {step + 1} of 3 · {steps[step]}
            </span>
          </span>

          <h1 className="mt-5 font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] text-navy sm:text-5xl">
            {step === 0 && (
              <>
                Where do you <span className="text-blue">live?</span>
              </>
            )}
            {step === 1 && (
              <>
                Which room is <span className="text-blue">yours?</span>
              </>
            )}
            {step === 2 && (
              <>
                What&apos;s your <span className="text-grass">vibe?</span>
              </>
            )}
          </h1>
          <p className="mt-4 max-w-sm text-ink-soft">
            {step === 0 && "Pick your campus and building — we'll pull the exact floor plan."}
            {step === 1 && "Your room number unlocks a true-to-life 3D model from World Labs."}
            {step === 2 && "Drop in a few inspo pics. The agent turns them into pro design directions."}
          </p>

          {/* live preview card */}
          <div className="mt-8 hidden max-w-md rounded-[2rem] bg-card/55 p-2 hairline backdrop-blur-sm ambient lg:block">
            <div className="relative overflow-hidden rounded-[calc(2rem-0.5rem)] bg-gradient-to-br from-sky/50 via-card to-paper-2 inner-core">
              <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-navy/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-paper">
                <Cube className="h-3.5 w-3.5" />
                {building ? `${building.split(" ")[0]} ${room || "—"}` : "Preview"}
              </div>
              <RoomScene className="w-full animate-float-slow" />
            </div>
          </div>
        </div>

        {/* ---------- right: active step ---------- */}
        <div className="order-1 lg:order-2">
          <div className="rounded-[2.2rem] bg-card/60 p-2 hairline backdrop-blur-sm ambient-lg">
            <div className="rounded-[calc(2.2rem-0.5rem)] bg-card p-5 inner-core sm:p-7">
              {/* progress dots */}
              <div className="mb-7 flex items-center gap-2">
                {steps.map((s, i) => (
                  <div key={s} className="flex flex-1 items-center gap-2">
                    <div
                      className={`h-1.5 flex-1 rounded-full transition-all duration-700 ease-spring ${
                        i <= step ? "bg-blue" : "bg-navy/10"
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* STEP 0 — building */}
              {step === 0 && (
                <div key="s0" className="anim-in">
                  <div className="flex flex-wrap gap-2">
                    {SCHOOLS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSchool(s)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                          school === s
                            ? "bg-blue text-paper"
                            : "bg-paper-2 text-ink-soft hover:bg-paper-3"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {BUILDINGS.map((b) => {
                      const active = building === b.name;
                      return (
                        <button
                          key={b.name}
                          disabled={!b.live}
                          onClick={() => setBuilding(b.name)}
                          className={`group relative flex items-center gap-3 rounded-2xl p-3 text-left transition-all duration-500 ease-spring disabled:cursor-not-allowed disabled:opacity-45 ${
                            active
                              ? "bg-sky/50 ring-2 ring-navy"
                              : "bg-paper-2 hover:-translate-y-0.5 hover:bg-paper-3"
                          }`}
                        >
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                              active ? "bg-blue text-paper" : "bg-card text-blue"
                            }`}
                          >
                            <Building className="h-5 w-5" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-navy">
                              {b.name}
                            </span>
                            <span className="block text-[11px] text-ink-faint">
                              {b.live ? b.meta : "Coming soon"}
                            </span>
                          </span>
                          {active && (
                            <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-blue text-paper">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 1 — room + floor */}
              {step === 1 && (
                <div key="s1" className="anim-in space-y-4">
                  <Field label="Room number">
                    <input
                      autoFocus
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      placeholder="e.g. 412"
                      className="w-full bg-transparent py-1 text-lg font-semibold text-navy placeholder:text-ink-faint/70 focus:outline-none"
                    />
                  </Field>
                  <Field label="Floor">
                    <input
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      placeholder="e.g. 4"
                      className="w-full bg-transparent py-1 text-lg font-semibold text-navy placeholder:text-ink-faint/70 focus:outline-none"
                    />
                  </Field>

                  <div className="flex items-center gap-3 rounded-2xl bg-sky/40 p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue text-paper">
                      <Cube className="h-5 w-5" />
                    </span>
                    <p className="text-sm text-navy">
                      We&apos;ll match <strong>{building ?? "your building"}</strong>{" "}
                      {room ? `room ${room}` : "this room"} to its real floor plan and
                      render it in 3D.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2 — inspiration */}
              {step === 2 && (
                <div key="s2" className="anim-in space-y-5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      addFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={images.length >= 6}
                    className="group flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-navy/20 bg-paper-2/60 py-8 transition-all duration-500 ease-spring hover:border-navy/40 hover:bg-paper-2 disabled:opacity-50"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-card text-blue ambient transition-transform duration-500 ease-spring group-hover:-translate-y-1">
                      <Upload className="h-6 w-6" />
                    </span>
                    <span className="text-sm font-semibold text-navy">
                      {images.length === 0
                        ? "Upload inspo pics"
                        : `${images.length} pic${images.length > 1 ? "s" : ""} added — tap for more`}
                    </span>
                    <span className="text-[11px] text-ink-faint">Pinterest, screenshots, anything · up to 6</span>
                  </button>

                  {images.length > 0 && (
                    <div className="anim-in grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {images.map((img, i) => (
                        <div key={i} className="group relative aspect-square overflow-hidden rounded-xl bg-paper-2 inner-core">
                          {/* eslint-disable-next-line @next/next/no-img-element -- local object-URL preview */}
                          <img src={img.preview} alt={`Inspo ${i + 1}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            aria-label="Remove image"
                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-navy/80 text-paper opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <span className="text-xs leading-none">×</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <Sparkle className="h-4 w-4 text-blue" />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                        Recommended directions
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {KEYWORDS.map((k) => {
                        const on = keywords.includes(k);
                        const sugg = SUGGESTED.has(k);
                        return (
                          <button
                            key={k}
                            onClick={() => toggleKeyword(k)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-300 ${
                              on
                                ? "bg-blue text-paper"
                                : sugg
                                  ? "bg-sky/50 text-navy ring-1 ring-blue/30 hover:bg-sky"
                                  : "bg-paper-2 text-ink-soft hover:bg-paper-3"
                            }`}
                          >
                            {on && <Check className="h-3.5 w-3.5" />}
                            {!on && sugg && <Sparkle className="h-3.5 w-3.5 text-blue" />}
                            {k}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* nav */}
              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  className={`text-sm font-medium text-ink-soft transition-colors hover:text-navy ${
                    step === 0 ? "pointer-events-none opacity-0" : ""
                  }`}
                >
                  Back
                </button>

                {step < 2 ? (
                  <button
                    disabled={!canNext}
                    onClick={() => canNext && setStep((s) => s + 1)}
                    className="group inline-flex items-center gap-2 rounded-full bg-blue py-2.5 pl-5 pr-2 text-sm font-semibold text-paper transition-all duration-500 ease-spring hover:bg-blue-deep active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Continue
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper/15 transition-transform duration-500 ease-spring group-hover:translate-x-0.5">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={enterRoom}
                    disabled={submitting}
                    className="group inline-flex items-center gap-2 rounded-full bg-blue py-2.5 pl-5 pr-2 text-sm font-semibold text-paper ambient-blue transition-all duration-500 ease-spring hover:bg-blue-deep active:scale-[0.98] disabled:opacity-60"
                  >
                    {submitting ? "Analyzing your vibe…" : "Enter my room"}
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper/15 transition-transform duration-500 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-px">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {step === 2 && keywords.length > 0 && (
            <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-ink-faint">
              <Smiley className="h-4 w-4 text-blue" />
              Styling your room around{" "}
              <strong className="text-navy">{keywords.slice(0, 3).join(", ")}</strong>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block rounded-2xl bg-paper-2 px-4 py-3 ring-1 ring-transparent transition-all duration-300 focus-within:bg-card focus-within:ring-navy/20">
      <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </span>
      {children}
    </label>
  );
}
