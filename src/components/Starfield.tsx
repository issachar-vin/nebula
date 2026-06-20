import { useEffect, useRef } from "react";
import { unlock } from "../lib/achievements";
import { sound } from "../lib/sound";

interface Star {
  x: number;
  y: number;
  z: number; // depth 0..1, drives parallax + size
  tw: number; // twinkle phase
}

export default function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let w = (canvas.width = window.innerWidth * devicePixelRatio);
    let h = (canvas.height = window.innerHeight * devicePixelRatio);
    const dpr = devicePixelRatio;

    const STAR_COUNT = Math.min(
      220,
      Math.floor((window.innerWidth * window.innerHeight) / 9000),
    );
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random(),
      tw: Math.random() * Math.PI * 2,
    }));

    // The hidden golden star (Eagle Eye).
    const special = {
      x: Math.random() * w,
      y: Math.random() * h,
      pulse: 0,
    };
    const respawnSpecial = () => {
      special.x = (0.15 + Math.random() * 0.7) * w;
      special.y = (0.15 + Math.random() * 0.7) * h;
    };

    // Constellation in progress (Stargazer).
    let connected: { x: number; y: number }[] = [];

    const mouse = { x: w / 2, y: h / 2, tx: w / 2, ty: h / 2 };

    const resize = () => {
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
    };
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      mouse.tx = e.clientX * dpr;
      mouse.ty = e.clientY * dpr;
    };
    window.addEventListener("mousemove", onMove);

    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (el?.closest("button, a, .btn, input, textarea, [data-cursor], [data-no-star]"))
        return;
      const cx = e.clientX * dpr;
      const cy = e.clientY * dpr;

      // Hit-test the golden star first.
      const ds = Math.hypot(cx - special.x, cy - special.y);
      if (ds < 26 * dpr) {
        unlock("star-clicker");
        sound.success();
        burst(special.x, special.y, "#ffd23f");
        respawnSpecial();
        return;
      }

      // Otherwise try to connect a nearby star into a constellation.
      let best = -1;
      let bestD = 34 * dpr;
      for (let i = 0; i < stars.length; i++) {
        const d = Math.hypot(cx - stars[i].x, cy - stars[i].y);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      if (best >= 0) {
        connected.push({ x: stars[best].x, y: stars[best].y });
        sound.tone(440 + connected.length * 80, 0.1, "sine", 0.12);
        burst(stars[best].x, stars[best].y, "var-accent", 6);
        if (connected.length >= 5) {
          unlock("constellation");
          sound.success();
          setTimeout(() => (connected = []), 1600);
        }
      }
    };
    window.addEventListener("click", onClick);

    // Lightweight particle bursts for feedback.
    const parts: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      color: string;
    }[] = [];
    function burst(x: number, y: number, color: string, n = 14) {
      const c =
        color === "var-accent"
          ? getComputedStyle(document.documentElement)
              .getPropertyValue("--accent")
              .trim() || "#7c5cff"
          : color;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const sp = (1 + Math.random() * 3) * dpr;
        parts.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 1,
          color: c,
        });
      }
    }

    let raf = 0;
    let t = 0;
    const accent = () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim() || "#7c5cff";

    const draw = () => {
      t += 0.016;
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      ctx.clearRect(0, 0, w, h);

      const offX = (mouse.x - w / 2) / w;
      const offY = (mouse.y - h / 2) / h;

      // Stars
      for (const s of stars) {
        const par = 12 + s.z * 60;
        const px = s.x - offX * par * dpr;
        const py = s.y - offY * par * dpr;
        const size = (0.4 + s.z * 1.8) * dpr;
        const tw = 0.5 + 0.5 * Math.sin(t * 2 + s.tw);
        ctx.globalAlpha = 0.25 + s.z * 0.6 * tw;
        ctx.fillStyle = s.z > 0.85 ? accent() : "#cfd2ff";
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Constellation lines
      if (connected.length) {
        ctx.strokeStyle = accent();
        ctx.lineWidth = 1 * dpr;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        connected.forEach((p, i) =>
          i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y),
        );
        ctx.stroke();
        connected.forEach((p) => {
          ctx.beginPath();
          ctx.fillStyle = accent();
          ctx.arc(p.x, p.y, 3 * dpr, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }

      // Golden star (subtle, faintly pulsing — rewards sharp eyes)
      special.pulse += 0.05;
      const sp = 2 + Math.sin(special.pulse) * 0.8;
      ctx.fillStyle = "#ffd23f";
      ctx.globalAlpha = 0.55 + Math.sin(special.pulse) * 0.2;
      ctx.beginPath();
      ctx.arc(special.x, special.y, sp * dpr, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Particles
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.life -= 0.02;
        if (p.life <= 0) {
          parts.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return <canvas ref={ref} className="fixed-canvas" aria-hidden="true" />;
}
