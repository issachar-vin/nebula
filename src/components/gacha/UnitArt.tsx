import { useEffect, useMemo, useState } from "react";
import { RARITIES, type Unit } from "../../lib/gacha";

// Renders a unit portrait. If an image exists at public/units/<id>.png it is
// used; otherwise we draw a clean monogram crest (initials + signature colours
// + orbiting motes), so the roster never depends on shipping artwork.

function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function initials(name: string) {
  const words = name.replace(/[.:]/g, "").split(/\s+/).filter(Boolean);
  const a = words[0]?.[0] ?? "?";
  const b = words.length > 1 ? words[words.length - 1][0] : (words[0]?.[1] ?? "");
  return (a + b).toUpperCase();
}

// module-level cache so each image source is probed only once
const imgCache = new Map<string, "ok" | "fail">();

export default function UnitArt({
  unit,
  size = 120,
  animate = true,
}: {
  unit: Unit;
  size?: number;
  animate?: boolean;
}) {
  const rdef = RARITIES[unit.rarity];
  const src = unit.img ?? `${import.meta.env.BASE_URL}units/${unit.id}.png`;
  const [imgOk, setImgOk] = useState(imgCache.get(src) === "ok");

  useEffect(() => {
    const cached = imgCache.get(src);
    if (cached === "ok") {
      setImgOk(true);
      return;
    }
    if (cached === "fail") {
      setImgOk(false);
      return;
    }
    let alive = true;
    const im = new Image();
    im.onload = () => {
      imgCache.set(src, "ok");
      if (alive) setImgOk(true);
    };
    im.onerror = () => {
      imgCache.set(src, "fail");
      if (alive) setImgOk(false);
    };
    im.src = src;
    return () => {
      alive = false;
    };
  }, [src]);

  const deco = useMemo(() => {
    const rand = rng(unit.seed);
    const orbits = 3 + rdef.rank;
    const orbitR = 46 + rand() * 5;
    const dots = Array.from({ length: orbits }, (_, i) => {
      const a = (i / orbits) * Math.PI * 2 + rand() * 0.5;
      return {
        x: (60 + Math.cos(a) * orbitR).toFixed(1),
        y: (60 + Math.sin(a) * orbitR).toFixed(1),
        r: (1.6 + rand() * 2.2).toFixed(1),
        c: i % 2 ? unit.c2 : "#ffffff",
      };
    });
    const rays =
      rdef.rank >= 2
        ? Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return {
              x1: (60 + Math.cos(a) * 34).toFixed(1),
              y1: (60 + Math.sin(a) * 34).toFixed(1),
              x2: (60 + Math.cos(a) * 54).toFixed(1),
              y2: (60 + Math.sin(a) * 54).toFixed(1),
              w: i % 2 ? 1 : 2.2,
            };
          })
        : [];
    return { dots, rays, mono: initials(unit.name) };
  }, [unit, rdef.rank]);

  const gid = `ua-${unit.id}`;
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={`unit-art${animate ? " animate" : ""} rank-${rdef.rank}`}
      style={{ "--r-color": rdef.color, "--r-color2": rdef.color2 } as React.CSSProperties}
    >
      <defs>
        <radialGradient id={`${gid}-bg`} cx="50%" cy="40%" r="75%">
          <stop offset="0%" stopColor={unit.c1} stopOpacity="0.55" />
          <stop offset="100%" stopColor="#06060f" />
        </radialGradient>
        <radialGradient id={`${gid}-disc`} cx="38%" cy="32%" r="80%">
          <stop offset="0%" stopColor={unit.c2} />
          <stop offset="100%" stopColor={unit.c1} />
        </radialGradient>
        <clipPath id={`${gid}-clip`}>
          <circle cx="60" cy="60" r="31" />
        </clipPath>
        <filter id={`${gid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={rdef.rank >= 3 ? 3 : 1.6} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width="120" height="120" rx="12" fill={`url(#${gid}-bg)`} />

      {deco.rays.map((r, i) => (
        <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke={rdef.color} strokeWidth={r.w} opacity={0.45} />
      ))}

      <g className="ua-orbit">
        {deco.dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.c} />
        ))}
      </g>

      <g filter={`url(#${gid}-glow)`} className="ua-core">
        <circle cx="60" cy="60" r="31" fill={`url(#${gid}-disc)`} stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.55" />
        {imgOk ? (
          <image
            href={src}
            x="29"
            y="29"
            width="62"
            height="62"
            clipPath={`url(#${gid}-clip)`}
            preserveAspectRatio="xMidYMid slice"
          />
        ) : (
          <>
            <circle cx="51" cy="49" r="7" fill="#ffffff" opacity="0.25" />
            <text
              x="60"
              y="62"
              textAnchor="middle"
              dominantBaseline="central"
              className="ua-mono"
              fill="#ffffff"
              fontSize={deco.mono.length > 1 ? 30 : 38}
              fontWeight="800"
            >
              {deco.mono}
            </text>
          </>
        )}
      </g>
    </svg>
  );
}
