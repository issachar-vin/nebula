import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  gacha,
  rollTen,
  rollGodPack,
  topRarity,
  useCollection,
  UNITS,
  RARITIES,
  RARITY_ORDER,
  MAX_STARS,
  type PullResult,
  type Rarity,
  type Unit,
} from "../../lib/gacha";
import { sound } from "../../lib/sound";
import { unlock } from "../../lib/achievements";
import UnitArt from "./UnitArt";
import SummonAura from "./SummonAura";
import WarpProjectile from "./WarpProjectile";

type Stage = "banner" | "charge" | "reveal" | "summary" | "collection";

function hexRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
function aura(r: Rarity) {
  const d = RARITIES[r];
  return { color: hexRgb(d.color), intensity: 0.5 + d.rank * 0.28, rainbow: !!d.rainbow };
}

function Stars({ n }: { n: number }) {
  return (
    <span className="gx-stars">
      {"★".repeat(n)}
      <span className="gx-stars-empty">{"★".repeat(MAX_STARS - n)}</span>
    </span>
  );
}

export default function Gacha() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("banner");
  const [godPack, setGodPack] = useState(false);
  const [pulls, setPulls] = useState<PullResult[]>([]);
  const [idx, setIdx] = useState(0);
  const [flying, setFlying] = useState(true); // warp-in animation before each card
  const owned = useCollection();

  // entry points
  useEffect(() => {
    const openNormal = () => {
      setOpen(true);
      setStage("banner");
    };
    const openGod = () => {
      // Konami silently guarantees a god pack — the banner gives nothing away.
      setGodPack(true);
      setOpen(true);
      setStage("banner");
    };
    window.addEventListener("nebula:gacha-open", openNormal);
    window.addEventListener("nebula:gacha-godpack", openGod);
    return () => {
      window.removeEventListener("nebula:gacha-open", openNormal);
      window.removeEventListener("nebula:gacha-godpack", openGod);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && (stage === "banner" || stage === "summary" || stage === "collection")) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, stage]);

  const summon = () => {
    const ids = godPack ? rollGodPack() : rollTen();
    const results = gacha.add(ids); // persist + tag new/dupe
    setPulls(results);
    setIdx(0);
    setStage("charge");
    sound.zap();
    const best = topRarity(ids);
    // higher rarity -> longer, more suspenseful charge
    const dur = 1500 + RARITIES[best].rank * 320;
    setTimeout(() => {
      setStage("reveal");
      setIdx(0);
      setFlying(true);
    }, dur);
  };

  const usedGodPack = godPack;
  useEffect(() => {
    if (stage === "reveal" && usedGodPack) setGodPack(false);
  }, [stage]); // eslint-disable-line

  // Tapping during the warp-in reveals the card immediately; tapping a
  // revealed card advances to the next warp-in (or the summary).
  const onRevealClick = () => {
    if (flying) {
      setFlying(false);
      return;
    }
    if (idx >= pulls.length - 1) {
      setStage("summary");
      if (pulls.some((p) => UNITS[p.unitId].rarity === "L")) sound.success();
      return;
    }
    setIdx((i) => i + 1);
    setFlying(true);
    sound.tone(420 + idx * 40, 0.07, "triangle", 0.12);
  };

  // aura context for the WebGL black-hole portal
  const auraProps = useMemo(() => {
    if (stage === "charge") return aura(topRarity(pulls.map((p) => p.unitId)));
    if (stage === "reveal" && pulls[idx]) return aura(UNITS[pulls[idx].unitId].rarity);
    // idle portal on the banner — calm, accent-coloured, gives nothing away
    return { color: [0.486, 0.361, 1] as [number, number, number], intensity: 0.6, rainbow: false };
  }, [stage, pulls, idx]);
  const showPortal = stage === "banner" || stage === "charge" || stage === "reveal";

  const collectionCount = Object.keys(owned).length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="gx"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {showPortal && (
            <div className="gx-aura-wrap">
              <SummonAura {...auraProps} />
            </div>
          )}

          {/* ───────── banner ───────── */}
          {stage === "banner" && (
            <motion.div
              className="gx-banner"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="gx-eyebrow">cosmic critters · summon banner</div>
              <h2 className="gx-title">Summon</h2>
              <div className="gx-portal-gap" aria-hidden="true" />
              <p className="gx-rates">
                L 1% · UR 5% · SSR 10% · SR 50% · R 34% (10× — last is SR+)
              </p>
              <div className="gx-row">
                <button className="btn gx-summon" onClick={summon} data-cursor>
                  ✦ Summon ×10
                </button>
                <button className="btn" onClick={() => setStage("collection")} data-cursor>
                  collection {collectionCount}/100
                </button>
                <button className="btn" onClick={() => setOpen(false)} data-cursor>
                  close
                </button>
              </div>
            </motion.div>
          )}

          {/* ───────── charge ───────── */}
          {stage === "charge" && (
            <div className="gx-charge">
              <div className="gx-charge-text">summoning…</div>
            </div>
          )}

          {/* ───────── reveal (one at a time) ───────── */}
          {stage === "reveal" && pulls[idx] && (
            <div className="gx-reveal" onClick={onRevealClick} data-cursor>
              {flying ? (
                <WarpProjectile
                  key={idx}
                  color={RARITIES[UNITS[pulls[idx].unitId].rarity].color}
                  rainbow={UNITS[pulls[idx].unitId].rarity === "L"}
                  onDone={() => setFlying(false)}
                />
              ) : (
                <>
                  <RevealCard pull={pulls[idx]} index={idx} total={pulls.length} />
                  <div className="gx-reveal-hint">tap to continue</div>
                </>
              )}
            </div>
          )}
          {stage === "reveal" && (
            <button
              className="btn gx-skip"
              onClick={() => {
                if (pulls.some((p) => UNITS[p.unitId].rarity === "L")) sound.success();
                setStage("summary");
              }}
              data-cursor
            >
              skip ⏭
            </button>
          )}

          {/* ───────── summary ───────── */}
          {stage === "summary" && (
            <motion.div className="gx-summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="gx-title">your pulls</h2>
              <div className="gx-grid ten">
                {pulls.map((p, i) => (
                  <SummaryCard key={i} pull={p} delay={i * 0.05} />
                ))}
              </div>
              <div className="gx-row">
                <button className="btn gx-summon" onClick={() => setStage("banner")} data-cursor>
                  summon again
                </button>
                <button className="btn" onClick={() => setStage("collection")} data-cursor>
                  collection
                </button>
                <button className="btn" onClick={() => setOpen(false)} data-cursor>
                  done
                </button>
              </div>
            </motion.div>
          )}

          {/* ───────── collection + merge ───────── */}
          {stage === "collection" && (
            <Collection owned={owned} onBack={() => setStage("banner")} onClose={() => setOpen(false)} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RevealCard({ pull, index, total }: { pull: PullResult; index: number; total: number }) {
  const unit = UNITS[pull.unitId];
  const d = RARITIES[unit.rarity];
  return (
    <motion.div
      key={index}
      className={`gx-card big rank-${d.rank}${d.rainbow ? " rainbow" : ""}`}
      initial={{ scale: 0.2, rotateY: 90, opacity: 0 }}
      animate={{ scale: 1, rotateY: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 18 }}
      style={{ "--r-color": d.color, "--r-color2": d.color2 } as React.CSSProperties}
    >
      <div className="gx-rarity-tag">{unit.rarity}</div>
      {pull.isNew && <div className="gx-new">NEW</div>}
      <UnitArt unit={unit} size={220} />
      <div className="gx-card-name">{unit.name}</div>
      <div className="gx-card-sub">{unit.src}</div>
    </motion.div>
  );
}

function SummaryCard({ pull, delay }: { pull: PullResult; delay: number }) {
  const unit = UNITS[pull.unitId];
  const d = RARITIES[unit.rarity];
  return (
    <motion.div
      className={`gx-card rank-${d.rank}${d.rainbow ? " rainbow" : ""}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 20 }}
      style={{ "--r-color": d.color, "--r-color2": d.color2 } as React.CSSProperties}
    >
      <div className="gx-rarity-tag sm">{unit.rarity}</div>
      {pull.isNew && <div className="gx-new sm">NEW</div>}
      <UnitArt unit={unit} size={104} animate={false} />
      <div className="gx-card-name sm">{unit.name}</div>
    </motion.div>
  );
}

function Collection({
  owned,
  onBack,
  onClose,
}: {
  owned: Record<number, { count: number; stars: number }>;
  onBack: () => void;
  onClose: () => void;
}) {
  const [sel, setSel] = useState<number | null>(null);
  const sorted = useMemo(
    () =>
      [...UNITS].sort((a, b) =>
        RARITIES[b.rarity].rank - RARITIES[a.rarity].rank || a.id - b.id,
      ),
    [],
  );
  const count = Object.keys(owned).length;

  return (
    <motion.div className="gx-collection" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="gx-collection-head">
        <h2 className="gx-title sm">collection · {count}/100</h2>
        <div className="gx-row">
          <button className="btn" onClick={onBack} data-cursor>← summon</button>
          <button className="btn" onClick={onClose} data-cursor>close</button>
        </div>
      </div>
      <div className="gx-legend">
        {RARITY_ORDER.slice().reverse().map((r) => (
          <span key={r} style={{ color: RARITIES[r].color }}>
            ● {r}
          </span>
        ))}
      </div>
      <div className="gx-grid coll">
        {sorted.map((u) => {
          const o = owned[u.id];
          const d = RARITIES[u.rarity];
          if (!o) {
            return (
              <div key={u.id} className="gx-cell locked" title="not yet summoned">
                <div className="gx-lock">?</div>
              </div>
            );
          }
          return (
            <button
              key={u.id}
              className={`gx-cell rank-${d.rank}${d.rainbow ? " rainbow" : ""}`}
              style={{ "--r-color": d.color } as React.CSSProperties}
              onClick={() => {
                setSel(u.id);
                sound.blip();
              }}
              data-cursor
            >
              <UnitArt unit={u} size={84} animate={false} />
              <Stars n={o.stars} />
              {o.count > 1 && <span className="gx-qty">×{o.count}</span>}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {sel !== null && owned[sel] && (
          <motion.div
            className="gx-detail-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSel(null)}
          >
            <UnitDetail id={sel} owned={owned[sel]} onClose={() => setSel(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function UnitDetail({
  id,
  owned,
  onClose,
}: {
  id: number;
  owned: { count: number; stars: number };
  onClose: () => void;
}) {
  const unit = UNITS[id];
  const d = RARITIES[unit.rarity];
  const dupes = Math.max(0, owned.count - 1);
  const cost = owned.stars + 1;
  const canMerge = gacha.canMerge(id);
  const maxed = owned.stars >= MAX_STARS;

  return (
    <motion.div
      className={`gx-detail rank-${d.rank}${d.rainbow ? " rainbow" : ""}`}
      style={{ "--r-color": d.color, "--r-color2": d.color2 } as React.CSSProperties}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.85, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      <UnitArt unit={unit} size={200} />
      <div className="gx-rarity-tag">{unit.rarity}</div>
      <div className="gx-card-name">{unit.name}</div>
      <div className="gx-card-sub">{unit.src}</div>
      <Stars n={owned.stars} />
      <div className="gx-detail-stats">
        owned ×{owned.count} · dupes {dupes}
      </div>
      {maxed ? (
        <div className="gx-maxed">★ MAX ★</div>
      ) : (
        <button
          className="btn gx-summon"
          disabled={!canMerge}
          onClick={() => {
            if (gacha.merge(id)) sound.success();
          }}
          data-cursor
        >
          {canMerge ? `merge → ${owned.stars + 1}★ (uses ${cost} dupe${cost > 1 ? "s" : ""})` : `need ${cost} dupe${cost > 1 ? "s" : ""} for ${owned.stars + 1}★`}
        </button>
      )}
      <button className="btn" onClick={onClose} data-cursor>close</button>
    </motion.div>
  );
}
