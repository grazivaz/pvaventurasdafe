import "server-only";

import { PERSON_IDS } from "../people";
import { sendPush } from "../push";
import { getStore } from "../store";
import { todayKey } from "../date";
import { ROUTINE_AREAS, type Routine } from "./types";

/**
 * Rotina atrasada e ignorada volta a lembrar depois desse tanto de dias —
 * um empurrãozinho a mais em vez de avisar uma vez só e deixar esquecer.
 */
const REINSISTIR_APOS_DIAS = 3;

function diasDesde(dataIso: string, hoje: string): number {
  return Math.round(
    (new Date(`${hoje}T00:00:00`).getTime() - new Date(`${dataIso}T00:00:00`).getTime()) /
      (24 * 60 * 60 * 1000),
  );
}

function devePedirLembrete(routine: Routine, hoje: string): boolean {
  if (routine.archived) return false;
  if (routine.nextDueDate > hoje) return false;
  if (!routine.reminderSentAt) return true;

  const ultimoAviso = routine.reminderSentAt.slice(0, 10);
  return diasDesde(ultimoAviso, hoje) >= REINSISTIR_APOS_DIAS;
}

/** Procura rotinas vencidas e dispara o push, insistindo a cada alguns dias se ignorado. */
export async function dispatchDueRoutineReminders(now: Date = new Date()): Promise<{ sent: number }> {
  const store = getStore();
  const rotinas = await store.listRoutines();
  const hoje = todayKey(now);

  let sent = 0;

  for (const routine of rotinas) {
    if (!devePedirLembrete(routine, hoje)) continue;

    const area = ROUTINE_AREAS[routine.area] ?? ROUTINE_AREAS.outro;
    const atraso = diasDesde(routine.nextDueDate, hoje);
    const corpo =
      atraso <= 0
        ? "É hoje o dia de novo."
        : atraso === 1
          ? "Venceu ontem — bora colocar em dia."
          : `Venceu há ${atraso} dias — bora colocar em dia.`;

    await store.patchRoutine(routine.id, { reminderSentAt: now.toISOString() });
    await sendPush([...PERSON_IDS], {
      title: `${area.emoji} ${routine.title}`,
      body: corpo,
      tag: `rotina-${routine.id}`,
      url: "/rotinas",
      kind: "lembrete",
    });
    sent += 1;
  }

  return { sent };
}
