/* Ultra-light line icons — 1.25 stroke, rounded caps. No Lucide/Material. */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export function ArrowUpRight(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

export function ArrowRight(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

export function Cube(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 2.8 21 7.4v9.2L12 21.2 3 16.6V7.4z" />
      <path d="M3 7.4 12 12l9-4.6M12 12v9.2" />
    </svg>
  );
}

export function Sparkle(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3c.5 4.4 1.6 5.5 6 6-4.4.5-5.5 1.6-6 6-.5-4.4-1.6-5.5-6-6 4.4-.5 5.5-1.6 6-6Z" />
      <path d="M19 13.5c.2 1.6.6 2 2.2 2.2-1.6.2-2 .6-2.2 2.2-.2-1.6-.6-2-2.2-2.2 1.6-.2 2-.6 2.2-2.2Z" />
    </svg>
  );
}

export function Pin(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

export function Bag(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  );
}

export function Ruler(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <rect x="3" y="8" width="18" height="8" rx="1.5" />
      <path d="M7 8v3M11 8v4M15 8v3M19 8v4" />
    </svg>
  );
}

export function Layers(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
      <path d="m4 12 8 4.5L20 12M4 16.5 12 21l8-4.5" />
    </svg>
  );
}

export function Heart(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 20s-7-4.4-7-9.5A4 4 0 0 1 12 7a4 4 0 0 1 7 3.5C19 15.6 12 20 12 20Z" />
    </svg>
  );
}

export function Search(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.4-3.4" />
    </svg>
  );
}

export function Send(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M5 12 20 5l-4 15-4-7-7-1Z" />
    </svg>
  );
}

export function Chat(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M5 6h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H9l-4 3v-3a1 1 0 0 1 0-1V7a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

export function Building(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M5 21V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16M14 21V9h4a1 1 0 0 1 1 1v11M3 21h18" />
      <path d="M8 8h2M8 12h2M8 16h2" />
    </svg>
  );
}

export function Check(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export function Upload(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 16V5m0 0L8 9m4-4 4 4M5 18v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1" />
    </svg>
  );
}

export function Compass(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </svg>
  );
}

export function Rotate(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 4v4h-4" />
      <path d="M20 12a8 8 0 0 1-13.7 5.6L4 16M4 20v-4h4" />
    </svg>
  );
}

export function Smiley(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 10h.01M15 10h.01M8.5 14.5a4.5 4.5 0 0 0 7 0" />
    </svg>
  );
}

export function Sun(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
    </svg>
  );
}

export function Moon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M20 13.5A8 8 0 1 1 10.5 4a6.3 6.3 0 0 0 9.5 9.5Z" />
    </svg>
  );
}

export function Star(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="m12 3.5 2.4 5 5.6.6-4.2 3.8 1.2 5.5L12 17.6 6.9 20.4l1.2-5.5L4 11.1l5.6-.6 2.4-5Z" />
    </svg>
  );
}
