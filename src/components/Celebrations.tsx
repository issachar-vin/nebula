import { useEffect, useRef } from "react";
import { ACHIEVEMENTS } from "../lib/achievements";

// Every secret gets its own signature flourish. A small canvas particle
// engine with a handful of behaviours; each achievement maps to one.

type Kind =
  | "confetti"
  | "fireworks"
  | "emojiBurst"
  | "emojiRain"
  | "emojiRise"
  | "ripple"
  | "implode"
  | "spiral"
  | "starburst"
  | "streaks"
  | "shockwave"
  | "bloom"
  | "glitch";

interface Effect {
  kind: Kind;
  emoji?: string;
  colors?: string[];
}

const RAINBOW = ["#ff6a3d", "#ffd23f", "#34e89e", "#22d3ee", "#7c5cff", "#ff71ce"];
const ACCENT = ["#7c5cff", "#22d3ee"];

const EFFECTS: Record<string, Effect> = {
  "first-contact": { kind: "bloom", colors: ACCENT },
  konami: { kind: "confetti", colors: RAINBOW },
  terminal: { kind: "glitch", colors: ["#34e89e"] },
  matrix: { kind: "emojiRain", emoji: "💊", colors: ["#34e89e"] },
  disco: { kind: "spiral", colors: RAINBOW },
  gravity: { kind: "emojiRise", emoji: "🎈" },
  "logo-7": { kind: "emojiBurst", emoji: "🚪" },
  "star-clicker": { kind: "starburst", colors: ["#ffd23f", "#fff3b0"] },
  idle: { kind: "emojiRise", emoji: "🧘" },
  dizzy: { kind: "spiral", colors: ["#22d3ee", "#7c5cff"] },
  piano: { kind: "emojiRise", emoji: "🎵" },
  bottom: { kind: "implode", colors: ["#7c5cff"] },
  "theme-hunter": { kind: "emojiBurst", emoji: "🎨" },
  "secret-theme": { kind: "confetti", colors: ["#ff71ce", "#01cdfe", "#ffe6ff"] },
  "night-owl": { kind: "emojiRise", emoji: "🦉" },
  hash: { kind: "emojiBurst", emoji: "🗺️" },
  console: { kind: "glitch", colors: ["#22d3ee"] },
  constellation: { kind: "starburst", colors: ACCENT },
  "gravity-well": { kind: "shockwave", colors: ["#7c5cff"] },
  speedrun: { kind: "streaks", colors: ["#22d3ee", "#ffffff"] },
  half: { kind: "ripple", colors: ["#7c5cff"] },
  completionist: { kind: "fireworks", colors: RAINBOW },
  eroizzy: { kind: "emojiRise", emoji: "🔥" },
};

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ay: number;
  life: number;
  max: number;
  size: number;
  rot: number;
  vr: number;
  curl: number;
  color: string;
  text?: string;
  draw: "rect" | "dot" | "emoji" | "ring" | "star" | "streak";
}

