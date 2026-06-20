import { motion } from "framer-motion";
import { unlock } from "../lib/achievements";
import { sound } from "../lib/sound";

export default function Footer() {
  return (
    <footer
      className="section"
      style={{ minHeight: "70vh", justifyContent: "flex-end", paddingBottom: "4rem" }}
    >
      <motion.div
        onViewportEnter={() => {
          unlock("bottom");
          sound.blip();
        }}
        viewport={{ once: true }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center" }}
      >
        <div className="eyebrow">you reached the end</div>
        <h2 className="section-title" style={{ fontSize: "clamp(1.6rem,4vw,3rem)" }}>
          ...or did you?
        </h2>
        <p className="lead" style={{ margin: "0 auto 2rem" }}>
          Pressing <kbd>T</kbd> opens your trophy case. Pressing <kbd>?</kbd> shows
          the controls. And the URL bar is hiding rooms — try{" "}
          <code style={{ color: "var(--accent)" }}>#void</code>.
        </p>
        <button
          className="btn"
          data-cursor
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            sound.zap();
          }}
        >
          ↑ back to the top
        </button>
        <div
          style={{
            marginTop: "3rem",
            fontFamily: "var(--mono)",
            fontSize: "0.72rem",
            color: "var(--muted)",
            opacity: 0.5,
          }}
        >
          NEBULA · hand-built with React, Canvas & the Web Audio API · no
          frameworks were harmed
        </div>
      </motion.div>
    </footer>
  );
}
