// Sons gerados na hora com Web Audio (sem arquivos): notas da escala
// pentatônica, que sempre soam bem juntas — qualquer rabisco vira música.

let ctx: AudioContext | null = null;
let soundOn = true;
let voiceOn = true;

export function configureSound(opts: { sound: boolean; voice: boolean }) {
  soundOn = opts.sound;
  voiceOn = opts.voice;
  if (!voiceOn && typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Chamar num toque do usuário para "destravar" o áudio no iOS. */
export function unlockAudio() {
  if (soundOn) audio();
}

const PENTA = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];

function tone(freq: number, dur: number, type: OscillatorType, vol: number, delay = 0) {
  if (!soundOn) return;
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

/** "Plop" alegre ao pintar uma área. */
export function pop(i = Math.floor(Math.random() * PENTA.length)) {
  const f = PENTA[i % PENTA.length];
  tone(f, 0.22, "triangle", 0.22);
  tone(f * 2, 0.12, "sine", 0.06, 0.03);
}

/** Nota suave enquanto desenha; `level` 0..1 (0 = embaixo, 1 = em cima). */
export function note(level: number) {
  const i = Math.max(0, Math.min(PENTA.length - 1, Math.round(level * (PENTA.length - 1))));
  tone(PENTA[i], 0.25, "sine", 0.09);
}

export function tap() {
  tone(660, 0.08, "sine", 0.1);
}

export function stamp() {
  tone(PENTA[Math.floor(Math.random() * 5) + 5], 0.18, "square", 0.05);
  tone(PENTA[Math.floor(Math.random() * 5)], 0.25, "triangle", 0.15);
}

export function fanfare() {
  [0, 2, 4, 5, 7, 10].forEach((n, k) => tone(PENTA[n], 0.35, "triangle", 0.18, k * 0.11));
}

export function vibrate(ms = 12) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* sem suporte */
  }
}

/** Fala a palavra (nome da cor ou do desenho) — estimula o vocabulário. */
export function speak(text: string) {
  if (!voiceOn || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    const pt = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith("pt"));
    if (pt) u.voice = pt;
    u.rate = 0.9;
    u.pitch = 1.25;
    synth.speak(u);
  } catch {
    /* ignora */
  }
}
