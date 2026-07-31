import "server-only";

import { describeWhen, reminderInstant, todayKey } from "./date";
import { PERSON_IDS, getPerson, type PersonId } from "./people";
import { sendPush } from "./push";
import { getStore } from "./store";
import { CATEGORIES, type Task } from "./types";

/**
 * Lembretes atrasados mais do que isso não viram notificação — só são
 * marcados como enviados. Evita uma enxurrada de alertas antigos quando o
 * servidor fica um tempo fora do ar.
 */
const MAX_ATRASO_MS = 6 * 60 * 60 * 1000;

export function reminderTargets(task: Task): PersonId[] {
  return task.remindTarget === "somente-eu" ? [task.createdBy] : [...PERSON_IDS];
}

function isPending(task: Task): boolean {
  return !task.done && task.reminderSentAt === null && task.remindMinutes !== null;
}

/**
 * Procura lembretes vencidos e dispara o push. Chamada pelo agendador
 * interno a cada 30s e também pela rota `/api/lembretes` (para quem
 * hospeda em serverless e usa um cron externo).
 */
export async function dispatchDueReminders(now: Date = new Date()): Promise<{
  sent: number;
  skipped: number;
}> {
  const store = getStore();
  const tasks = await store.listTasks();
  const today = todayKey(now);

  let sent = 0;
  let skipped = 0;

  for (const task of tasks) {
    if (!isPending(task)) continue;

    const due = reminderInstant(task);
    if (!due || due.getTime() > now.getTime()) continue;

    const atraso = now.getTime() - due.getTime();
    // Marca antes de enviar: se o envio falhar, não repetimos o alerta em loop.
    await store.patchTask(task.id, { reminderSentAt: now.toISOString() });

    if (atraso > MAX_ATRASO_MS) {
      skipped += 1;
      continue;
    }

    const category = CATEGORIES[task.category] ?? CATEGORIES.outro;
    await sendPush(reminderTargets(task), {
      title: `${category.emoji} ${task.title}`,
      body: `${describeWhen(task, today)} · anotado por ${getPerson(task.createdBy).name}`,
      tag: `lembrete-${task.id}`,
      url: "/agenda",
      kind: "lembrete",
    });
    sent += 1;
  }

  return { sent, skipped };
}
