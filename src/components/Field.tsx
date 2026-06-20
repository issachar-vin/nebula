import { useEffect, useRef } from "react";
import { unlock } from "../lib/achievements";

// An ambient, goalless drift of luminous dust. It flows on its own, leans
// toward your cursor, and gathers when you hold the pointer down. No score,
// no win — just something to disturb. (Holding gathers the dust = a secret.)
interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hueShift: number;
}

export default function Field() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(devicePixelRatio, 2);
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

    const COUNT = Math.min(160, Math.floor((W * H) / 5500) || 120);
    const motes: Mote[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      hueShift: Math.random() * 40 - 20,
    }));

    const mouse = { x: -999, y: -999, inside: false, down: false };
    let holdStart = 0;
    let gathered = false;

    const rel = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.inside =
        e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    };
    const onMove = (e: PointerEvent) => rel(e);
    const onDown = (e: PointerEvent) => {
      rel(e);
      if (!mouse.inside) return;
      mouse.down = true;
      holdStart = Date.now();
    };
    const onUp = () => (mouse.down = false);
    window.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    const accent = () => {
      const v = getComputedStyle(document.documentElement);
      return {
        glow: v.getPropertyValue("--glow").trim() || "124,92,255",
      };
    };

    let raf = 0;
    let t = 0;
    const draw = () => {
      t += 0.004;
      ctx.clearRect(0, 0, W, H);
      const { glow } = accent();
      ctx.globalCompositeOperation = "lighter";

      if (mouse.down && Date.now() - holdStart > 1400 && !gathered) {
        gathered = true;
        unlock("gravity-well");
      }

      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        // organic flow field
        const a = Math.sin(m.y * 0.01 + t * 6) + Math.cos(m.x * 0.01 - t * 5);
        m.vx += Math.cos(a * Math.PI) * 0.02;
        m.vy += Math.sin(a * Math.PI) * 0.02;

        // cursor influence
        if (mouse.inside) {
          const dx = mouse.x - m.x;
          const dy = mouse.y - m.y;
          const d = Math.hypot(dx, dy) || 1;
          const pull = mouse.down ? 0.6 : 0.06;
          const range = mouse.down ? 1 : Math.max(0, 1 - d / 260);
          m.vx += (dx / d) * pull * range;
          m.vy += (dy / d) * pull * range;
        }

        m.vx *= 0.94;
        m.vy *= 0.94;
        m.x += m.vx;
        m.y += m.vy;

        // wrap softly
        if (m.x < -20) m.x = W + 20;
        if (m.x > W + 20) m.x = -20;
        if (m.y < -20) m.y = H + 20;
        if (m.y > H + 20) m.y = -20;

        const speed = Math.hypot(m.vx, m.vy);
        const r = 1.6 + Math.min(speed * 2, 6);
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, r * 4);
        g.addColorStop(0, `rgba(${glow},0.9)`);
        g.addColorStop(1, `rgba(${glow},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, r * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // faint links between near motes — abstract web
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = 1;
      for (let i = 0; i < motes.length; i++) {
        for (let j = i + 1; j < i + 6 && j < motes.length; j++) {
          const a = motes[i];
          const b = motes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 90) {
            ctx.strokeStyle = `rgba(${glow},${(1 - d / 90) * 0.12})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <section className="drift" id="drift">
      <div ref={wrapRef} className="drift-canvas-wrap" data-no-star>
        <canvas ref={canvasRef} />
      </div>
      <div className="drift-caption">
        <p>hold, and the dust comes to you</p>
      </div>
    </section>
  );
}
