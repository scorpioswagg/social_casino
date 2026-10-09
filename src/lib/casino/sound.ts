/**
 * Sound architecture for Nocturne.
 * Tones are synthesized (no large audio assets). Games hook the same bus later.
 */
export type SoundId = "ui.click" | "ui.hover" | "reward" | "achievement" | "game.spin" | "ambience";

type Listener = (enabled: boolean) => void;

const KEY = "nocturne.sound";
let ctx: AudioContext | null = null;
let enabled = true;
const listeners = new Set<Listener>();

function readPref() {
  if (typeof window === "undefined") return true;
  const v = window.localStorage.getItem(KEY);
  if (v === null) return true;
  return v === "on";
}

export function isSoundEnabled() {
  return enabled;
}

export function hydrateSound() {
  enabled = readPref();
  listeners.forEach((l) => l(enabled));
}

export function subscribeSound(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function setSoundEnabled(next: boolean) {
  enabled = next;
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, next ? "on" : "off");
  listeners.forEach((l) => l(enabled));
  if (!next && ctx) void ctx.suspend();
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  ctx ??= new AudioContext();
  return ctx;
}

function beep(freq: number, dur: number, type: OscillatorType, gain = 0.04) {
  if (!enabled) return;
  const audio = ac();
  if (!audio) return;
  void audio.resume();
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur);
  osc.connect(g);
  g.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + dur);
}

export function playSound(id: SoundId) {
  switch (id) {
    case "ui.click":
      beep(520, 0.06, "triangle", 0.03);
      break;
    case "ui.hover":
      beep(740, 0.04, "sine", 0.012);
      break;
    case "reward":
      beep(523, 0.12, "sine", 0.05);
      setTimeout(() => beep(659, 0.14, "sine", 0.05), 80);
      setTimeout(() => beep(784, 0.18, "triangle", 0.05), 160);
      break;
    case "achievement":
      beep(392, 0.1, "triangle", 0.04);
      setTimeout(() => beep(523, 0.16, "triangle", 0.04), 90);
      break;
    case "game.spin":
      beep(220, 0.2, "sawtooth", 0.02);
      break;
    case "ambience":
      break;
  }
}
