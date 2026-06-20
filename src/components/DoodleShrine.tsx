import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sound } from "../lib/sound";

// A giant polaroid of the real eroizzy.com, taped to the screen by its corners.
export default function DoodleShrine() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => {
      setOpen(true);
      sound.success();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("nebula:eroizzy", show);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("nebula:eroizzy", show);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="shrine"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          data-no-star
        >
          <motion.div
            className="shrine-polaroid"
            initial={{ scale: 0.5, rotate: -10, opacity: 0, y: -40 }}
            animate={{ scale: 1, rotate: -2, opacity: 1, y: 0 }}
            exit={{ scale: 0.6, rotate: 14, opacity: 0 }}
            transition={{ type: "spring", stiffness: 210, damping: 17 }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="shrine-tape tl" />
            <span className="shrine-tape tr" />
            <span className="shrine-tape bl" />
            <span className="shrine-tape br" />
            <img src="/eroizzy.jpg" alt="the legend of eroizzy.com" />
            <div className="shrine-polaroid-caption">
              eroizzy.com — #TeamValor
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
