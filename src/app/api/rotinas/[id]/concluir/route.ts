import { addDays, todayKey } from "@/lib/date";
import { parseCompleteBy } from "@/lib/routines/input";
import { pushHistory } from "@/lib/routines/types";
import { getStore } from "@/lib/store";

type Context = { params: Promise<{ id: string }> };

/** Marca a rotina como feita hoje e já calcula sozinho a próxima vez. */
export async function POST(request: Request, context: Context) {
  const { id } = await context.params;
  const store = getStore();

  const atual = await store.getRoutine(id);
  if (!atual) return Response.json({ error: "Rotina não encontrada." }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const parsed = parseCompleteBy(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  const hoje = todayKey();
  const now = new Date().toISOString();

  const routine = await store.patchRoutine(id, {
    lastDoneAt: now,
    lastDoneBy: parsed.value,
    nextDueDate: addDays(hoje, atual.cycleDays),
    reminderSentAt: null,
    updatedAt: now,
    history: pushHistory(atual.history, { date: hoje, by: parsed.value }),
  });

  if (!routine) return Response.json({ error: "Rotina não encontrada." }, { status: 404 });
  return Response.json({ routine });
}
