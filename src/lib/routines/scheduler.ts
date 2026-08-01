import "server-only";

import { dispatchDueRoutineReminders } from "./reminders";

const INTERVALO_MS = 60_000;

/** Em desenvolvimento o módulo recarrega; o símbolo global evita dois timers. */
const FLAG = Symbol.for("agenda.routines.scheduler");

type GlobalWithFlag = typeof globalThis & { [FLAG]?: boolean };

/**
 * Agendador próprio das rotinas, independente do agendador de tarefas.
 * Mesma limitação: só funciona em hospedagem com servidor sempre ligado. Em
 * serverless, use um cron externo chamando `/api/rotinas/lembretes`.
 */
export function startRoutineReminderScheduler(): void {
  const globalRef = globalThis as GlobalWithFlag;
  if (globalRef[FLAG]) return;
  if (process.env.AGENDA_DISABLE_SCHEDULER === "1") return;
  globalRef[FLAG] = true;

  const tick = async () => {
    try {
      await dispatchDueRoutineReminders();
    } catch (error) {
      console.error("[rotinas] erro ao processar lembretes", error);
    }
  };

  const timer = setInterval(tick, INTERVALO_MS);
  timer.unref?.();
  void tick();

  console.log("[rotinas] agendador de lembretes ativo (a cada 1 min)");
}
