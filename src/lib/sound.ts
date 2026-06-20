// Tiny Web Audio synth. No asset files — everything is generated.
// Respects a global mute flag persisted in localStorage.

type WaveType = OscillatorType;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private _muted: boolean;

  constructor() {
    this._muted = localStorage.getItem("nebula.muted") === "1";
  }

  private ensure() {
    if (!this.ctx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = this._muted ? 0 : 0.5;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  get muted() {
    return this._muted;
  }

  setMuted(v: boolean) {
    this._muted = v;
    localStorage.setItem("nebula.muted", v ? "1" : "0");
    if (this.master) this.master.gain.value = v ? 0 : 0.5;
  }

  toggleMute() {
    this.setMuted(!this._muted);
    return this._muted;
  }

  // A single shaped tone.
  tone(
    freq: number,
    dur = 0.12,
    type: WaveType = "sine",
    gain = 0.3,
    when = 0,
  ) {
    if (this._muted) return;
    const ctx = this.ensure();
    if (!this.master) return;
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  // UI sounds -------------------------------------------------------------
  blip() {
    this.tone(660, 0.08, "triangle", 0.18);
  }
  hover() {
    this.tone(880, 0.05, "sine", 0.07);
  }
  click() {
    this.tone(520, 0.06, "square", 0.12);
    this.tone(780, 0.05, "square", 0.08, 0.03);
  }
  error() {
    this.tone(160, 0.18, "sawtooth", 0.2);
  }
  success() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      this.tone(f, 0.16, "triangle", 0.22, i * 0.07),
    );
  }
  unlock() {
    [392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      this.tone(f, 0.2, "triangle", 0.2, i * 0.06),
    );
  }
  zap() {
    const ctx = this.ensure();
    if (this._muted || !this.master) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.18);
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  // A note by MIDI number — used by the secret piano.
  note(midi: number, dur = 0.4, type: WaveType = "triangle") {
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    this.tone(freq, dur, type, 0.28);
  }
}

export const sound = new SoundEngine();
