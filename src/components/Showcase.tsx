import { motion } from "framer-motion";
import { useRef } from "react";
import { sound } from "../lib/sound";

const CLUES = [
  { icon: "🎮", title: "Old habits", body: "Some codes never die. Arcade kids know exactly what to press." },
  { icon: "⌨️", title: "Back doors", body: "Every serious site has a console. A single key opens this one." },
  { icon: "💊", title: "Words have power", body: "Type the right word anywhere and the world changes. Try a few." },
  { icon: "🌌", title: "Look up", body: "The sky isn't just decoration. One star wants to be clicked, and dots want connecting." },
  { icon: "🍎", title: "Physics", body: "Hold the right key and gravity remembers it has a job to do." },
  { icon: "🎹", title: "Listen", body: "There's an instrument hiding one keystroke away. Play it an octave." },
  { icon: "🎨", title: "Dress up", body: "Wear every skin. One of them isn't on the menu — you'll have to knock." },
  { icon: "👑", title: "Everything", body: "There are secrets for the patient, the fast, the loud, and the nosy. Open the trophy case to track them." },
];

function Card({ icon, title, body, i }: (typeof CLUES)[number] & { i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateY(${px * 12}deg) rotateX(${-py * 12}deg) translateZ(8px)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = "";
  };
  return (
    <motion.div
      ref={ref}
      className="card glass"
      data-cursor
      onMouseMove={onMove}
      onMouseLeave={reset}
      onMouseEnter={() => sound.hover()}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: (i % 4) * 0.08, type: "spring", stiffness: 120 }}
    >
      <h3>
        <span style={{ marginRight: 8 }}>{icon}</span>
        {title}
      </h3>
      <p>{body}</p>
    </motion.div>
  );
}

export default function Showcase() {
  return (
    <section className="section" id="about">
      <div className="eyebrow">03 — the field guide</div>
      <h2 className="section-title">Clues, not spoilers.</h2>
      <p className="lead">
        24+ secrets are scattered across this page. Here's how to think about
        finding them. The rest is up to you.
      </p>
      <div className="grid-cards">
        {CLUES.map((c, i) => (
          <Card key={c.title} {...c} i={i} />
        ))}
      </div>
    </section>
  );
}
