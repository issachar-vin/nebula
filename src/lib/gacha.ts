import { useSyncExternalStore } from "react";

// ───────────────────────────── rarities ─────────────────────────────
export type Rarity = "R" | "SR" | "SSR" | "UR" | "L";

export interface RarityDef {
  key: Rarity;
  label: string;
  color: string; // primary frame/glow colour
  color2: string; // secondary (gradient)
  weight: number; // normal-banner pull weight
  rank: number; // 0..4, higher = rarer
  rainbow?: boolean;
}

export const RARITIES: Record<Rarity, RarityDef> = {
  R: { key: "R", label: "Rare", color: "#5aa9ff", color2: "#9fd2ff", weight: 0.34, rank: 0 },
  SR: { key: "SR", label: "Super Rare", color: "#48e6a0", color2: "#bafce0", weight: 0.5, rank: 1 },
  SSR: { key: "SSR", label: "Super Special Rare", color: "#ffc23d", color2: "#fff0b0", weight: 0.1, rank: 2 },
  UR: { key: "UR", label: "Ultra Rare", color: "#ff5ec7", color2: "#ffb0e6", weight: 0.05, rank: 3 },
  L: { key: "L", label: "Legendary", color: "#ffffff", color2: "#b8a6ff", weight: 0.01, rank: 4, rainbow: true },
};

export const RARITY_ORDER: Rarity[] = ["R", "SR", "SSR", "UR", "L"];

// ───────────────────────────── catalogue ────────────────────────────
// 100 characters from space/world-spanning games & anime. Fan tributes —
// represented by signature colours + a motif emoji (no copyrighted artwork).
// Popularity drives rarity: the most iconic are L/UR. Counts: R50·SR20·SSR15·UR10·L5.
export interface Unit {
  id: number;
  name: string;
  src: string; // franchise
  rarity: Rarity;
  icon: string; // motif emoji (legacy fallback flavour)
  c1: string; // primary colour
  c2: string; // secondary colour
  seed: number;
  /** Optional portrait at public/units/<id>.png — falls back to a monogram crest. */
  img?: string;
}

type Row = [name: string, src: string, icon: string, c1: string, c2: string];

