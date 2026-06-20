import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { unlock } from "../lib/achievements";
import { sound } from "../lib/sound";
import { useKeySequence, useTypedWords, useIdle } from "../lib/hooks";
import BlackHole from "./BlackHole";

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

export default function EasterEggs() {
  const [visitor, setVisitor] = useState(false);
  const [room, setRoom] = useState(false);

  // Konami code: arm the god pack and open the gacha, ready to pull.
  useKeySequence(KONAMI, () => {
    unlock("konami");
    window.dispatchEvent(new CustomEvent("nebula:gacha-godpack"));
  });

  // Typed-word triggers.
  useTypedWords({
    matrix: () => {
      unlock("matrix");
      window.dispatchEvent(new CustomEvent("nebula:matrix"));
    },
    disco: () => {
      unlock("disco");
      window.dispatchEvent(new CustomEvent("nebula:disco"));
    },
    eroizzy: () => {
      unlock("eroizzy");
      window.dispatchEvent(new CustomEvent("nebula:eroizzy"));
    },
    void: () => {
      if (location.hash !== "#void") location.hash = "void";
    },
  });

  // Idle visitor — drifts by if you do nothing.
  useIdle(22000, () => {
    setVisitor(true);
    unlock("idle");
    sound.tone(330, 0.3, "sine", 0.12);
    setTimeout(() => setVisitor(false), 9000);
  });

  // Hash rooms.
  useEffect(() => {
    const check = () => {
      const h = location.hash.replace("#", "").toLowerCase();
      if (h === "void" || h === "secret") {
        unlock("hash");
        setRoom(true);
        sound.zap();
      }
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, []);

  // Night owl.
  useEffect(() => {
    const hr = new Date().getHours();
    if (hr >= 0 && hr < 5) {
      setTimeout(() => unlock("night-owl"), 2500);
    }
  }, []);

  const closeRoom = () => {
    setRoom(false);
    if (location.hash) history.replaceState(null, "", location.pathname);
  };

  // The void is interactive (drag to orbit), so leave via Esc, not a click.
  useEffect(() => {
    if (!room) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRoom();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [room]);

  return (
    <>
      <AnimatePresence>
        {visitor && (
          <motion.div
            className="visitor"
            initial={{ x: "-12vw" }}
            animate={{ x: "112vw" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 9, ease: "linear" }}
            onClick={() => {
              sound.zap();
              window.dispatchEvent(new CustomEvent("nebula:confetti"));
            }}
            data-cursor
            data-no-star
          >
            🛸
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {room && (
          <motion.div
            className="void-room"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-no-star
          >
            <BlackHole />
            <motion.div
              className="void-copy"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1.2 }}
            >
              <h2 className="section-title" style={{ fontSize: "2rem" }}>
                the void
              </h2>
              <p className="lead">
                A Schwarzschild black hole, ray-traced live through curved
                spacetime. Light bends around it because the geometry tells it
                to. Drag to orbit, scroll to fall closer.
              </p>
              <p className="eyebrow" style={{ marginTop: "1.2rem" }}>
                drag to orbit · scroll to zoom · esc to leave
              </p>
            </motion.div>
            <button className="void-leave btn" onClick={closeRoom} data-cursor>
              ✕ leave
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
