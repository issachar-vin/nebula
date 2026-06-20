import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import "./lib/themes"; // applies persisted theme on import
import { achievements, unlock, TOTAL, ACHIEVEMENTS } from "./lib/achievements";
import { sound } from "./lib/sound";

// ---- Developer console easter egg -------------------------------------------
const art = `
   _   _ _____ ____  _   _ _        _
  | \\ | | ____| __ )| | | | |      / \\
  |  \\| |  _| |  _ \\| | | | |     / _ \\
  | |\\  | |___| |_) | |_| | |___ / ___ \\
  |_| \\_|_____|____/ \\___/|_____/_/   \\_\\
`;
console.log(
  `%c${art}`,
  "color:#7c5cff;font-family:monospace;font-size:12px;",
);
console.log(
  "%cWell, well. A fellow inspector.",
  "color:#22d3ee;font-size:16px;font-weight:bold;",
);
console.log(
  `%cThere are ${TOTAL} secrets hidden across this site.\n` +
    "Type %cnebula.help()%c to see what you can do from here.",
  "color:#8f8bc4;font-size:13px;",
  "color:#7c5cff;font-family:monospace;font-weight:bold;",
  "color:#8f8bc4;font-size:13px;",
);

const api = {
  help() {
    unlock("console");
    console.log(
      "%cnebula.* commands:",
      "color:#7c5cff;font-weight:bold;font-size:14px;",
    );
    console.table({
      "nebula.secrets()": "list every secret + whether you found it",
      "nebula.found()": "how many you've discovered",
      "nebula.hint()": "a random hint for something you're missing",
      "nebula.unlockAll()": "cheater. (it works though)",
      "nebula.reset()": "wipe your progress",
    });
    return "👀";
  },
  secrets() {
    unlock("console");
    console.table(
      ACHIEVEMENTS.map((a) => ({
        secret: a.name,
        found: achievements.has(a.id) ? "✅" : "—",
        hint: achievements.has(a.id) ? a.name : a.hint,
      })),
    );
    return `${achievements.count()}/${TOTAL}`;
  },
  found() {
    return `${achievements.count()}/${TOTAL} secrets found`;
  },
  hint() {
    unlock("console");
    const missing = ACHIEVEMENTS.filter((a) => !achievements.has(a.id));
    if (!missing.length) return "You found everything. Legend. 👑";
    const pick = missing[Math.floor(Math.random() * missing.length)];
    return `🔍 ${pick.hint}`;
  },
  unlockAll() {
    ACHIEVEMENTS.forEach((a) => unlock(a.id));
    return "Fine. Everything unlocked. No judgement. (Some judgement.)";
  },
  reset() {
    achievements.reset();
    return "Progress wiped. Fresh start.";
  },
};
(window as unknown as { nebula: typeof api }).nebula = api;

// First-contact + audio unlock on first interaction (browsers require a gesture).
const armAudio = () => {
  sound.blip();
  unlock("first-contact");
  window.removeEventListener("pointerdown", armAudio);
  window.removeEventListener("keydown", armAudio);
};
window.addEventListener("pointerdown", armAudio);
window.addEventListener("keydown", armAudio);
setTimeout(() => unlock("first-contact"), 4000);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
