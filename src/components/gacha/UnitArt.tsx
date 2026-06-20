import { useEffect, useMemo, useState } from "react";
import { RARITIES, type Unit } from "../../lib/gacha";

// Renders a unit portrait inside a fixed rounded-rectangle frame. If the image
// at public/units/<img> loads it is shown *contained* (whole image, no crop) on
// the unit's colour backdrop; otherwise we draw a monogram crest. Uniform frame
// size across every card regardless of source image dimensions.

function initials(name: string) {
  const words = name.replace(/[.:'-]/g, "").split(/\s+/).filter(Boolean);
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
  const src = `${import.meta.env.BASE_URL}units/${unit.img || `${unit.id}.png`}`;
  const [imgOk, setImgOk] = useState(imgCache.get(src) === "ok");

  useEffect(() => {
    const cached = imgCache.get(src);
    if (cached) {
      setImgOk(cached === "ok");
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

  const mono = useMemo(() => initials(unit.name), [unit.name]);
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
          <stop offset="0%" stopColor={unit.c1} stopOpacity="0.5" />
          <stop offset="100%" stopColor="#06060f" />
        </radialGradient>
        <radialGradient id={`${gid}-back`} cx="40%" cy="32%" r="85%">
          <stop offset="0%" stopColor={unit.c2} />
          <stop offset="100%" stopColor={unit.c1} />
        </radialGradient>
        <clipPath id={`${gid}-clip`}>
          <rect x="12" y="12" width="96" height="96" rx="14" />
        </clipPath>
        <filter id={`${gid}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={rdef.rank >= 3 ? 2.6 : 1.4} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width="120" height="120" rx="12" fill={`url(#${gid}-bg)`} />

      <g filter={`url(#${gid}-glow)`}>
        {/* colour backdrop (also the letterbox behind contained images) */}
        <rect
          x="12"
          y="12"
          width="96"
          height="96"
          rx="14"
          fill={`url(#${gid}-back)`}
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeOpacity="0.5"
        />
        {imgOk ? (
          <image
            href={src}
            x="12"
            y="12"
            width="96"
            height="96"
            clipPath={`url(#${gid}-clip)`}
            preserveAspectRatio="xMidYMid meet"
          />
        ) : (
          <>
            <circle cx="48" cy="42" r="8" fill="#ffffff" opacity="0.22" />
            <text
              x="60"
              y="62"
              textAnchor="middle"
              dominantBaseline="central"
              className="ua-mono"
              fill="#ffffff"
              fontSize={mono.length > 1 ? 34 : 44}
              fontWeight="800"
            >
              {mono}
            </text>
          </>
        )}
      </g>
    </svg>
  );
}
