/* Hand-built isometric dorm room (inline SVG). Used on the landing hero and the
   workspace canvas. No raster assets — every object is a shaded cuboid so the
   "renders the 3D space into individual interactive objects" story is literal. */

const S = 28; // unit size in px
const A = 0.866; // cos(30deg)
const B = 0.5; // sin(30deg)
const OX = 250;
const OY = 178;

type P = [number, number];

function iso(x: number, y: number, z: number): P {
  return [OX + (x - y) * A * S, OY + (x + y) * B * S - z * S];
}
const pts = (ps: P[]) => ps.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

type Faces = { top: string; right: string; left: string };

function box(
  bx: number,
  by: number,
  bz: number,
  w: number,
  d: number,
  h: number,
  f: Faces,
  rounded = false,
) {
  const x0 = bx,
    x1 = bx + w,
    y0 = by,
    y1 = by + d,
    z0 = bz,
    z1 = bz + h;
  const top = pts([iso(x0, y0, z1), iso(x1, y0, z1), iso(x1, y1, z1), iso(x0, y1, z1)]);
  const right = pts([iso(x1, y0, z0), iso(x1, y1, z0), iso(x1, y1, z1), iso(x1, y0, z1)]);
  const left = pts([iso(x0, y1, z0), iso(x1, y1, z0), iso(x1, y1, z1), iso(x0, y1, z1)]);
  return (
    <g strokeLinejoin="round" strokeWidth={0.6}>
      <polygon points={left} fill={f.left} stroke={f.left} />
      <polygon points={right} fill={f.right} stroke={f.right} />
      <polygon
        points={top}
        fill={f.top}
        stroke={rounded ? f.top : "rgba(255,255,255,0.18)"}
        strokeWidth={rounded ? 0.6 : 0.5}
      />
    </g>
  );
}

const shade = (top: string, right: string, left: string): Faces => ({ top, right, left });

export type Hotspot = { id: string; x: number; y: number; z: number; label?: string };

type RoomSceneProps = {
  className?: string;
  hotspots?: Hotspot[];
  activeId?: string | null;
  mode?: "day" | "evening";
};

