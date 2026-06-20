import { motion } from "framer-motion";
import { sound } from "../lib/sound";

const TITLE = "NEBULA".split("");

export default function Hero() {
  return (
    <section className="section" id="top">
      <motion.div
        className="eyebrow"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        a playground in the dark
      </motion.div>

      <h1 className="title" aria-label="NEBULA">
        {TITLE.map((ch, i) => (
          <motion.span
            key={i}
            data-grav
            data-cursor
            style={{ display: "inline-block", cursor: "none" }}
            initial={{ opacity: 0, y: 80, rotateX: -90 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{
              delay: 0.2 + i * 0.07,
              type: "spring",
              stiffness: 200,
              damping: 12,
            }}
            whileHover={{
              y: -18,
              scale: 1.15,
              color: "var(--accent-2)",
              transition: { type: "spring", stiffness: 400, damping: 10 },
            }}
            onHoverStart={() => sound.tone(440 + i * 60, 0.06, "sine", 0.08)}
          >
            {ch}
          </motion.span>
        ))}
      </h1>

      <motion.p
        className="lead"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        style={{ marginTop: "1.5rem" }}
      >
        Everything here reacts to you. Most of it is hidden. There are{" "}
        <strong style={{ color: "var(--accent)" }}>secrets</strong> tucked into
        the keys, the corners, the sky, and the source. Go find them.
      </motion.p>

      <motion.div
        className="row"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        style={{ marginTop: "2.5rem" }}
      >
        <button
          className="btn"
          data-cursor
          onClick={() => {
            document.getElementById("play")?.scrollIntoView({ behavior: "smooth" });
            sound.zap();
          }}
        >
          ↓ enter the playground
        </button>
        <button
          className="btn"
          data-cursor
          onClick={() => {
            window.dispatchEvent(new CustomEvent("nebula:help"));
            sound.blip();
          }}
        >
          ? how do I find secrets
        </button>
      </motion.div>

      <motion.div
        className="eyebrow hint-pulse"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        style={{ marginTop: "3rem", fontSize: "0.7rem" }}
      >
        try the konami code · press ~ for a terminal · press ? for help
      </motion.div>
    </section>
  );
}
