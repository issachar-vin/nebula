import { useRef, useState } from "react";
import { unlock } from "../lib/achievements";
import { useTheme } from "../lib/themes";
import { sound } from "../lib/sound";

export default function Nav() {
  const clicks = useRef(0);
  const { current, cycle, set } = useTheme();
  const [muted, setMuted] = useState(sound.muted);

  const knock = () => {
    clicks.current++;
    sound.tone(300 + clicks.current * 40, 0.06, "square", 0.1);
    if (clicks.current === 7) {
      unlock("logo-7");
      set("vapor"); // reveal the hidden theme as the reward
      sound.success();
    }
  };

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    sound.click();
  };

  return (
    <nav className="nav">
      <div className="logo" onClick={knock} data-cursor title="NEBULA">
        ◈ NEBULA
      </div>
      <div className="nav-links">
        <span onClick={() => go("play")} data-cursor>play</span>
        <span onClick={() => go("game")} data-cursor>reactor</span>
        <span onClick={() => go("about")} data-cursor>about</span>
        <span
          onClick={() => cycle()}
          data-cursor
          title={`theme: ${current}`}
        >
          ◐ theme
        </span>
        <span
          onClick={() => {
            setMuted(sound.toggleMute());
            sound.blip();
          }}
          data-cursor
          title="toggle sound"
        >
          {muted ? "🔇 sound" : "🔊 sound"}
        </span>
      </div>
    </nav>
  );
}
