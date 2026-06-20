import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sound } from "../lib/sound";

const CONTROLS: [string, string][] = [
  ["~", "open the terminal (try `help`)"],
  ["T", "open your trophy case"],
  ["P", "summon the piano — then play the keys"],
  ["hold G", "let gravity loose"],
  ["?", "this menu"],
  ["Esc", "close anything"],
];

const NUDGES = [
  "The sky is clickable. One star hides; others connect.",
  "Hold your mouse down in the playground.",
  "Type words while you browse — matrix, disco, and others react.",
  "That old arcade cheat code still works here.",
  "Open your browser's dev console. Say hi.",
  "URLs can hide rooms. Try ending one with #void.",
  "Knock on the logo. Keep knocking.",
  "Some secrets reward patience. Others reward speed.",
];

export default function Help() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const toggle = () => {
      setOpen((o) => !o);
      sound.blip();
    };
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key === "?") {
        e.preventDefault();
        toggle();
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("nebula:help", toggle);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("nebula:help", toggle);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="modal glass"
            style={{ width: "min(560px, 100%)" }}
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            data-no-star
          >
            <div className="eyebrow" style={{ margin: 0 }}>
              how to play
            </div>
            <h2 style={{ fontSize: "1.6rem", margin: "0.4rem 0 1.2rem" }}>
              controls & clues
            </h2>

            <div style={{ display: "grid", gap: "0.5rem", marginBottom: "1.4rem" }}>
              {CONTROLS.map(([k, v]) => (
                <div
                  key={k}
                  style={{ display: "flex", gap: "0.9rem", alignItems: "center" }}
                >
                  <kbd style={{ minWidth: 64, textAlign: "center" }}>{k}</kbd>
                  <span style={{ color: "var(--muted)" }}>{v}</span>
                </div>
              ))}
            </div>

            <div className="eyebrow" style={{ margin: "0 0 0.6rem" }}>
              where to look
            </div>
            <ul style={{ listStyle: "none", display: "grid", gap: "0.45rem" }}>
              {NUDGES.map((n) => (
                <li
                  key={n}
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.92rem",
                    paddingLeft: "1.1rem",
                    position: "relative",
                  }}
                >
                  <span style={{ position: "absolute", left: 0, color: "var(--accent)" }}>
                    ›
                  </span>
                  {n}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
