import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { unlock } from "../lib/achievements";

export default function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 350, damping: 28, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 350, damping: 28, mass: 0.6 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    let lastX = 0;
    let lastDir = 0;
    let reversals = 0;
    let reversalTimer = 0;
    let dizzyFired = false;

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);

      // Shake detection: count rapid horizontal direction reversals.
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      const dir = Math.sign(dx);
      if (dir !== 0 && dir !== lastDir && Math.abs(dx) > 6) {
        reversals++;
        lastDir = dir;
        clearTimeout(reversalTimer);
        reversalTimer = window.setTimeout(() => (reversals = 0), 900);
        if (reversals >= 8 && !dizzyFired) {
          dizzyFired = true;
          unlock("dizzy");
          window.dispatchEvent(new CustomEvent("nebula:dizzy"));
          setTimeout(() => (dizzyFired = false), 5000);
        }
      }

      const el = e.target as HTMLElement | null;
      setHovering(
        !!el?.closest("button, a, [data-cursor], .btn, .logo, input"),
      );
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <>
      <motion.div className="cursor-dot" style={{ x, y }} />
      <motion.div
        className={`cursor-ring${hovering ? " hovering" : ""}`}
        style={{ x: ringX, y: ringY }}
      />
    </>
  );
}
