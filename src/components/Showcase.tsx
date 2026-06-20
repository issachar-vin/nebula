import { motion } from "framer-motion";

// Abstract, scattered clue-fragments that drift in the dark — no grid, no
// numbers, no headings. Each whisper hints at a secret without naming it.
interface Whisper {
  text: string;
  x: number; // % across
  y: number; // % down within the band
  size: number; // rem
  rot: number;
  delay: number;
  drift: number; // px of slow vertical float
}

const WHISPERS: Whisper[] = [
  { text: "some codes never die", x: 12, y: 6, size: 2.2, rot: -4, delay: 0, drift: 14 },
  { text: "knock, and keep knocking", x: 62, y: 2, size: 1.4, rot: 3, delay: 0.1, drift: 20 },
  { text: "the sky is listening", x: 70, y: 18, size: 2.8, rot: -2, delay: 0.2, drift: 10 },
  { text: "type, and the world bends", x: 8, y: 26, size: 1.6, rot: 5, delay: 0.15, drift: 16 },
  { text: "a tilde opens a door", x: 40, y: 14, size: 1.2, rot: -6, delay: 0.25, drift: 22 },
  { text: "hold the weight", x: 28, y: 40, size: 3.2, rot: 2, delay: 0.05, drift: 8 },
  { text: "one key sings", x: 66, y: 44, size: 1.8, rot: -3, delay: 0.3, drift: 18 },
  { text: "nothing, for long enough", x: 14, y: 56, size: 1.3, rot: 4, delay: 0.2, drift: 24 },
  { text: "dress, undress, dress again", x: 52, y: 60, size: 2.0, rot: -5, delay: 0.1, drift: 12 },
  { text: "look behind the curtain", x: 8, y: 72, size: 1.5, rot: 6, delay: 0.35, drift: 16 },
  { text: "rooms hide in the address", x: 60, y: 76, size: 2.4, rot: -2, delay: 0.15, drift: 10 },
  { text: "the patient and the fast", x: 30, y: 88, size: 1.7, rot: 3, delay: 0.25, drift: 20 },
  { text: "a legend, drawn in ballpoint", x: 66, y: 92, size: 1.3, rot: -4, delay: 0.4, drift: 26 },
];

export default function Showcase() {
  return (
    <section className="whispers" id="whispers" aria-label="clues">
      {WHISPERS.map((w, i) => (
        <motion.span
          key={i}
          className="whisper"
          style={{
            left: `${w.x}%`,
            top: `${w.y}%`,
            fontSize: `${w.size}rem`,
            rotate: `${w.rot}deg`,
          }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{
            opacity: [0, 0.85, 0.55],
            y: [24, 0, -w.drift, 0],
          }}
          viewport={{ once: false, margin: "-10%" }}
          transition={{
            opacity: { duration: 1.4, delay: w.delay },
            y: {
              duration: 7 + (i % 4),
              delay: w.delay,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            },
          }}
          whileHover={{ opacity: 1, scale: 1.06, color: "var(--accent-2)" }}
          data-cursor
        >
          {w.text}
        </motion.span>
      ))}
    </section>
  );
}
