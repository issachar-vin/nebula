import { useSyncExternalStore } from "react";
import { sound } from "./sound";

export interface AchievementDef {
  id: string;
  name: string;
  /** Cryptic hint shown while still locked. */
  hint: string;
  icon: string;
}

// The full catalogue of secrets. Keep ids stable — they persist in storage.
export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-contact", name: "First Contact", hint: "Just... arrive.", icon: "👋" },
  { id: "konami", name: "The Old Ways", hint: "↑ ↑ ↓ ↓ ← → ← → B A", icon: "🎮" },
  { id: "terminal", name: "Root Access", hint: "Every good site has a back door. Try a tilde.", icon: "⌨️" },
  { id: "matrix", name: "Down the Rabbit Hole", hint: "Type what Neo saw.", icon: "💊" },
  { id: "disco", name: "Saturday Night", hint: "Type a word that makes things dance.", icon: "🪩" },
  { id: "gravity", name: "What Goes Up", hint: "Hold the key that pulls things down.", icon: "🍎" },
  { id: "logo-7", name: "Persistent", hint: "Knock on the logo. Keep knocking.", icon: "🚪" },
  { id: "star-clicker", name: "Eagle Eye", hint: "One star is closer than it looks.", icon: "⭐" },
  { id: "idle", name: "Patience", hint: "Do absolutely nothing for a while.", icon: "🧘" },
  { id: "dizzy", name: "Whirlwind", hint: "Shake your cursor like you mean it.", icon: "🌀" },
  { id: "piano", name: "Maestro", hint: "There is music in the keys. Find the octave.", icon: "🎹" },
  { id: "bottom", name: "The End", hint: "Go as far down as you can.", icon: "🕳️" },
  { id: "theme-hunter", name: "Chameleon", hint: "Wear every skin.", icon: "🎨" },
  { id: "secret-theme", name: "Vaporwave", hint: "A theme that isn't on the menu.", icon: "📼" },
  { id: "night-owl", name: "Night Owl", hint: "Visit when the world is asleep.", icon: "🦉" },
  { id: "hash", name: "Cartographer", hint: "URLs can hide rooms. #?", icon: "🗺️" },
  { id: "console", name: "Inspector", hint: "Developers always peek behind the curtain.", icon: "🔍" },
  { id: "constellation", name: "Stargazer", hint: "Connect the dots in the sky.", icon: "✨" },
  { id: "gravity-well", name: "Black Hole", hint: "Hold still in the drift and gather the dust.", icon: "🕳️" },
  { id: "speedrun", name: "Speedrunner", hint: "Find five secrets in under a minute.", icon: "⏱️" },
  { id: "half", name: "Halfway There", hint: "Find half of everything.", icon: "🌗" },
  { id: "completionist", name: "Completionist", hint: "Find it all. Every last one.", icon: "👑" },
  { id: "eroizzy", name: "#TeamValor", hint: "A legend, drawn in ballpoint. Type its name.", icon: "🔥" },
];

export const TOTAL = ACHIEVEMENTS.length;

const STORAGE_KEY = "nebula.achievements";

interface State {
  unlocked: string[];
  /** transient queue of just-unlocked ids for the toast layer */
  lastUnlock: AchievementDef | null;
}

function load(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

class AchievementStore {
  private state: State = { unlocked: load(), lastUnlock: null };
  private listeners = new Set<() => void>();
  private unlockTimes: number[] = [];

  subscribe = (cb: () => void) => {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  };

  getSnapshot = () => this.state;

  private emit() {
    this.state = { ...this.state };
    this.listeners.forEach((l) => l());
  }

  has(id: string) {
    return this.state.unlocked.includes(id);
  }

  count() {
    return this.state.unlocked.length;
  }

  // Grant a single secret: record it, persist, play sound, and fire the
  // per-secret event the celebration layer listens to. Returns true if new.
  private grant(id: string) {
    if (this.state.unlocked.includes(id)) return false;
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    if (!def) return false;
    this.state.unlocked.push(id);
    this.state.lastUnlock = def;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state.unlocked));
    sound.unlock();
    window.dispatchEvent(new CustomEvent("nebula:unlock", { detail: id }));
    return true;
  }

  unlock(id: string) {
    if (!this.grant(id)) return false;

    // Speedrun: 5 secrets within 60s.
    const now = Date.now();
    this.unlockTimes.push(now);
    this.unlockTimes = this.unlockTimes.filter((t) => now - t <= 60_000);
    if (this.unlockTimes.length >= 5) this.grant("speedrun");

    // Milestone meta-achievements.
    const real = this.state.unlocked.filter(
      (x) => x !== "half" && x !== "completionist",
    ).length;
    if (real >= Math.floor(TOTAL / 2)) this.grant("half");
    if (real >= TOTAL - 1) this.grant("completionist");

    this.emit();
    return true;
  }

  clearLast() {
    if (this.state.lastUnlock) {
      this.state.lastUnlock = null;
      this.emit();
    }
  }

  reset() {
    this.state.unlocked = [];
    this.state.lastUnlock = null;
    localStorage.removeItem(STORAGE_KEY);
    this.emit();
  }
}

export const achievements = new AchievementStore();

// Convenience for non-React modules / event handlers.
export function unlock(id: string) {
  return achievements.unlock(id);
}

export function useAchievements() {
  const state = useSyncExternalStore(
    achievements.subscribe,
    achievements.getSnapshot,
  );
  return {
    unlocked: state.unlocked,
    lastUnlock: state.lastUnlock,
    has: (id: string) => state.unlocked.includes(id),
    count: state.unlocked.length,
    total: TOTAL,
  };
}
