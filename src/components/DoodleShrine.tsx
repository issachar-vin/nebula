import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sound } from "../lib/sound";

// A loving ballpoint-on-notebook-paper recreation: the flaming phoenix,
// the long-haired vaper (#VapeNation #TeamValor) mid-exhale, the lil' angry
// guy, and the hollow block-letter EROIZZY.COM. The whole drawing runs
// through an SVG turbulence/displacement filter so every "straight" line
// gets a hand-drawn wobble.
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
            initial={{ scale: 0.55, rotate: -16, opacity: 0, y: -40 }}
            animate={{ scale: 1, rotate: -1.4, opacity: 1, y: 0 }}
            exit={{ scale: 0.6, rotate: 12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 210, damping: 17 }}
            onClick={(e) => e.stopPropagation()}
          >
            <svg viewBox="0 0 420 620" aria-label="EROIZZY.COM #TeamValor">
              <defs>
                <filter id="rough" x="-10%" y="-10%" width="120%" height="120%">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.016"
                    numOctaves="2"
                    seed="7"
                    result="n"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="n"
                    scale="3.4"
                    xChannelSelector="R"
                    yChannelSelector="G"
                  />
                </filter>
              </defs>

              {/* notebook holes — kept crisp, outside the wobble filter */}
              <circle className="shrine-hole" cx="20" cy="100" r="8" />
              <circle className="shrine-hole" cx="20" cy="310" r="8" />
              <circle className="shrine-hole" cx="20" cy="520" r="8" />

              <g filter="url(#rough)">
                {/* ---------- flaming phoenix ---------- */}
                <g className="flame">
                  {/* head + open beak + eye */}
                  <circle className="ink" cx="250" cy="96" r="13" />
                  <circle className="fill-hair" cx="246" cy="92" r="2.2" />
                  <path className="ink thin" d="M262,90 L300,82" />
                  <path className="ink thin" d="M262,103 L300,110" />
                  <path className="ink" d="M239,104 C226,120 214,132 210,150" />
                  {/* left wing tongues */}
                  <path className="ink" d="M210,150 L184,142 L198,116 L168,126 L186,90 L160,100 L178,58 L156,34" />
                  <path className="ink" d="M206,153 L176,150 L150,160 L168,120 L140,130 L150,86" />
                  <path className="ink" d="M201,156 L150,151 L116,166 L150,122 L108,138 L130,104" />
                  {/* right wing tongues */}
                  <path className="ink" d="M210,150 L236,142 L222,116 L252,126 L234,90 L260,100 L242,58 L264,34" />
                  <path className="ink" d="M214,153 L244,150 L270,160 L252,120 L280,130 L270,86" />
                  <path className="ink" d="M219,156 L270,151 L304,166 L270,122 L312,138 L290,104" />
                  {/* tail licks */}
                  <path className="ink" d="M210,152 L202,176 L214,172 L208,196" />
                  <path className="ink" d="M218,152 L226,174 L214,172" />
                </g>

                {/* ---------- the vaper ---------- */}
                {/* hair */}
                <path className="fill-hair" d="M150,238 C126,254 120,338 150,356 C150,312 150,260 182,242 C170,232 156,230 150,238 Z" />
                <path className="fill-hair" d="M206,240 C222,256 222,300 206,322 C208,282 200,256 182,242 Z" />
                <path className="fill-hair" d="M146,232 C150,206 208,206 214,234 C206,216 192,206 180,205 C162,205 150,214 146,232 Z" />
                {/* head */}
                <circle className="ink" cx="180" cy="248" r="34" />
                {/* glasses */}
                <rect className="ink thin" x="160" y="242" width="17" height="13" rx="3" />
                <rect className="ink thin" x="185" y="242" width="17" height="13" rx="3" />
                <path className="ink thin" d="M177,247 L185,247" />
                <path className="ink thin" d="M160,246 L150,243" />
                <path className="ink thin" d="M202,246 L210,244" />
                {/* vapor puff */}
                <circle className="ink thin" cx="156" cy="256" r="6" />
                <circle className="ink thin" cx="147" cy="247" r="7" />
                <circle className="ink thin" cx="157" cy="239" r="5" />
                <circle className="ink thin" cx="142" cy="236" r="4" />
                {/* vape */}
                <rect className="vape" x="166" y="260" width="8" height="15" rx="2" transform="rotate(-20 170 267)" />
                {/* body / shirt */}
                <path className="ink" d="M150,290 C150,281 210,281 210,290 L212,358 L148,358 Z" />
                <path className="ink" d="M150,290 L138,300 L146,314" />
                <path className="ink" d="M210,290 L222,300 L214,314" />
                {/* pokeball chest nod */}
                <circle className="ink thin" cx="180" cy="320" r="9" />
                <path className="ink thin" d="M171,320 L189,320" />
                <circle className="fill-hair" cx="180" cy="320" r="2.4" />
                {/* arms */}
                <path className="ink" d="M150,300 C164,302 176,288 172,268" />
                <path className="ink" d="M210,300 C202,318 196,332 200,342" />
                <path className="ink thin" d="M198,340 l-2,8 M203,341 l0,8" />
                {/* shorts */}
                <path className="ink" d="M148,358 L212,358 L210,400 L186,400 L181,364 L176,400 L150,400 Z" />
                {/* legs + shoes */}
                <path className="ink" d="M162,400 L160,460" />
                <path className="ink" d="M198,400 L200,460" />
                <path className="ink" d="M160,460 C150,464 148,470 162,470 L170,466" />
                <path className="ink" d="M200,460 C210,464 212,470 198,470 L190,466" />

                {/* hashtags */}
                <text className="shrine-tag" x="250" y="224" transform="rotate(-8 250 224)">#VapeNation</text>
                <text className="shrine-tag" x="254" y="246" transform="rotate(-8 254 246)">#TeamValor</text>

                {/* ---------- lil' angry guy ---------- */}
                <text className="shrine-bang" x="346" y="290">!</text>
                <rect className="ink" x="322" y="308" width="44" height="38" rx="4" />
                <path className="ink thin" d="M328,324 L342,318" />
                <path className="ink thin" d="M362,324 L348,318" />
                <circle className="fill-hair" cx="335" cy="330" r="2.4" />
                <circle className="fill-hair" cx="355" cy="330" r="2.4" />
                <path className="ink thin" d="M330,340 L336,335 L341,341 L347,335 L353,341 L359,336" />
                <path className="ink" d="M344,346 L344,374" />
                <path className="ink" d="M344,354 L324,360 M324,360 l-6,-2 M324,360 l-4,5" />
                <path className="ink" d="M344,354 L360,350" />
                <path className="ink" d="M344,374 L332,396 M344,374 L356,396" />

                {/* ---------- EROIZZY.COM ---------- */}
                <text className="shrine-url" x="20" y="500" fontSize="62" rotate="-5 3 -2">ERO</text>
                <text className="shrine-url" x="58" y="548" fontSize="62" rotate="3 -2 2 -3">IZZY</text>
                <text className="shrine-url" x="206" y="556" fontSize="66" rotate="-2 2 -3 1">.COM</text>
                <path className="ink" d="M22,576 C150,569 300,571 396,576" />
              </g>
            </svg>

            <div className="shrine-photo">
              <img src="/eroizzy.jpg" alt="the real eroizzy" />
            </div>

            <div className="shrine-caption">
              the legend of eroizzy.com — #TeamValor · click to dismiss
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