const CATALOGUE: { rarity: Rarity; rows: Row[] }[] = [
  {
    rarity: "L",
    rows: [
      ["Master Chief", "Halo", "🪖", "#43611f", "#9fd24a"],
      ["Spike Spiegel", "Cowboy Bebop", "🔫", "#2f5a6e", "#9fb8c4"],
      ["Sora", "Kingdom Hearts", "🗝️", "#d0454f", "#2b3a67"],
      ["Goku", "Dragon Ball", "💥", "#f0901f", "#3a6ad0"],
      ["Samus Aran", "Metroid", "🚀", "#d4621f", "#e8c33a"],
    ],
  },
  {
    rarity: "UR",
    rows: [
      ["Cloud Strife", "Final Fantasy VII", "⚔️", "#6fae9a", "#2b3550"],
      ["Sephiroth", "Final Fantasy VII", "🌑", "#c8ccd4", "#1a1a22"],
      ["Ichigo Kurosaki", "Bleach", "🗡️", "#e8662a", "#1a1a22"],
      ["Monkey D. Luffy", "One Piece", "🏴‍☠️", "#d23a3a", "#f0c04a"],
      ["Asuka Langley", "Evangelion", "🤖", "#d23a4a", "#f0703a"],
      ["Commander Shepard", "Mass Effect", "🔫", "#b03030", "#2a3550"],
      ["2B", "NieR: Automata", "🖤", "#1a1a22", "#d8d2c0"],
      ["Link", "The Legend of Zelda", "🛡️", "#2f7d4f", "#d4af37"],
      ["Mario", "Super Mario Galaxy", "⭐", "#d83030", "#2a55d0"],
      ["Vegeta", "Dragon Ball", "💢", "#3a6ad0", "#f0c84a"],
    ],
  },
  {
    rarity: "SSR",
    rows: [
      ["Rei Ayanami", "Evangelion", "🤍", "#6fc0d0", "#d23a4a"],
      ["Roronoa Zoro", "One Piece", "⚔️", "#2f7d5a", "#1a1a22"],
      ["Rukia Kuchiki", "Bleach", "❄️", "#2a2a40", "#c0c8e0"],
      ["Faye Valentine", "Cowboy Bebop", "💜", "#b03060", "#e0c050"],
      ["Kamina", "Gurren Lagann", "🕶️", "#d23030", "#3a6ad0"],
      ["Kirby", "Kirby", "⭐", "#f098c0", "#f7cfe0"],
      ["Fox McCloud", "Star Fox", "🦊", "#6a8ad0", "#d8a030"],
      ["Cortana", "Halo", "🔮", "#3aa0d0", "#6fd0e0"],
      ["Frieza", "Dragon Ball", "💢", "#c050a0", "#e6e6ee"],
      ["Aerith Gainsborough", "Final Fantasy VII", "🌸", "#4a9a5a", "#e0a0b0"],
      ["Kafka", "Honkai: Star Rail", "🌌", "#6a3a8a", "#d23a5a"],
      ["Ratchet", "Ratchet & Clank", "🔧", "#b07030", "#d0a040"],
      ["Nami", "One Piece", "🌪️", "#e08030", "#4aa0d0"],
      ["9S", "NieR: Automata", "⚙️", "#20202a", "#c4c8b0"],
      ["Aloy", "Horizon", "🏹", "#c05030", "#4a9a8a"],
    ],
  },
  {
    rarity: "SR",
    rows: [
      ["Jet Black", "Cowboy Bebop", "🔧", "#5a4a3a", "#c08040"],
      ["Sanji", "One Piece", "🔥", "#e0c040", "#1a3a6a"],
      ["Tony Tony Chopper", "One Piece", "🦌", "#d08040", "#f0d0a0"],
      ["Renji Abarai", "Bleach", "⚔️", "#b03030", "#1a1a22"],
      ["Toshiro Hitsugaya", "Bleach", "❄️", "#8ad0e0", "#2a3a55"],
      ["Simon", "Gurren Lagann", "⛏️", "#3a6ad0", "#d23030"],
      ["Yoko Littner", "Gurren Lagann", "🎯", "#d23a4a", "#e0a030"],
      ["Arbiter", "Halo", "⚔️", "#3a5a4a", "#c0c8d0"],
      ["Garrus Vakarian", "Mass Effect", "🎯", "#4a6a7a", "#c08030"],
      ["Tifa Lockhart", "Final Fantasy VII", "👊", "#2a2a3a", "#c03050"],
      ["Piccolo", "Dragon Ball", "💢", "#3a8a5a", "#c0a040"],
      ["Gohan", "Dragon Ball", "📘", "#d0a040", "#3a6ad0"],
      ["Donald Duck", "Kingdom Hearts", "🔮", "#3a6ad0", "#e6e6ee"],
      ["Goofy", "Kingdom Hearts", "🛡️", "#2f7d4f", "#d0a040"],
      ["Riku", "Kingdom Hearts", "🗝️", "#3a4a6a", "#c0c8d0"],
      ["Meta Knight", "Kirby", "⚔️", "#2a3a8a", "#d0a040"],
      ["Falco Lombardi", "Star Fox", "🐦", "#4a6ad0", "#d03030"],
      ["Clank", "Ratchet & Clank", "🤖", "#6a8a9a", "#c0d0d8"],
      ["March 7th", "Honkai: Star Rail", "🏹", "#f0a0c0", "#6fd0e0"],
      ["Trunks", "Dragon Ball", "⚔️", "#7a4a9a", "#d0a040"],
    ],
  },
  {
    rarity: "R",
    rows: [
      ["Grunt", "Halo", "👽", "#3a6a4a", "#d0a040"],
      ["Sangheili Elite", "Halo", "👽", "#3a5a8a", "#c0c8d0"],
      ["Sgt. Johnson", "Halo", "🔫", "#4a3a2a", "#c08040"],
      ["343 Guilty Spark", "Halo", "🔵", "#3aa0d0", "#e6e6ee"],
      ["Jackal", "Halo", "🛡️", "#6a5a3a", "#c0a060"],
      ["Helldiver", "Helldivers 2", "🪖", "#d0a020", "#2a3a55"],
      ["Automaton Trooper", "Helldivers 2", "🤖", "#b03030", "#5a5a6a"],
      ["Terminid", "Helldivers 2", "🐛", "#d08030", "#6a8a3a"],
      ["Eagle-1", "Helldivers 2", "✈️", "#6a8ad0", "#d0d0d8"],
      ["Democracy Officer", "Helldivers 2", "🎖️", "#d0b020", "#3a4a6a"],
      ["Usopp", "One Piece", "🎯", "#8a5a3a", "#d0a040"],
      ["Franky", "One Piece", "🤖", "#3aa0d0", "#d6d6de"],
      ["Brook", "One Piece", "🎻", "#20202a", "#d6d6de"],
      ["Nico Robin", "One Piece", "🌸", "#20202a", "#6a3a8a"],
      ["Portgas D. Ace", "One Piece", "🔥", "#e0701f", "#1a1a22"],
      ["Buggy", "One Piece", "🤡", "#d23a5a", "#4a6ad0"],
      ["Orihime Inoue", "Bleach", "🌺", "#e08030", "#d6a0b0"],
      ["Yasutora Sado", "Bleach", "👊", "#8a5a3a", "#c08040"],
      ["Kenpachi Zaraki", "Bleach", "⚔️", "#1a1a22", "#d0c040"],
      ["Byakuya Kuchiki", "Bleach", "🌸", "#c0c8d0", "#d6a0b0"],
      ["Sosuke Aizen", "Bleach", "🌀", "#c4c4cc", "#6a3a8a"],
      ["Grimmjow", "Bleach", "🐆", "#3aa0d0", "#1a1a22"],
      ["Misato Katsuragi", "Evangelion", "🔫", "#6a3a5a", "#d04050"],
      ["Kaworu Nagisa", "Evangelion", "🎵", "#c4ccd4", "#d04050"],
      ["EVA Unit-01", "Evangelion", "🤖", "#6a3a8a", "#5a8a4a"],
      ["Gendo Ikari", "Evangelion", "🕶️", "#20202a", "#c08040"],
      ["Bulma", "Dragon Ball", "🔧", "#4aa0c0", "#d05080"],
      ["Krillin", "Dragon Ball", "🟠", "#e0801f", "#d0a040"],
      ["Cell", "Dragon Ball", "🟢", "#3a8a5a", "#20202a"],
      ["Majin Buu", "Dragon Ball", "🍬", "#f098c0", "#e6c0d0"],
      ["Beerus", "Dragon Ball", "🐱", "#6a3a8a", "#d0a040"],
      ["Kairi", "Kingdom Hearts", "🗝️", "#d0708a", "#c0c8d0"],
      ["Roxas", "Kingdom Hearts", "🗝️", "#d0c040", "#c0c8d0"],
      ["Axel", "Kingdom Hearts", "🔥", "#d03020", "#e0a040"],
      ["King Mickey", "Kingdom Hearts", "🗝️", "#1a1a22", "#d0a040"],
      ["Aqua", "Kingdom Hearts", "💧", "#3a6ad0", "#6fd0e0"],
      ["Wrex", "Mass Effect", "🦎", "#8a4a3a", "#c0a060"],
      ["Liara T'Soni", "Mass Effect", "🔮", "#4a6ad0", "#6a3a8a"],
      ["Legion", "Mass Effect", "🤖", "#c08030", "#6a8a9a"],
      ["Tali'Zorah", "Mass Effect", "🔧", "#6a3a8a", "#c050a0"],
      ["Barret Wallace", "Final Fantasy VII", "🔫", "#3a3a4a", "#c08040"],
      ["Vincent Valentine", "Final Fantasy VII", "🦇", "#b03030", "#20202a"],
      ["Zack Fair", "Final Fantasy VII", "⚔️", "#3a5a6a", "#d0a040"],
      ["Vash the Stampede", "Trigun", "🔫", "#d03030", "#d0c040"],
      ["Luigi", "Super Mario Galaxy", "🌟", "#3a8a4a", "#3a55d0"],
      ["Rosalina", "Super Mario Galaxy", "🌠", "#6fd0e0", "#d6c8e6"],
      ["Bowser", "Super Mario", "🐢", "#3a8a4a", "#d0a020"],
      ["Sonic", "Sonic the Hedgehog", "💨", "#3a6ad0", "#d0c040"],
      ["Shadow", "Sonic the Hedgehog", "🌑", "#1a1a22", "#d03030"],
      ["Stelle", "Honkai: Star Rail", "🌠", "#6a6a7a", "#d0a040"],
    ],
  },
];

