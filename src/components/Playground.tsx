import { useEffect, useRef, useState } from "react";
import { unlock } from "../lib/achievements";
import { sound } from "../lib/sound";

interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  c: string;
  alive: boolean;
}

const PALETTE = ["#7c5cff", "#22d3ee", "#ff71ce", "#34e89e", "#ffd23f", "#ff6a3d"];

export default function Playground() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = devicePixelRatio;
    let W = 0;
    let H = 0;

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      W = r.width;
      H = r.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let orbs: Orb[] = [];
    const spawn = () => {
      const n = 18;
      orbs = Array.from({ length: n }, () => {
        const r = 14 + Math.random() * 26;
        return {
          x: r + Math.random() * (W - 2 * r),
          y: r + Math.random() * (H - 2 * r),
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          r,
          c: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          alive: true,
        };
      });
      setRemaining(n);
    };
    spawn();

    const parts: { x: number; y: number; vx: number; vy: number; life: number; c: string }[] = [];
    const burst = (x: number, y: number, c: string) => {
      for (let i = 0; i < 18; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 1 + Math.random() * 5;
        parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, c });
      }
    };

    const mouse = { x: -999, y: -999, down: false };
    let holdStart = 0;
    let wellFired = false;

    const rel = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onMove = (e: MouseEvent) => rel(e);
    const onDown = (e: MouseEvent) => {
      rel(e);
      mouse.down = true;
      holdStart = Date.now();
      // pop an orb if clicked directly
      for (const o of orbs) {
        if (o.alive && Math.hypot(o.x - mouse.x, o.y - mouse.y) < o.r) {
          o.alive = false;
          burst(o.x, o.y, o.c);
          sound.tone(300 + o.r * 8, 0.12, "triangle", 0.18);
          const left = orbs.filter((q) => q.alive).length;
          setRemaining(left);
          if (left === 0) {
            unlock("orb-pop");
            sound.success();
            setTimeout(spawn, 900);
          }
          return;
        }
      }
    };
    const onUp = () => (mouse.down = false);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    let raf = 0;
    const loop = () => {
      ctx.clearRect(0, 0, W, H);

      // gravity well while holding
      if (mouse.down) {
        for (const o of orbs) {
          if (!o.alive) continue;
          const dx = mouse.x - o.x;
          const dy = mouse.y - o.y;
          const d = Math.hypot(dx, dy) || 1;
          const f = Math.min(60, 1200 / d) * 0.02;
          o.vx += (dx / d) * f;
          o.vy += (dy / d) * f;
        }
        if (!wellFired && Date.now() - holdStart > 1400) {
          wellFired = true;
          unlock("gravity-well");
        }
        // draw the well
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fill();
      }

      for (const o of orbs) {
        if (!o.alive) continue;
        o.vx *= 0.995;
        o.vy *= 0.995;
        o.x += o.vx;
        o.y += o.vy;
        if (o.x < o.r) (o.x = o.r), (o.vx *= -0.9);
        if (o.x > W - o.r) (o.x = W - o.r), (o.vx *= -0.9);
        if (o.y < o.r) (o.y = o.r), (o.vy *= -0.9);
        if (o.y > H - o.r) (o.y = H - o.r), (o.vy *= -0.9);

        const grad = ctx.createRadialGradient(
          o.x - o.r * 0.3,
          o.y - o.r * 0.3,
          o.r * 0.1,
          o.x,
          o.y,
          o.r,
        );
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.25, o.c);
        grad.addColorStop(1, "rgba(0,0,0,0.25)");
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.shadowColor = o.c;
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.life -= 0.025;
        if (p.life <= 0) {
          parts.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <section className="section" id="play">
      <div className="eyebrow">01 — the playground</div>
      <h2 className="section-title">Poke at things.</h2>
      <p className="lead">
        Pop the orbs. Hold your mouse down to bend them toward you like a tiny
        black hole. Clear the field and they come back. (Two secrets live in
        here.)
      </p>
      <div
        ref={wrapRef}
        className="glass"
        data-no-star
        style={{
          width: "min(100%, 1000px)",
          height: "60vh",
          marginTop: "2.5rem",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%", display: "block", cursor: "none" }}
        />
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 14,
            fontFamily: "var(--mono)",
            fontSize: "0.8rem",
            color: "var(--muted)",
            pointerEvents: "none",
          }}
        >
          orbs left: {remaining}
        </div>
      </div>
    </section>
  );
}
