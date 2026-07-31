import "server-only";

import { dispatchDueReminders } from "./reminders";

const INTERVALO_MS = 30_000;

/** Em desenvolvimento o módulo recarrega; o símbolo global evita dois timers. */
const FLAG = Symbol.for("agenda.scheduler");

type GlobalWithFlag = typeof globalThis & { [FLAG]?: boolean };

/**
 * Agendador em processo: só funciona em hospedagem com servidor sempre
 * ligado. Em serverless, use um cron externo chamando `/api/lembretes`.
 */
export function startReminderScheduler(): void {
  const globalRef = globalThis as GlobalWithFlag;
  if (globalRef[FLAG]) return;
  if (process.env.AGENDA_DISABLE_SCHEDULER === "1") return;
  globalRef[FLAG] = true;

  const tick = async () => {
    try {
      await dispatchDueReminders();
    } catch (error) {
      console.error("[agenda] erro ao processar lembretes", error);
    }
  };

  const timer = setInterval(tick, INTERVALO_MS);
  // Não segura o processo aberto ao encerrar.
  timer.unref?.();
  void tick();

  console.log("[agenda] agendador de lembretes ativo (a cada 30s)");
}