export const UNITS: Unit[] = [];
{
  let id = 0;
  for (const grp of CATALOGUE) {
    for (const [name, src, icon, c1, c2] of grp.rows) {
      UNITS.push({ id, name, src, rarity: grp.rarity, icon, c1, c2, seed: (id * 2654435761) >>> 0 });
      id++;
    }
  }
}

const IDS_BY_RARITY: Record<Rarity, number[]> = { R: [], SR: [], SSR: [], UR: [], L: [] };
UNITS.forEach((u) => IDS_BY_RARITY[u.rarity].push(u.id));

export const MAX_STARS = 5;

// ───────────────────────────── pulling ──────────────────────────────
export interface PullResult {
  unitId: number;
  isNew: boolean;
}

function randId(rarity: Rarity): number {
  const pool = IDS_BY_RARITY[rarity];
  return pool[Math.floor(Math.random() * pool.length)];
}

function rollRarity(): Rarity {
  const r = Math.random();
  let acc = 0;
  for (const key of RARITY_ORDER) {
    acc += RARITIES[key].weight;
    if (r < acc) return key;
  }
  return "R";
}

/** Highest rarity present in a set of unit ids (drives the charge animation). */
export function topRarity(ids: number[]): Rarity {
  let best: Rarity = "R";
  for (const id of ids) {
    if (RARITIES[UNITS[id].rarity].rank > RARITIES[best].rank) best = UNITS[id].rarity;
  }
  return best;
}

