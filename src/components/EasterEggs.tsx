import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { unlock } from "../lib/achievements";
import { sound } from "../lib/sound";
import { useKeySequence, useTypedWords, useIdle } from "../lib/hooks";

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

export default function EasterEggs() {
  const [visitor, setVisitor] = useState(false);
  const [room, setRoom] = useState(false);

  // Konami code (its confetti is handled by the celebration layer).
  useKeySequence(KONAMI, () => unlock("konami"));

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
            onClick={() => {
              setRoom(false);
              if (location.hash) history.replaceState(null, "", location.pathname);
            }}
            data-no-star
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ textAlign: "center", maxWidth: "40ch" }}
            >
              <div style={{ fontSize: "4rem" }}>🕳️</div>
              <h2 className="section-title" style={{ fontSize: "2rem" }}>
                the void
              </h2>
              <p className="lead">
                You found a room that isn't on the map. There's nothing here but
                quiet and the sound of your own curiosity.
              </p>
              <p className="eyebrow" style={{ marginTop: "1.5rem" }}>
                click anywhere to leave
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
