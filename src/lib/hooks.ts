import { useEffect, useRef } from "react";

/** Fires when the exact key sequence is entered (by event.key, case-insensitive). */
export function useKeySequence(sequence: string[], onMatch: () => void) {
  const buf = useRef<string[]>([]);
  const cb = useRef(onMatch);
  cb.current = onMatch;
  useEffect(() => {
    const want = sequence.map((s) => s.toLowerCase());
    const onKey = (e: KeyboardEvent) => {
      buf.current.push(e.key.toLowerCase());
      if (buf.current.length > want.length) buf.current.shift();
      if (
        buf.current.length === want.length &&
        buf.current.every((k, i) => k === want[i])
      ) {
        buf.current = [];
        cb.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sequence.join("|")]);
}

/** Buffers typed letters and fires when any registered word is spelled out. */
export function useTypedWords(words: Record<string, () => void>) {
  const buf = useRef("");
  const map = useRef(words);
  map.current = words;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key.length !== 1 || !/[a-z]/i.test(e.key)) return;
      buf.current = (buf.current + e.key.toLowerCase()).slice(-24);
      for (const word of Object.keys(map.current)) {
        if (buf.current.endsWith(word)) {
          buf.current = "";
          map.current[word]();
          break;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

/** Calls onIdle after `ms` of no user activity; onActive on the next interaction. */
export function useIdle(ms: number, onIdle: () => void, onActive?: () => void) {
  const idleCb = useRef(onIdle);
  const activeCb = useRef(onActive);
  idleCb.current = onIdle;
  activeCb.current = onActive;
  useEffect(() => {
    let timer: number;
    let isIdle = false;
    const reset = () => {
      if (isIdle) {
        isIdle = false;
        activeCb.current?.();
      }
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        isIdle = true;
        idleCb.current();
      }, ms);
    };
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, reset));
    };
  }, [ms]);
}
