import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ACHIEVEMENTS, achievements, unlock, TOTAL } from "../lib/achievements";
import { THEMES, themes } from "../lib/themes";
import { sound } from "../lib/sound";

interface Line {
  text: string;
  kind?: "in" | "out" | "err" | "ok";
}

const BANNER = [
  "NEBULA OS v1.0 — terminal session established.",
  "type `help` for commands · `exit` or ~ to close",
];

export default function Terminal() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>(
    BANNER.map((t) => ({ text: t, kind: "out" as const })),
  );
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing =
        t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA");
      if ((e.key === "~" || e.key === "`") && (!typing || open)) {
        e.preventDefault();
        setOpen((o) => {
          const next = !o;
          if (next) {
            unlock("terminal");
            sound.blip();
          }
          return next;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight);
  }, [lines, open]);

  const print = (text: string, kind: Line["kind"] = "out") =>
    setLines((l) => [...l, { text, kind }]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    setLines((l) => [...l, { text: `> ${cmd}`, kind: "in" }]);
    const [name, ...args] = cmd.toLowerCase().split(/\s+/);
    const arg = args.join(" ");

    switch (name) {
      case "":
        break;
      case "help":
        print("available commands:", "ok");
        print(
          "  help · secrets · theme <name> · themes · matrix · disco",
        );
        print(
          "  confetti · piano · whoami · about · stats · 42 · sudo · clear · exit",
        );
        break;
      case "secrets":
      case "ls": {
        print(`secrets found: ${achievements.count()}/${TOTAL}`, "ok");
        ACHIEVEMENTS.forEach((a) => {
          const got = achievements.has(a.id);
          print(`  ${got ? "✅" : "🔒"} ${got ? a.name : a.hint}`, got ? "ok" : "out");
        });
        break;
      }
      case "stats": {
        print(`progress: ${achievements.count()}/${TOTAL}`, "ok");
        print(`theme: ${themes.get()}`);
        print(`audio: ${sound.muted ? "muted" : "on"}`);
        break;
      }
      case "theme": {
        if (!arg) {
          print(`current: ${themes.get()}. try: ${THEMES.filter((t) => !t.secret).map((t) => t.id).join(", ")}`, "out");
          break;
        }
        const found = THEMES.find((t) => t.id === arg || t.name.toLowerCase() === arg);
        if (found) {
          themes.set(found.id);
          print(`theme → ${found.name}`, "ok");
        } else {
          print(`unknown theme: ${arg}`, "err");
        }
        break;
      }
      case "themes":
        print(THEMES.map((t) => t.id + (t.secret ? " (??)" : "")).join("  ·  "));
        break;
      case "matrix":
        window.dispatchEvent(new CustomEvent("nebula:matrix"));
        print("wake up...", "ok");
        break;
      case "disco":
        window.dispatchEvent(new CustomEvent("nebula:disco"));
        print("🪩 let there be funk", "ok");
        break;
      case "confetti":
        window.dispatchEvent(new CustomEvent("nebula:confetti"));
        print("🎉", "ok");
        break;
      case "piano":
        print("press P to summon the keyboard. then play A–K + W,E,T,Y,U.", "ok");
        window.dispatchEvent(new CustomEvent("nebula:piano-open"));
        break;
      case "whoami":
        print("a curious explorer with good taste.", "ok");
        break;
      case "about":
        print("NEBULA — a playground in the dark.", "ok");
        print("hand-built with React, Canvas, the Web Audio API, and too much coffee.");
        print("every pixel is interactive. most of it is hidden.");
        break;
      case "42":
        print("the answer to life, the universe, and everything.", "ok");
        window.dispatchEvent(new CustomEvent("nebula:confetti"));
        break;
      case "sudo":
        print("nice try. you already have root here.", "err");
        break;
      case "unlockall":
        ACHIEVEMENTS.forEach((a) => unlock(a.id));
        print("everything unlocked. completionist mode engaged.", "ok");
        break;
      case "clear":
        setLines([]);
        return;
      case "exit":
      case "close":
      case "quit":
        setOpen(false);
        return;
      default:
        print(`command not found: ${name}. try \`help\`.`, "err");
        sound.error();
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    run(value);
    setValue("");
    sound.click();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="terminal glass"
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          exit={{ y: "110%" }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          data-no-star
        >
          <div className="terminal-bar">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
            <span className="terminal-title">nebula — zsh</span>
          </div>
          <div className="terminal-body" ref={bodyRef}>
            {lines.map((l, i) => (
              <div key={i} className={`tline ${l.kind ?? "out"}`}>
                {l.text}
              </div>
            ))}
            <form onSubmit={submit} className="terminal-input">
              <span className="prompt">nebula@void ~ %</span>
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                aria-label="terminal input"
              />
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
