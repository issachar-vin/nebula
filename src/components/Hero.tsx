import { motion } from "framer-motion";
import { sound } from "../lib/sound";

const TITLE = "NEBULA".split("");

export default function Hero() {
  return (
    <section className="hero" id="top">
      <motion.div
        className="eyebrow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 0.1, duration: 1.4 }}
      >
        a playground in the dark
      </motion.div>

      <motion.h1
        className="title"
        aria-label="NEBULA"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        {TITLE.map((ch, i) => (
          <motion.span
            key={i}
            data-grav
            data-cursor
            style={{ display: "inline-block", cursor: "none" }}
            initial={{ opacity: 0, y: 80, rotateX: -90 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{
              delay: 0.2 + i * 0.08,
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
      </motion.h1>

      <motion.p
        className="lead"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1.6 }}
      >
        nothing here is a button. everything here is a door.
      </motion.p>

      <motion.div
        className="hero-scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0], y: [0, 10, 0] }}
        transition={{ delay: 1.8, duration: 2.4, repeat: Infinity }}
        aria-hidden="true"
      >
        ⌄
      </motion.div>
    </section>
  );
}
