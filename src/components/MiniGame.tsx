import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { unlock } from "../lib/achievements";
import { sound } from "../lib/sound";

const ROUND = 20; // seconds
const GOAL = 20; // hits to earn the secret

type Phase = "idle" | "playing" | "over";

export default function MiniGame() {
  const arenaRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(ROUND);
  const [best, setBest] = useState(() =>
    Number(localStorage.getItem("nebula.reactorBest") || 0),
  );
  const [target, setTarget] = useState({ x: 50, y: 50 });

  const moveTarget = () => {
    setTarget({ x: 8 + Math.random() * 84, y: 8 + Math.random() * 84 });
  };

  const start = () => {
    setScore(0);
    setTime(ROUND);
    setPhase("playing");
    moveTarget();
    sound.zap();
  };

  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === "playing" && time === 0) {
      setPhase("over");
      setBest((b) => {
        const nb = Math.max(b, score);
        localStorage.setItem("nebula.reactorBest", String(nb));
        return nb;
      });
      if (score >= GOAL) {
        unlock("reactor");
        sound.success();
      } else {
        sound.error();
      }
    }
  }, [time, phase, score]);

  const hit = () => {
    setScore((s) => s + 1);
    sound.tone(500 + Math.random() * 400, 0.07, "square", 0.16);
    moveTarget();
  };

  return (
    <section className="section" id="game">
      <div className="eyebrow">02 — the reactor</div>
      <h2 className="section-title">Quick draw.</h2>
      <p className="lead">
        Tap the core as many times as you can in {ROUND} seconds. Hit {GOAL}+ and
        you earn something. Best: {best}.
      </p>

      <div
        ref={arenaRef}
        className="glass"
        data-no-star
        style={{
          width: "min(100%, 760px)",
          height: "55vh",
          marginTop: "2.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {phase === "playing" && (
          <motion.button
            key={`${target.x}-${target.y}`}
            className="reactor-core"
            onClick={hit}
            data-cursor
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            style={{ left: `${target.x}%`, top: `${target.y}%` }}
            aria-label="hit the core"
          />
        )}

        <div
          style={{
            position: "absolute",
            top: 12,
            left: 16,
            fontFamily: "var(--mono)",
            color: "var(--muted)",
          }}
        >
          score: <strong style={{ color: "var(--accent)" }}>{score}</strong>
        </div>
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 16,
            fontFamily: "var(--mono)",
            color: time <= 5 ? "#ff5f56" : "var(--muted)",
          }}
        >
          {time}s
        </div>

        <AnimatePresence>
          {phase !== "playing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1.2rem",
              }}
            >
              {phase === "over" && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", fontWeight: 700 }}>
                    {score >= GOAL ? "⚡ reactor breached!" : "time!"}
                  </div>
                  <p className="lead" style={{ marginTop: "0.4rem" }}>
                    you scored {score}.{" "}
                    {score >= GOAL
                      ? "secret earned."
                      : `${GOAL - score} more next time.`}
                  </p>
                </div>
              )}
              <button className="btn" onClick={start} data-cursor>
                {phase === "idle" ? "▶ start" : "↻ again"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
