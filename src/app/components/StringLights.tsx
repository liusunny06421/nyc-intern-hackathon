/* Warm dorm string-lights — a gently sagging garland of twinkling bulbs.
   Scales uniformly (width:100% + height:auto on a 1440:110 viewBox), so bulbs
   never distort. Decorative + pointer-events-none. */

const COUNT = 18;
const W = 1440;
const SAG = 52; // center dip
const TOP = 16;

// y of the wire at a given x — one graceful arc
const wireY = (x: number) => TOP + SAG * Math.sin((Math.PI * x) / W);

const BULB_COLORS = [
  "#fff1cf",
  "#ffd66b",
  "#fff6e0",
  "#ffd873",
  "#7cc8ff",
  "#fff1cf",
  "#ffd66b",
  "#c3a6ff",
  "#fff6e0",
];

export default function StringLights({ className = "" }: { className?: string }) {
  const margin = 30;
  const span = W - margin * 2;
  const bulbs = Array.from({ length: COUNT }, (_, i) => {
    const x = margin + (span * i) / (COUNT - 1);
    const y = wireY(x);
    return { x, y, color: BULB_COLORS[i % BULB_COLORS.length], delay: (i % 6) * 0.45 };
  });

  // smooth wire path
  const path = Array.from({ length: 49 }, (_, i) => {
    const x = (W * i) / 48;
    return `${i === 0 ? "M" : "L"}${x.toFixed(0)},${wireY(x).toFixed(1)}`;
  }).join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} 110`}
      className={className}
      style={{ width: "100%", height: "auto" }}
      aria-hidden="true"
      preserveAspectRatio="xMidYMin slice"
    >
      <path d={path} fill="none" stroke="#3a3a3a" strokeWidth={2} strokeLinecap="round" opacity={0.55} />
      {bulbs.map((b, i) => {
        const cy = b.y + 16;
        return (
          <g key={i} style={{ transformOrigin: `${b.x}px ${cy}px`, animationDelay: `${b.delay}s` }} className="animate-twinkle">
            {/* drop wire */}
            <line x1={b.x} y1={b.y} x2={b.x} y2={b.y + 9} stroke="#3a3a3a" strokeWidth={1.4} opacity={0.5} />
            {/* socket */}
            <rect x={b.x - 2} y={b.y + 7} width={4} height={4} rx={1} fill="#3a3a3a" opacity={0.7} />
            {/* glow */}
            <circle cx={b.x} cy={cy} r={15} fill={b.color} opacity={0.3} />
            {/* bulb */}
            <circle cx={b.x} cy={cy} r={7} fill={b.color} />
            <circle cx={b.x - 2} cy={cy - 2} r={2} fill="#ffffff" opacity={0.85} />
          </g>
        );
      })}
    </svg>
  );
}
