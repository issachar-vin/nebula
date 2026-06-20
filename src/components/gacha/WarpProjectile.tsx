import { useEffect, useRef } from "react";

// A unit "warps in": a ray of light shoots out of the portal, flies around the
// screen a few times trailing a long comet tail, then spirals back to center,
// rushes toward the viewer (growing), and explodes — at which point onDone
// fires and the card is revealed. Colour = the unit's rarity (rainbow for L).

const DUR = 1900;
const TAU = Math.PI * 2;
const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);
const easeIn = (u: number) => u * u * u;

function parseRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export default function WarpProjectile({
  color,
  rainbow = false,
  onDone,
}: {
  color: string;
  rainbow?: boolean;
  onDone: () => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(devicePixelRatio, 2);
    let W = 0;
    let H = 0;
    const resize = () => {
      W = canvas.width = Math.max(1, canvas.clientWidth * dpr);
      H = canvas.height = Math.max(1, canvas.clientHeight * dpr);
    };
    resize();
    window.addEventListener("resize", resize);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const base = parseRgb(color);
    const col = (phase: number, alpha: number) =>
      rainbow
        ? `hsla(${(phase * 900) % 360}, 95%, 62%, ${alpha})`
        : `rgba(${base[0]}, ${base[1]}, ${base[2]}, ${alpha})`;

    const trail: { x: number; y: number; s: number; h: number }[] = [];
    const burst: { x: number; y: number; vx: number; vy: number; life: number; h: number }[] = [];
    let exploded = false;
    const start = performance.now();
    let raf = 0;

    const loop = (now: number) => {
      const t = Math.min(1, (now - start) / DUR);
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;
      const R = Math.min(W, H) * 0.42;
      const exploding = t >= 0.9;

      if (!exploding) {
        let rad: number;
        let ang: number;
        let sz: number;
        if (t < 0.68) {
          const u = t / 0.68; // fly around the screen
          rad = easeOut(Math.min(1, u * 1.5)) * R;
          ang = 0.4 + u * TAU * 2.6;
          sz = (5 + u * 10) * dpr;
        } else {
          const u = (t - 0.68) / 0.22; // spiral back to center, rushing in
          rad = (1 - easeIn(u)) * R;
          ang = 0.4 + TAU * 2.6 + u * TAU * 1.2;
          sz = (15 + u * 48) * dpr;
        }
        const x = cx + Math.cos(ang) * rad;
        const y = cy + Math.sin(ang) * rad;
        trail.push({ x, y, s: sz, h: t });
        if (trail.length > 46) trail.shift();

        ctx.globalCompositeOperation = "lighter";
        // connected ray of light through the trail
        for (let i = 1; i < trail.length; i++) {
          const p = trail[i];
          const q = trail[i - 1];
          const a = i / trail.length;
          ctx.strokeStyle = col(p.h, a * 0.5);
          ctx.lineWidth = p.s * a * 0.9;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(q.x, q.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
        // glowing head
        const g = ctx.createRadialGradient(x, y, 0, x, y, sz * 2.8);
        g.addColorStop(0, col(t, 1));
        g.addColorStop(0.3, col(t, 0.8));
        g.addColorStop(1, col(t, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, sz * 2.8, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.beginPath();
        ctx.arc(x, y, sz * 0.42, 0, TAU);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
      } else {
        if (!exploded) {
          exploded = true;
          for (let i = 0; i < 64; i++) {
            const a = Math.random() * TAU;
            const sp = (4 + Math.random() * 13) * dpr;
            burst.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, h: Math.random() });
          }
        }
        const fa = Math.max(0, 1 - (t - 0.9) / 0.1);
        ctx.globalCompositeOperation = "lighter";
        // shockwave flash
        ctx.fillStyle = `rgba(255,255,255,${fa * 0.95})`;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.min(W, H) * 0.6 * (1 - fa) + 24 * dpr, 0, TAU);
        ctx.fill();
        for (const p of burst) {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.93;
          p.vy *= 0.93;
          p.life -= 0.035;
          if (p.life <= 0) continue;
          ctx.globalAlpha = p.life;
          ctx.fillStyle = col(p.h, 1);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3.4 * dpr, 0, TAU);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      }

      if (t >= 1) {
        done.current();
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      ro.disconnect();
    };
  }, [color, rainbow]);

  return <canvas ref={ref} className="gx-projectile" aria-hidden="true" />;
}
