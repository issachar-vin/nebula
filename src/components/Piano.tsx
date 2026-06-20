import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sound } from "../lib/sound";
import { unlock } from "../lib/achievements";

interface Key {
  k: string; // keyboard key
  midi: number;
  label: string;
  black?: boolean;
}

// One octave laid out so black keys sit between the right whites.
const KEYS: Key[] = [
  { k: "a", midi: 60, label: "A" },
  { k: "w", midi: 61, label: "W", black: true },
  { k: "s", midi: 62, label: "S" },
  { k: "e", midi: 63, label: "E", black: true },
  { k: "d", midi: 64, label: "D" },
  { k: "f", midi: 65, label: "F" },
  { k: "t", midi: 66, label: "T", black: true },
  { k: "g", midi: 67, label: "G" },
  { k: "y", midi: 68, label: "Y", black: true },
  { k: "h", midi: 69, label: "H" },
  { k: "u", midi: 70, label: "U", black: true },
  { k: "j", midi: 71, label: "J" },
  { k: "k", midi: 72, label: "K" },
];

const WHITE = KEYS.filter((k) => !k.black).map((k) => k.midi);

export default function Piano() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Set<number>>(new Set());
  const played = useRef<Set<number>>(new Set());

  useEffect(() => {
    const openPiano = () => setOpen(true);
    window.addEventListener("nebula:piano-open", openPiano);
    return () => window.removeEventListener("nebula:piano-open", openPiano);
  }, []);

  const play = (key: Key) => {
    sound.note(key.midi);
    setActive((s) => new Set(s).add(key.midi));
    setTimeout(
      () =>
        setActive((s) => {
          const n = new Set(s);
          n.delete(key.midi);
          return n;
        }),
      180,
    );
    played.current.add(key.midi);
    if (WHITE.every((m) => played.current.has(m))) unlock("piano");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key.toLowerCase() === "p" && !e.repeat) {
        setOpen((o) => !o);
        return;
      }
      if (!open || e.repeat) return;
      const key = KEYS.find((k) => k.k === e.key.toLowerCase());
      if (key) play(key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="piano glass"
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 200, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          data-no-star
        >
          {KEYS.map((key) => (
            <div
              key={key.midi}
              className={`key${key.black ? " black" : ""}${
                active.has(key.midi) ? " active" : ""
              }`}
              onMouseDown={() => play(key)}
              data-cursor
            >
              {key.label}
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
