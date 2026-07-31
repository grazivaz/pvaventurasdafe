"use client";

/**
 * Sons curtos gerados na hora com Web Audio — sem arquivo de áudio para
 * baixar. O navegador só libera áudio depois de um toque na tela, por isso
 * `unlockAudio()` é chamado quando a pessoa escolhe quem é.
 */

type Contexto = AudioContext & { resume: () => Promise<void> };

let contexto: Contexto | null = null;

function getContext(): Contexto | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!contexto) contexto = new Ctor() as Contexto;
  return contexto;
}

export function unlockAudio(): void {
  const ctx = getContext();
  if (ctx && ctx.state === "suspended") void ctx.resume();
}

function tocarNota(ctx: AudioContext, frequencia: number, inicio: number, duracao: number, volume: number) {
  const osc = ctx.createOscillator();
  const ganho = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(frequencia, inicio);

  ganho.gain.setValueAtTime(0, inicio);
  ganho.gain.linearRampToValueAtTime(volume, inicio + 0.015);
  ganho.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);

  osc.connect(ganho).connect(ctx.destination);
  osc.start(inicio);
  osc.stop(inicio + duracao + 0.05);
}

/** Sino de três notas para o lembrete de uma tarefa. */
export function playAlarm(): void {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();

  const agora = ctx.currentTime + 0.02;
  const notas = [880, 1108.73, 1318.51];
  notas.forEach((frequencia, i) => tocarNota(ctx, frequencia, agora + i * 0.16, 0.5, 0.22));
  // Repete o sino para chamar atenção mesmo com o celular longe.
  notas.forEach((frequencia, i) => tocarNota(ctx, frequencia, agora + 0.85 + i * 0.16, 0.5, 0.18));

  navigator.vibrate?.([180, 90, 180, 90, 300]);
}

/** Toque discreto quando a outra pessoa adiciona uma tarefa. */
export function playChime(): void {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();

  const agora = ctx.currentTime + 0.02;
  tocarNota(ctx, 987.77, agora, 0.28, 0.14);
  tocarNota(ctx, 1318.51, agora + 0.11, 0.34, 0.12);

  navigator.vibrate?.(120);
}