/** A normal 10-pull. The 10th slot is guaranteed SR or better. */
export function rollTen(): number[] {
  const ids: number[] = [];
  for (let i = 0; i < 9; i++) ids.push(randId(rollRarity()));
  let last = rollRarity();
  if (last === "R") last = "SR";
  ids.push(randId(last));
  return ids;
}

/** The Konami "god pack": 5 Legendary + 5 Ultra Rare, shuffled for the reveal. */
export function rollGodPack(): number[] {
  const ids = [
    ...Array.from({ length: 5 }, () => randId("L")),
    ...Array.from({ length: 5 }, () => randId("UR")),
  ];
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

// ───────────────────────────── collection store ─────────────────────
interface Owned {
  count: number; // total copies owned (includes the base copy)
  stars: number; // 0..5
}

const KEY = "nebula.gacha.v1";

class GachaStore {
  private owned: Record<number, Owned> = {};
  private listeners = new Set<() => void>();
  private snap: Record<number, Owned> = {};

  constructor() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) this.owned = JSON.parse(raw);
    } catch {
      this.owned = {};
    }
    this.snap = { ...this.owned };
  }

  subscribe = (cb: () => void) => {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  };
  getSnapshot = () => this.snap;

  private commit() {
    localStorage.setItem(KEY, JSON.stringify(this.owned));
    this.snap = { ...this.owned };
    this.listeners.forEach((l) => l());
  }

  get(id: number): Owned | undefined {
    return this.owned[id];
  }

  /** Add pulled ids, returning per-item new/dup info (snapshot taken first). */
  add(ids: number[]): PullResult[] {
    const seen: Record<number, boolean> = {};
    const results: PullResult[] = ids.map((id) => {
      const had = !!this.owned[id] || seen[id];
      seen[id] = true;
      if (!this.owned[id]) this.owned[id] = { count: 0, stars: 0 };
      this.owned[id].count += 1;
      return { unitId: id, isNew: !had };
    });
    this.commit();
    return results;
  }

  /** Dupes available to feed (copies beyond the base one). */
  dupes(id: number): number {
    const o = this.owned[id];
    return o ? Math.max(0, o.count - 1) : 0;
  }

  /** Cost (in dupes) to reach the next star. */
  mergeCost(id: number): number {
    const o = this.owned[id];
    const stars = o ? o.stars : 0;
    return stars + 1;
  }

  canMerge(id: number): boolean {
    const o = this.owned[id];
    if (!o || o.stars >= MAX_STARS) return false;
    return this.dupes(id) >= this.mergeCost(id);
  }

  merge(id: number): boolean {
    if (!this.canMerge(id)) return false;
    const o = this.owned[id];
    o.count -= this.mergeCost(id); // consume dupes (base copy stays)
    o.stars += 1;
    this.commit();
    return true;
  }

  totalOwned(): number {
    return Object.keys(this.owned).length;
  }
}

export const gacha = new GachaStore();

export function useCollection() {
  const owned = useSyncExternalStore(gacha.subscribe, gacha.getSnapshot);
  return owned;
}
