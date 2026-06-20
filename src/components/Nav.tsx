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

  return (
    <nav className="nav">
      <div className="logo" onClick={knock} data-cursor title="NEBULA">
        ◈ NEBULA
      </div>
      <div className="nav-links">
        <span onClick={() => cycle()} data-cursor title={`theme: ${current}`}>
          ◐
        </span>
        <span
          onClick={() => {
            setMuted(sound.toggleMute());
            sound.blip();
          }}
          data-cursor
          title="toggle sound"
        >
          {muted ? "🔇" : "🔊"}
        </span>
        <span
          onClick={() => {
            window.dispatchEvent(new CustomEvent("nebula:help"));
            sound.blip();
          }}
          data-cursor
          title="how to play"
        >
          ?
        </span>
      </div>
    </nav>
  );
}
