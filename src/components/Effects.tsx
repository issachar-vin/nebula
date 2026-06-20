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
// Hold "g": gravity cuts out and every [data-grav] element eases into a slow,
// random weightless drift (with gentle sway + spin). Release to settle back.
function GravityField() {
  useEffect(() => {
    let active = false;
    let raf = 0;
    let els: {
      el: HTMLElement;
      tx: number;
      ty: number;
      vx: number;
      vy: number;
      dirx: number;
      diry: number;
      rot: number;
      vr: number;
      sway: number;
      minx: number;
      maxx: number;
      miny: number;
      maxy: number;
    }[] = [];

    const start = () => {
      if (active) return;
      active = true;
      document.body.classList.add("gravity-on");
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>("[data-grav]"),
      );
      const m = 2;
      els = nodes.map((el) => {
        const ang = Math.random() * Math.PI * 2;
        const target = 0.7 + Math.random() * 1.6; // eventual drift speed (px/frame)
        const r = el.getBoundingClientRect();
        // translate bounds so the element's edges stay within the viewport
        let minx = -r.left + m;
        let maxx = window.innerWidth - r.right - m;
        let miny = -r.top + m;
        let maxy = window.innerHeight - r.bottom - m;
        if (maxx < minx) minx = maxx = 0;
        if (maxy < miny) miny = maxy = 0;
        return {
          el,
          tx: 0,
          ty: 0,
          vx: 0,
          vy: 0,
          dirx: Math.cos(ang) * target,
          diry: Math.sin(ang) * target,
          rot: 0,
          vr: (Math.random() - 0.5) * 0.7,
          sway: Math.random() * Math.PI * 2,
          minx,
          maxx,
          miny,
          maxy,
        };
      });
      const tick = () => {
        for (const o of els) {
          // ease velocity toward the drift direction -> lets go *slowly*
          o.vx += (o.dirx - o.vx) * 0.015;
          o.vy += (o.diry - o.vy) * 0.015;
          o.sway += 0.02;
          o.tx += o.vx + Math.sin(o.sway) * 0.15;
          o.ty += o.vy + Math.cos(o.sway * 0.8) * 0.15;

          // bounce off the screen edges: reverse velocity *and* drift target
          if (o.tx <= o.minx) {
            o.tx = o.minx;
            o.vx = Math.abs(o.vx);
            o.dirx = Math.abs(o.dirx);
            o.vr = -o.vr;
          } else if (o.tx >= o.maxx) {
            o.tx = o.maxx;
            o.vx = -Math.abs(o.vx);
            o.dirx = -Math.abs(o.dirx);
            o.vr = -o.vr;
          }
          if (o.ty <= o.miny) {
            o.ty = o.miny;
            o.vy = Math.abs(o.vy);
            o.diry = Math.abs(o.diry);
          } else if (o.ty >= o.maxy) {
            o.ty = o.maxy;
            o.vy = -Math.abs(o.vy);
            o.diry = -Math.abs(o.diry);
          }

          o.rot += o.vr;
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
