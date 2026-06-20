import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sound } from "../lib/sound";

// An affectionate ballpoint-on-notebook-paper homage:
// the flaming bird, the long-haired vaper (#VapeNation #TeamValor),
// the lil' angry guy, and EROIZZY.COM.
export default function DoodleShrine() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => {
      setOpen(true);
      sound.success();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("nebula:eroizzy", show);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("nebula:eroizzy", show);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="shrine"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          data-no-star
        >
          <motion.div
            className="shrine-paper"
            initial={{ scale: 0.6, rotate: -14, opacity: 0 }}
            animate={{ scale: 1, rotate: -1.2, opacity: 1 }}
            exit={{ scale: 0.6, rotate: 14, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <svg viewBox="0 0 400 600" aria-label="EROIZZY.COM #TeamValor">
              {/* ---- Flaming bird at the top ---- */}
              <g className="flame">
                {/* left wing of fire */}
                <path
                  className="ink"
                  d="M200,150 L172,138 L190,112 L156,122 L178,84 L146,96 L168,54 L150,26"
                />
                {/* right wing of fire */}
                <path
                  className="ink"
                  d="M200,150 L228,138 L210,112 L244,122 L222,84 L254,96 L232,54 L250,26"
                />
                {/* phoenix body + head + open beak */}
                <path
                  className="ink"
                  d="M200,150 C205,118 196,96 214,86 C224,80 236,82 242,92"
                />
                <path className="ink" d="M242,92 C250,84 268,84 270,96" />
                {/* open beak */}
                <path className="ink thin" d="M268,90 L300,80" />
                <path className="ink thin" d="M268,100 L300,108" />
                <circle className="fill-hair" cx="252" cy="96" r="2.4" />
              </g>

              {/* ---- The vaper (long hair, glasses) ---- */}
              {/* long hair behind head */}
              <path
                className="fill-hair"
                d="M146,232 C128,244 124,318 150,338 C150,300 154,250 178,236 C160,224 150,222 146,232 Z"
              />
              {/* head */}
              <circle className="ink" cx="178" cy="240" r="34" />
              {/* hair on top */}
              <path
                className="fill-hair"
                d="M148,228 C156,206 200,206 210,230 C206,214 196,206 178,204 C160,204 150,212 148,228 Z"
              />
              {/* glasses */}
              <rect className="ink thin" x="158" y="234" width="16" height="13" rx="2" />
              <rect className="ink thin" x="182" y="234" width="16" height="13" rx="2" />
              <path className="ink thin" d="M174,240 L182,240" />
              {/* vape to the mouth + little cloud */}
              <rect className="fill-hair" x="170" y="254" width="9" height="16" rx="2" transform="rotate(-18 174 262)" />
              <path className="ink thin" d="M168,252 C160,246 156,250 160,256" />
              {/* body / shirt */}
              <path
                className="ink"
                d="M150,286 C150,278 206,278 206,286 L206,352 L150,352 Z"
              />
              {/* arm up holding vape + peace-sign hand */}
              <path className="ink" d="M152,300 C168,296 172,278 172,268" />
              <path className="ink" d="M204,300 C190,308 184,322 186,330" />
              <path className="ink thin" d="M184,326 L184,338 M190,326 L190,338" />
              {/* shorts */}
              <path className="ink" d="M150,352 L206,352 L206,392 L182,392 L178,360 L174,392 L150,392 Z" />
              {/* legs */}
              <path className="ink" d="M160,392 L158,452" />
              <path className="ink" d="M196,392 L198,452" />
              {/* feet */}
              <path className="ink" d="M158,452 C148,456 146,462 160,462 L168,458" />
              <path className="ink" d="M198,452 C208,456 210,462 196,462 L188,458" />

              {/* hashtags */}
              <text className="shrine-tag" x="244" y="220" transform="rotate(-8 244 220)">
                #VapeNation
              </text>
              <text className="shrine-tag" x="248" y="240" transform="rotate(-8 248 240)">
                #TeamValor
              </text>

              {/* ---- The lil' angry guy ---- */}
              <text x="332" y="300" className="shrine-url" style={{ fontSize: 40 }}>
                !
              </text>
              <rect className="ink" x="312" y="318" width="40" height="34" rx="3" />
              {/* angry brows */}
              <path className="ink thin" d="M318,330 L330,326" />
              <path className="ink thin" d="M346,330 L334,326" />
              {/* angry eyes */}
              <circle className="fill-hair" cx="324" cy="335" r="2.2" />
              <circle className="fill-hair" cx="340" cy="335" r="2.2" />
              {/* yelling mouth */}
              <path className="ink thin" d="M320,344 L326,340 L330,346 L336,340 L342,346 L346,341" />
              {/* tiny body + arms + legs */}
              <path className="ink" d="M332,352 L332,378" />
              <path className="ink" d="M332,360 L316,368 M332,360 L350,356" />
              <path className="ink" d="M332,378 L322,396 M332,378 L344,396" />

              {/* ---- EROIZZY.COM ---- */}
              <text className="shrine-url" x="20" y="510" transform="rotate(-3 20 510)">
                ERO
              </text>
              <text className="shrine-url" x="70" y="540" transform="rotate(-2 70 540)">
                IZZY
              </text>
              <text className="shrine-url" x="190" y="548">
                .COM
              </text>
              <path
                className="ink"
                d="M24,566 C140,560 280,562 366,566"
              />
            </svg>

            <div className="shrine-caption">
              the legend of eroizzy.com — #TeamValor · click to dismiss
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
