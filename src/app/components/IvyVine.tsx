/* Trailing ivy vine — a curvy stem with alternating leaves and a couple of warm
   vine-light bulbs, each leaf swaying gently on its own delay. Decorative. */

const H = 420;
const stemX = (t: number) => 70 + 30 * Math.sin(t * 6.5);
const stemY = (t: number) => 16 + (H - 28) * t;

const LEAF = "M0,0 C9,-8 26,-9 34,0 C26,9 9,8 0,0 Z";

type IvyVineProps = { className?: string; flip?: boolean };

export default function IvyVine({ className = "", flip = false }: IvyVineProps) {
  const stem = Array.from({ length: 56 }, (_, i) => {
    const t = i / 55;
    return `${i === 0 ? "M" : "L"}${stemX(t).toFixed(1)},${stemY(t).toFixed(1)}`;
  }).join(" ");

  const leaves = Array.from({ length: 13 }, (_, i) => {
    const t = 0.06 + i * 0.072;
    const side = i % 2 === 0 ? 1 : -1;
    const x = stemX(t);
    const y = stemY(t);
    const rot = side === 1 ? 18 + (i % 3) * 6 : 162 - (i % 3) * 6;
    const scale = 0.72 + ((i * 7) % 5) * 0.07;
    const green = i % 3 === 0 ? "#4f9e68" : i % 3 === 1 ? "#2e7d46" : "#3a8a55";
    return { x, y, rot, scale, green, delay: (i % 5) * 0.5 };
  });

  const bulbs = [0.34, 0.66, 0.9].map((t, i) => ({
    x: stemX(t) + (i % 2 === 0 ? 10 : -10),
    y: stemY(t) + 12,
    delay: i * 0.7,
  }));

  return (
    <svg
      viewBox={`0 0 140 ${H}`}
      className={className}
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
      aria-hidden="true"
    >
      <path d={stem} fill="none" stroke="#2e7d46" strokeWidth={3} strokeLinecap="round" opacity={0.85} />
      {leaves.map((l, i) => (
        <g
          key={`l${i}`}
          style={{ transformOrigin: `${l.x}px ${l.y}px`, animationDelay: `${l.delay}s` }}
          className="animate-sway"
        >
          <g transform={`translate(${l.x} ${l.y}) rotate(${l.rot}) scale(${l.scale})`}>
            <path d={LEAF} fill={l.green} />
            <path d="M0,0 L30,0" stroke="#1f5f3a" strokeWidth={0.8} opacity={0.5} />
          </g>
        </g>
      ))}
      {bulbs.map((b, i) => (
        <g key={`b${i}`} style={{ transformOrigin: `${b.x}px ${b.y}px`, animationDelay: `${b.delay}s` }} className="animate-twinkle">
          <circle cx={b.x} cy={b.y} r={11} fill="#ffd873" opacity={0.35} />
          <circle cx={b.x} cy={b.y} r={5} fill="#ffd873" />
          <circle cx={b.x - 1.5} cy={b.y - 1.5} r={1.4} fill="#fff" opacity={0.9} />
        </g>
      ))}
    </svg>
  );
}