export default function RoomScene({ className = "", hotspots = [], activeId, mode = "day" }: RoomSceneProps) {
  const W = 10;
  const D = 10;
  const WH = 5.2; // wall height
  const evening = mode === "evening";

  return (
    <svg
      viewBox="0 0 500 470"
      className={className}
      role="img"
      aria-label="Isometric 3D rendering of a dorm room"
    >
      <defs>
        <linearGradient id="floorG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ecdcc0" />
          <stop offset="1" stopColor="#e0cba6" />
        </linearGradient>
        <linearGradient id="winDay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2cf" />
          <stop offset="0.5" stopColor="#cfe9ff" />
          <stop offset="1" stopColor="#a9d2ee" />
        </linearGradient>
        <linearGradient id="winEve" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a4f86" />
          <stop offset="1" stopColor="#16224e" />
        </linearGradient>
        <radialGradient id="rugG" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0" stopColor="#d6e2c5" />
          <stop offset="1" stopColor="#c3d4ad" />
        </radialGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0c2657" floodOpacity="0.16" />
        </filter>
      </defs>

      <g filter="url(#soft)">
        {/* ---- shell ---- */}
        {/* left-back wall (x = 0 plane) */}
        <polygon
          points={pts([iso(0, 0, 0), iso(0, D, 0), iso(0, D, WH), iso(0, 0, WH)])}
          fill="#e6dcc6"
        />
        {/* right-back wall (y = 0 plane) */}
        <polygon
          points={pts([iso(0, 0, 0), iso(W, 0, 0), iso(W, 0, WH), iso(0, 0, WH)])}
          fill="#f0e9d8"
        />
        {/* floor */}
        <polygon
          points={pts([iso(0, 0, 0), iso(W, 0, 0), iso(W, D, 0), iso(0, D, 0)])}
          fill="url(#floorG)"
        />
        {/* floor plank seams */}
        {[2, 4, 6, 8].map((x) => (
          <line
            key={`p${x}`}
            x1={iso(x, 0, 0)[0]}
            y1={iso(x, 0, 0)[1]}
            x2={iso(x, D, 0)[0]}
            y2={iso(x, D, 0)[1]}
            stroke="#cdb389"
            strokeWidth={0.5}
            opacity={0.5}
          />
        ))}

        {/* window on right-back wall */}
        <polygon
          points={pts([iso(5, 0, 2), iso(8.4, 0, 2), iso(8.4, 0, 4.4), iso(5, 0, 4.4)])}
          fill="#f0e9d8"
        />
        <polygon
          points={pts([iso(5.2, 0, 2.2), iso(8.2, 0, 2.2), iso(8.2, 0, 4.2), iso(5.2, 0, 4.2)])}
          fill={evening ? "url(#winEve)" : "url(#winDay)"}
        />
        <line x1={iso(6.7, 0, 2.2)[0]} y1={iso(6.7, 0, 2.2)[1]} x2={iso(6.7, 0, 4.2)[0]} y2={iso(6.7, 0, 4.2)[1]} stroke="#f0e9d8" strokeWidth={1.2} />
        <line x1={iso(5.2, 0, 3.2)[0]} y1={iso(5.2, 0, 3.2)[1]} x2={iso(8.2, 0, 3.2)[0]} y2={iso(8.2, 0, 3.2)[1]} stroke="#f0e9d8" strokeWidth={1.2} />

        {/* gallery posters on left-back wall */}
        <polygon points={pts([iso(0, 2.2, 3), iso(0, 3.6, 3), iso(0, 3.6, 4.4), iso(0, 2.2, 4.4)])} fill="#cfe3f3" stroke="#fffdf8" strokeWidth={1} />
        <polygon points={pts([iso(0, 4.2, 3.2), iso(0, 5.2, 3.2), iso(0, 5.2, 4.3), iso(0, 4.2, 4.3)])} fill="#f7dd9a" stroke="#fffdf8" strokeWidth={1} />
        <polygon points={pts([iso(0, 2.4, 1.3), iso(0, 3.4, 1.3), iso(0, 3.4, 2.4), iso(0, 2.4, 2.4)])} fill="#d6e0c5" stroke="#fffdf8" strokeWidth={1} />

        {/* ---- rug ---- */}
        <polygon
          points={pts([iso(2.4, 3, 0.02), iso(7.4, 3, 0.02), iso(7.4, 8, 0.02), iso(2.4, 8, 0.02)])}
          fill="url(#rugG)"
        />
        <polygon
          points={pts([iso(3, 3.6, 0.03), iso(6.8, 3.6, 0.03), iso(6.8, 7.4, 0.03), iso(3, 7.4, 0.03)])}
          fill="none"
          stroke="#aec396"
          strokeWidth={1}
          strokeDasharray="3 3"
        />

        {/* ---- desk (along left wall) ---- */}
        {box(0.5, 4.4, 0, 0.5, 3.4, 2.0, shade("#cbb98f", "#b39468", "#9d8056"))}
        {box(0.5, 4.4, 2.0, 2.4, 3.4, 0.25, shade("#d8c69d", "#c2a877", "#ac9264"))}
        {box(2.7, 4.6, 0, 0.25, 0.25, 2.0, shade("#cbb98f", "#b39468", "#9d8056"))}
        {box(2.7, 7.7, 0, 0.25, 0.25, 2.0, shade("#cbb98f", "#b39468", "#9d8056"))}
        {/* laptop */}
        {box(1.1, 5.4, 2.25, 0.9, 0.6, 0.06, shade("#2f5fab", "#244f95", "#1f4585"))}
        {box(1.1, 5.4, 2.25, 0.06, 0.6, 0.65, shade("#cfe3f3", "#bcd3ec", "#a9c4e3"))}
        {/* desk lamp */}
        {box(0.8, 6.9, 2.25, 0.4, 0.4, 0.12, shade("#1f3f7a", "#183567", "#142d57"))}
        {box(0.95, 7.05, 2.37, 0.1, 0.1, 0.9, shade("#1f3f7a", "#183567", "#142d57"))}
        <circle {...spotXY(1.0, 7.1, 3.3)} r={5.5} fill="#f5cf6b" stroke="#f0e9d8" strokeWidth={1} />
        {/* chair */}
        {box(2.4, 5.6, 0, 1, 1, 1.05, shade("#1f3f7a", "#183567", "#142d57"), true)}
        {box(2.4, 5.6, 1.05, 1, 0.18, 1.0, shade("#27478a", "#1f3d77", "#193366"), true)}

        {/* ---- bed (along right-back wall) ---- */}
        {box(5, 0.6, 0, 4, 2.8, 0.9, shade("#b98a5e", "#a67a50", "#946b45"))}
        {/* mattress + duvet */}
        {box(5.1, 0.7, 0.9, 3.8, 2.6, 0.55, shade("#fbf6ea", "#efe7d6", "#e3dac6"))}
        {box(5.1, 0.7, 1.0, 3.8, 1.7, 0.5, shade("#3f74c4", "#2f5fab", "#244f95"))}
        {/* pillows */}
        {box(5.3, 0.85, 1.42, 1.1, 0.8, 0.4, shade("#fdfaf2", "#f1ebda", "#e6dcc6"), true)}
        {box(5.3, 1.75, 1.42, 1.1, 0.8, 0.4, shade("#f7dd9a", "#eccd7e", "#dcbd6e"), true)}
        {/* headboard against wall */}
        {box(5, 0.6, 0, 4, 0.22, 2.3, shade("#a67a50", "#946b45", "#84603e"))}
        {/* throw blanket */}
        {box(5.2, 2.5, 1.0, 3.6, 0.9, 0.5, shade("#d98a6a", "#c87a5b", "#b56c50"))}

        {/* ---- nightstand + plant (front corner) ---- */}
        {box(5, 4, 0, 1.1, 1.1, 1.3, shade("#cbb98f", "#b39468", "#9d8056"), true)}
        {box(5.15, 4.15, 1.3, 0.8, 0.8, 0.5, shade("#c98a63", "#b6774f", "#a26a45"), true)}
        <circle {...spotXY(5.55, 4.55, 2.3)} r={11} fill="#7f9a6e" opacity={0.95} />
        <circle {...spotXY(5.2, 4.3, 2.5)} r={8} fill="#92ad7e" />
        <circle {...spotXY(5.9, 4.8, 2.45)} r={7.5} fill="#6f8c5f" />

        {/* shelf cube storage (front-left) */}
        {box(3.6, 8.4, 0, 1.5, 1.5, 1.5, shade("#e2d3b0", "#cdb98f", "#b8a378"), true)}
        {box(3.75, 8.55, 1.5, 1.2, 1.2, 0.12, shade("#f0e9d8", "#ddd3bc", "#cabfa3"))}
        {/* books on top */}
        {box(3.9, 8.7, 1.62, 0.18, 0.7, 0.55, shade("#2f5fab", "#244f95", "#1f4585"))}
        {box(4.12, 8.7, 1.62, 0.18, 0.7, 0.7, shade("#d98a6a", "#c87a5b", "#b56c50"))}
        {box(4.34, 8.7, 1.62, 0.18, 0.7, 0.45, shade("#8ca57e", "#7c956e", "#6d855f"))}
      </g>

      {/* ---- lighting mood ---- */}
      {!evening && (
        <polygon
          points={pts([iso(4.9, 0, 0.04), iso(8.5, 0, 0.04), iso(7, 4.8, 0.04), iso(3.4, 4.8, 0.04)])}
          fill="#ffdf8e"
          opacity={0.28}
        />
      )}
      {evening && (
        <>
          <rect x="0" y="0" width="500" height="470" fill="#141f49" opacity={0.4} />
          {/* warm glow at the desk lamp */}
          <circle {...spotXY(1, 7, 3.3)} r={42} fill="#ffd873" opacity={0.22} />
          {/* interior string lights strung along the back walls */}
          {[
            [2.2, 0, 4.7], [4, 0, 4.6], [5.8, 0, 4.7], [7.6, 0, 4.6],
            [0, 2, 4.7], [0, 4, 4.6], [0, 6, 4.7], [0, 8, 4.6],
          ].map(([x, y, z], i) => (
            <g key={i}>
              <circle {...spotXY(x, y, z)} r={9} fill="#ffd873" opacity={0.32} />
              <circle {...spotXY(x, y, z)} r={2.4} fill="#fff0c2" />
            </g>
          ))}
        </>
      )}

      {/* ---- interactive hotspots ---- */}
      {hotspots.map((h) => {
        const [cx, cy] = iso(h.x, h.y, h.z);
        const active = activeId === h.id;
        return (
          <g key={h.id} className="cursor-pointer">
            {active && <circle cx={cx} cy={cy} r={16} fill="#2f63b8" opacity={0.16} className="animate-pulse-soft" />}
            <circle cx={cx} cy={cy} r={active ? 7 : 5} fill={active ? "#2f63b8" : "#fffdf8"} stroke="#0c2657" strokeWidth={1.4} />
            <circle cx={cx} cy={cy} r={active ? 2.4 : 1.8} fill={active ? "#fffdf8" : "#2f63b8"} />
          </g>
        );
      })}
    </svg>
  );
}

function spotXY(x: number, y: number, z: number) {
  const [cx, cy] = iso(x, y, z);
  return { cx, cy };
}