export default function Celebrations() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(devicePixelRatio, 2);
    let W = window.innerWidth;
    let H = window.innerHeight;
    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let parts: P[] = [];
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    const base = (over: Partial<P>): P => ({
      x: W / 2,
      y: H / 2,
      vx: 0,
      vy: 0,
      ay: 0,
      life: 90,
      max: 90,
      size: 6,
      rot: 0,
      vr: 0,
      curl: 0,
      color: "#fff",
      draw: "dot",
      ...over,
    });

    function burstAt(cx: number, cy: number, colors: string[]) {
      for (let i = 0; i < 46; i++) {
        const a = rnd(0, Math.PI * 2);
        const sp = rnd(1.5, 7);
        parts.push(
          base({
            x: cx, y: cy,
            vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
            ay: 0.09, life: rnd(50, 90), max: 90,
            size: rnd(1.6, 3.2), color: pick(colors), draw: "dot",
          }),
        );
      }
    }

    function fire(effect: Effect) {
      const cx = W / 2;
      const cy = H / 2;
      const colors = effect.colors ?? ACCENT;
      switch (effect.kind) {
        case "confetti":
          for (let i = 0; i < 200; i++) {
            const a = rnd(0, Math.PI * 2);
            const sp = rnd(4, 16);
            parts.push(base({
              x: cx, y: cy * 0.9,
              vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 5,
              ay: 0.32, life: rnd(90, 150), max: 150,
              size: rnd(6, 12), rot: rnd(0, 6), vr: rnd(-0.4, 0.4),
              color: pick(colors), draw: "rect",
            }));
          }
          break;
        case "fireworks": {
          const wave = (n: number) => {
            for (let i = 0; i < n; i++) {
              setTimeout(
                () => burstAt(rnd(W * 0.2, W * 0.8), rnd(H * 0.15, H * 0.55), colors),
                i * 180,
              );
            }
          };
          wave(8);
          break;
        }
        case "emojiBurst":
          for (let i = 0; i < 26; i++) {
            const a = rnd(0, Math.PI * 2);
            const sp = rnd(3, 9);
            parts.push(base({
              x: cx, y: cy,
              vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
              ay: 0.12, life: rnd(70, 110), max: 110,
              size: rnd(22, 36), rot: rnd(-0.4, 0.4), vr: rnd(-0.2, 0.2),
              text: effect.emoji, draw: "emoji",
            }));
          }
          break;
        case "emojiRain":
          for (let i = 0; i < 30; i++) {
            parts.push(base({
              x: rnd(0, W), y: rnd(-60, -10),
              vx: rnd(-0.6, 0.6), vy: rnd(2.5, 5.5),
              ay: 0.02, life: 200, max: 200,
              size: rnd(20, 32), rot: rnd(-0.3, 0.3), vr: rnd(-0.05, 0.05),
              text: effect.emoji, draw: "emoji",
            }));
          }
          break;
        case "emojiRise":
          for (let i = 0; i < 24; i++) {
            parts.push(base({
              x: rnd(0, W), y: rnd(H, H + 60),
              vx: rnd(-0.5, 0.5), vy: rnd(-3, -1.4),
              ay: 0, life: 170, max: 170,
              size: rnd(18, 30), rot: rnd(-0.3, 0.3), vr: rnd(-0.06, 0.06),
              text: effect.emoji, draw: "emoji",
            }));
          }
          break;
        case "ripple":
          for (let i = 0; i < 4; i++) {
            parts.push(base({
              x: cx, y: cy, vx: rnd(5, 7), size: 0,
              life: 70, max: 70, color: pick(colors), draw: "ring",
            }));
          }
          break;
        case "implode":
          for (let i = 0; i < 44; i++) {
            const a = (i / 44) * Math.PI * 2;
            const r = rnd(180, 280);
            const x = cx + Math.cos(a) * r;
            const y = cy + Math.sin(a) * r;
            const sp = rnd(5, 8);
            parts.push(base({
              x, y,
              vx: -Math.cos(a) * sp, vy: -Math.sin(a) * sp,
              life: rnd(34, 46), max: 46, size: rnd(2, 4),
              color: pick(colors), draw: "dot",
            }));
          }
          parts.push(base({ x: cx, y: cy, vx: 9, size: 0, life: 50, max: 50, color: pick(colors), draw: "ring" }));
          break;
        case "spiral":
          for (let i = 0; i < 70; i++) {
            const a = (i / 70) * Math.PI * 2;
            const sp = rnd(2, 5);
            parts.push(base({
              x: cx, y: cy,
              vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
              curl: 0.14, life: rnd(80, 130), max: 130,
              size: rnd(2, 4), color: colors[i % colors.length], draw: "dot",
            }));
          }
          break;
        case "starburst":
          for (let i = 0; i < 30; i++) {
            const a = rnd(0, Math.PI * 2);
            const sp = rnd(4, 10);
            parts.push(base({
              x: cx, y: cy,
              vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
              ay: 0.05, life: rnd(60, 90), max: 90,
              size: rnd(6, 13), rot: rnd(0, 6), vr: rnd(-0.3, 0.3),
              color: pick(colors), draw: "star",
            }));
          }
          break;
        case "streaks":
          for (let i = 0; i < 30; i++) {
            const a = rnd(0, Math.PI * 2);
            const sp = rnd(12, 22);
            parts.push(base({
              x: cx, y: cy,
              vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
              life: rnd(28, 44), max: 44, size: rnd(2, 3.5),
              color: pick(colors), draw: "streak",
            }));
          }
          break;
        case "shockwave":
          parts.push(base({ x: cx, y: cy, vx: 15, size: 0, life: 46, max: 46, color: pick(colors), draw: "ring" }));
          document.body.classList.add("celebrate-flash");
          setTimeout(() => document.body.classList.remove("celebrate-flash"), 220);
          break;
        case "bloom":
          for (let i = 0; i < 3; i++) {
            parts.push(base({
              x: cx, y: cy, vx: rnd(2, 3.2), size: i * 30,
              life: 100, max: 100, color: pick(colors), draw: "ring",
            }));
          }
          break;
        case "glitch":
          document.body.classList.add("celebrate-glitch");
          setTimeout(() => document.body.classList.remove("celebrate-glitch"), 700);
          break;
      }
    }

    const starPath = (s: number) => {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? s : s * 0.45;
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
    };

    const onUnlock = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      fire(EFFECTS[id] ?? { kind: "emojiBurst", emoji: ACHIEVEMENTS.find((a) => a.id === id)?.icon ?? "✨" });
    };
    window.addEventListener("nebula:unlock", onUnlock);

    let raf = 0;
    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        if (p.draw === "ring") {
          // For rings, vx is the radial growth rate; the center stays put.
          p.size += p.vx;
        } else {
          if (p.curl) {
            const c = Math.cos(p.curl);
            const s = Math.sin(p.curl);
            const nvx = p.vx * c - p.vy * s;
            const nvy = p.vx * s + p.vy * c;
            p.vx = nvx;
            p.vy = nvy;
          }
          p.vy += p.ay;
          p.x += p.vx;
          p.y += p.vy;
        }
        p.rot += p.vr;
        p.life--;
        if (p.life <= 0) {
          parts.splice(i, 1);
          continue;
        }
        const alpha = Math.min(1, p.life / p.max);

        if (p.draw === "rect") {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6);
          ctx.restore();
        } else if (p.draw === "dot") {
          ctx.globalAlpha = alpha;
          ctx.globalCompositeOperation = "lighter";
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalCompositeOperation = "source-over";
        } else if (p.draw === "emoji") {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.font = `${p.size}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.text ?? "✨", 0, 0);
          ctx.restore();
        } else if (p.draw === "ring") {
          ctx.globalAlpha = alpha * 0.7;
          ctx.globalCompositeOperation = "lighter";
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0, p.size), 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalCompositeOperation = "source-over";
        } else if (p.draw === "star") {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          starPath(p.size);
          ctx.fill();
          ctx.restore();
        } else if (p.draw === "streak") {
          ctx.globalAlpha = alpha;
          ctx.globalCompositeOperation = "lighter";
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 1.6, p.y - p.vy * 1.6);
          ctx.stroke();
          ctx.globalCompositeOperation = "source-over";
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("nebula:unlock", onUnlock);
    };
  }, []);

  return <canvas ref={ref} className="celebration-canvas" aria-hidden="true" />;
}
