import { useEffect, useRef, useState } from "react";
import { isTyping } from "../lib/typing";

/* ------------------------------------------------------------------ Matrix */
function MatrixRain({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const chars = "アァカサタナハマヤラワabcdef0123456789ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜ".split("");
    const fontSize = 16;
    let cols = Math.floor(w / fontSize);
    let drops = Array(cols).fill(1);
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      cols = Math.floor(w / fontSize);
      drops = Array(cols).fill(1);
    };
    window.addEventListener("resize", resize);
    let raf = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.07)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#34e89e";
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [active]);
  if (!active) return null;
  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        pointerEvents: "none",
        opacity: 0.85,
      }}
    />
  );
}

/* ------------------------------------------------------------------- Disco */
function DiscoLights({ active }: { active: boolean }) {
  useEffect(() => {
    document.body.classList.toggle("disco", active);
    return () => document.body.classList.remove("disco");
  }, [active]);
  if (!active) return null;
  return (
    <div className="disco-layer" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <span key={i} style={{ "--i": i } as React.CSSProperties} />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Confetti */
function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    type P = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      c: string;
      rot: number;
      vr: number;
    };
    let parts: P[] = [];
    const colors = ["#7c5cff", "#22d3ee", "#ff71ce", "#34e89e", "#ffd23f", "#ff6a3d"];
    const fire = () => {
      for (let i = 0; i < 220; i++) {
        parts.push({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
          vx: (Math.random() - 0.5) * 22,
          vy: (Math.random() - 0.5) * 22 - 4,
          r: 4 + Math.random() * 6,
          c: colors[Math.floor(Math.random() * colors.length)],
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.4,
        });
      }
    };
    window.addEventListener("nebula:confetti", fire);

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vy += 0.5;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y > canvas.height + 40) {
          parts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("nebula:confetti", fire);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      style={{ position: "fixed", inset: 0, zIndex: 600, pointerEvents: "none" }}
    />
  );
}

/* --------------------------------------------------------------- Gravity */
// Hold "g": every [data-grav] element detaches and falls with bounce.
function GravityField() {
  useEffect(() => {
    let active = false;
    let raf = 0;
    let els: {
      el: HTMLElement;
      ty: number;
      vy: number;
      vx: number;
      tx: number;
      rot: number;
      vr: number;
      floor: number;
      right: number;
    }[] = [];

    const start = () => {
      if (active) return;
      active = true;
      document.body.classList.add("gravity-on");
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>("[data-grav]"),
      );
      els = nodes.map((el) => {
        const r = el.getBoundingClientRect();
        return {
          el,
          ty: 0,
          tx: 0,
          vy: Math.random() * 2,
          vx: (Math.random() - 0.5) * 4,
          rot: 0,
          vr: (Math.random() - 0.5) * 8,
          floor: window.innerHeight - r.bottom - 4,
          right: window.innerWidth - r.right - 4,
        };
      });
      const tick = () => {
        for (const o of els) {
          o.vy += 0.9;
          o.ty += o.vy;
          o.tx += o.vx;
          o.rot += o.vr;
          if (o.ty > o.floor) {
            o.ty = o.floor;
            o.vy *= -0.55;
            o.vx *= 0.7;
            o.vr *= 0.7;
          }
          const leftBound = -o.el.getBoundingClientRect().left + 4;
          if (o.tx < leftBound) {
            o.tx = leftBound;
            o.vx *= -0.6;
          }
          if (o.tx > o.right) {
            o.tx = o.right;
            o.vx *= -0.6;
          }
          o.el.style.transform = `translate(${o.tx}px, ${o.ty}px) rotate(${o.rot}deg)`;
        }
        raf = requestAnimationFrame(tick);
      };
      tick();
    };

    const stop = () => {
      if (!active) return;
      active = false;
      document.body.classList.remove("gravity-on");
      cancelAnimationFrame(raf);
      for (const o of els) {
        o.el.style.transition = "transform 0.7s cubic-bezier(.34,1.56,.64,1)";
        o.el.style.transform = "translate(0,0) rotate(0deg)";
        setTimeout(() => (o.el.style.transition = ""), 800);
      }
    };

    const down = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key.toLowerCase() === "g" && !e.repeat && !isTyping()) start();
    };
    const up = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "g") stop();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}

/* ------------------------------------------------------------- Orchestrator */
export default function Effects() {
  const [matrix, setMatrix] = useState(false);
  const [disco, setDisco] = useState(false);

  useEffect(() => {
    const onMatrix = () => setMatrix((v) => !v);
    const onDisco = () => setDisco((v) => !v);
    const onDizzy = () => {
      document.body.classList.add("dizzy");
      setTimeout(() => document.body.classList.remove("dizzy"), 4000);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMatrix(false);
        setDisco(false);
      }
    };
    window.addEventListener("nebula:matrix", onMatrix);
    window.addEventListener("nebula:disco", onDisco);
    window.addEventListener("nebula:dizzy", onDizzy);
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("nebula:matrix", onMatrix);
      window.removeEventListener("nebula:disco", onDisco);
      window.removeEventListener("nebula:dizzy", onDizzy);
      window.removeEventListener("keydown", onEscape);
    };
  }, []);

  return (
    <>
      <MatrixRain active={matrix} />
      <DiscoLights active={disco} />
      <Confetti />
      <GravityField />
    </>
  );
}
