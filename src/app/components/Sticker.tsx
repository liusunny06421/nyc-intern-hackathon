import type { ReactNode } from "react";
import { Star } from "./icons";

/* Die-cut sticker: thick white border + tinted ambient shadow + a jaunty tilt.
   Mirrors the "ROOM GOALS / good vibes / COLLEGE LIFE" decals on the brand board. */
export default function Sticker({
  children,
  className = "",
  rotate = "-6deg",
  wobble = false,
}: {
  children: ReactNode;
  className?: string;
  rotate?: string;
  wobble?: boolean;
}) {
  return (
    <span
      style={{ rotate }}
      className={`inline-flex select-none items-center gap-1.5 border-[3px] border-card ambient ${
        wobble ? "animate-wobble" : ""
      } ${className}`}
    >
      {children}
    </span>
  );
}

/* Circular seal badge — "BUILT FOR COLLEGE LIFE", "MAKE IT YOURS". */
export function SealBadge({
  lines,
  className = "",
  rotate = "-10deg",
  tone = "blue",
}: {
  lines: string[];
  className?: string;
  rotate?: string;
  tone?: "blue" | "grass" | "tomato";
}) {
  const bg = tone === "grass" ? "bg-grass" : tone === "tomato" ? "bg-tomato" : "bg-blue";
  return (
    <span
      style={{ rotate }}
      className={`flex aspect-square flex-col items-center justify-center rounded-full border-[3px] border-card text-center text-paper ambient-blue ${bg} ${className}`}
    >
      <Star className="mb-1 h-4 w-4 text-sun" />
      {lines.map((l) => (
        <span key={l} className="text-[9px] font-extrabold uppercase leading-[1.15] tracking-[0.14em]">
          {l}
        </span>
      ))}
    </span>
  );
}
