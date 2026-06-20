import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ACHIEVEMENTS, achievements, useAchievements } from "../lib/achievements";
import { sound } from "../lib/sound";
import { isTyping } from "../lib/typing";

function Toast() {
  const { lastUnlock } = useAchievements();
  useEffect(() => {
    if (!lastUnlock) return;
    const id = setTimeout(() => achievements.clearLast(), 3800);
    return () => clearTimeout(id);
  }, [lastUnlock]);

  return (
    <div className="toast-wrap">
      <AnimatePresence>
        {lastUnlock && (
          <motion.div
            key={lastUnlock.id}
            className="toast glass"
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <div className="toast-icon">{lastUnlock.icon}</div>
            <div>
              <div className="toast-label">secret unlocked</div>
              <div className="toast-name">{lastUnlock.name}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Gallery({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { unlocked, count, total } = useAchievements();
  const pct = Math.round((count / total) * 100);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal glass"
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            data-no-star
          >
            <div className="modal-head">
              <div>
                <div className="eyebrow" style={{ margin: 0 }}>
                  trophy case
                </div>
                <h2 style={{ fontSize: "1.6rem", marginTop: 4 }}>
                  {count} / {total} secrets found
                </h2>
              </div>
              <button className="btn" onClick={onClose} data-cursor>
                close ✕
              </button>
            </div>

            <div className="progress">
              <motion.div
                className="progress-bar"
                animate={{ width: `${pct}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>

            <div className="trophy-grid">
              {ACHIEVEMENTS.map((a) => {
                const got = unlocked.includes(a.id);
                return (
                  <div
                    key={a.id}
                    className={`trophy${got ? " got" : ""}`}
                    title={got ? a.name : "locked"}
                  >
                    <div className="trophy-icon">{got ? a.icon : "🔒"}</div>
                    <div className="trophy-name">{got ? a.name : "???"}</div>
                    <div className="trophy-hint">{got ? "found" : a.hint}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: "center", marginTop: "1.2rem" }}>
              <button
                className="btn"
                data-cursor
                onClick={() => {
                  if (confirm("Wipe all secret progress? This can't be undone.")) {
                    achievements.reset();
                    sound.error();
                  }
                }}
              >
                reset progress
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function AchievementUI() {
  const { count, total } = useAchievements();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key.toLowerCase() === "t" && !isTyping()) setOpen((o) => !o);
    };
    const openEvt = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("nebula:gallery", openEvt);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("nebula:gallery", openEvt);
    };
  }, []);

  return (
    <>
      <Toast />
      <div
        className="hud glass"
        data-cursor
        onClick={() => {
          setOpen(true);
          sound.blip();
        }}
        title="trophy case (T)"
      >
        🏆 {count}/{total} secrets
      </div>
      <Gallery open={open} onClose={() => setOpen(false)} />
    </>
  );
}
