import { useSyncExternalStore } from "react";
import { unlock } from "./achievements";

export interface Theme {
  id: string;
  name: string;
  secret?: boolean;
  vars: Record<string, string>;
}

export const THEMES: Theme[] = [
  {
    id: "nebula",
    name: "Nebula",
    vars: {
      "--bg": "#06060f",
      "--bg-2": "#0c0c20",
      "--fg": "#e8e6ff",
      "--muted": "#8f8bc4",
      "--accent": "#7c5cff",
      "--accent-2": "#22d3ee",
      "--glow": "124,92,255",
    },
  },
  {
    id: "aurora",
    name: "Aurora",
    vars: {
      "--bg": "#02100c",
      "--bg-2": "#04201a",
      "--fg": "#e6fff4",
      "--muted": "#7fd1b0",
      "--accent": "#34e89e",
      "--accent-2": "#0fb8ff",
      "--glow": "52,232,158",
    },
  },
  {
    id: "ember",
    name: "Ember",
    vars: {
      "--bg": "#120604",
      "--bg-2": "#22090a",
      "--fg": "#ffece4",
      "--muted": "#d99b86",
      "--accent": "#ff6a3d",
      "--accent-2": "#ffd23f",
      "--glow": "255,106,61",
    },
  },
  {
    id: "mono",
    name: "Mono",
    vars: {
      "--bg": "#0a0a0a",
      "--bg-2": "#161616",
      "--fg": "#f4f4f4",
      "--muted": "#999999",
      "--accent": "#ffffff",
      "--accent-2": "#bbbbbb",
      "--glow": "255,255,255",
    },
  },
  {
    id: "vapor",
    name: "Vaporwave",
    secret: true,
    vars: {
      "--bg": "#1a0533",
      "--bg-2": "#2d0a4e",
      "--fg": "#ffe6ff",
      "--muted": "#ff9ed8",
      "--accent": "#ff71ce",
      "--accent-2": "#01cdfe",
      "--glow": "255,113,206",
    },
  },
];

const STORAGE_KEY = "nebula.theme";
const SEEN_KEY = "nebula.themesSeen";

class ThemeStore {
  private current: string;
  private seen: Set<string>;
  private listeners = new Set<() => void>();

  constructor() {
    this.current = localStorage.getItem(STORAGE_KEY) || "nebula";
    if (!THEMES.some((t) => t.id === this.current)) this.current = "nebula";
    try {
      this.seen = new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]"));
    } catch {
      this.seen = new Set();
    }
    this.apply();
  }

  subscribe = (cb: () => void) => {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  };
  getSnapshot = () => this.current;

  private apply() {
    const theme = THEMES.find((t) => t.id === this.current);
    if (!theme) return;
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.dataset.theme = theme.id;
  }

  get() {
    return this.current;
  }

  set(id: string) {
    if (!THEMES.some((t) => t.id === id)) return;
    this.current = id;
    localStorage.setItem(STORAGE_KEY, id);
    this.apply();

    this.seen.add(id);
    localStorage.setItem(SEEN_KEY, JSON.stringify([...this.seen]));

    if (id === "vapor") unlock("secret-theme");
    const menuThemes = THEMES.filter((t) => !t.secret).map((t) => t.id);
    if (menuThemes.every((m) => this.seen.has(m))) unlock("theme-hunter");

    this.listeners.forEach((l) => l());
  }

  cycle() {
    const visible = THEMES.filter((t) => !t.secret);
    const idx = visible.findIndex((t) => t.id === this.current);
    this.set(visible[(idx + 1) % visible.length].id);
  }
}

export const themes = new ThemeStore();

export function useTheme() {
  const current = useSyncExternalStore(themes.subscribe, themes.getSnapshot);
  return { current, set: (id: string) => themes.set(id), cycle: () => themes.cycle() };
}
