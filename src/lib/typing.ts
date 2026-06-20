// Distinguishes "typing a word" from "pressing a shortcut key" so that the
// single-key shortcuts (T, P, G) don't fire on letters that happen to fall
// inside a typed-word easter egg (e.g. the `t` in "matrix").
//
// A capture-phase listener records letter keystrokes before component
// handlers run, so isTyping() already accounts for the current key.

const stamps: number[] = [];
const WINDOW_MS = 400;

if (typeof window !== "undefined") {
  window.addEventListener(
    "keydown",
    (e) => {
      if (e.key.length === 1 && /[a-z0-9]/i.test(e.key)) {
        const now = Date.now();
        stamps.push(now);
        while (stamps.length && now - stamps[0] > WINDOW_MS) stamps.shift();
      }
    },
    true,
  );
}

/** True when at least two letter keys landed within the last 400ms. */
export function isTyping() {
  const now = Date.now();
  return stamps.filter((t) => now - t < WINDOW_MS).length >= 2;
}
