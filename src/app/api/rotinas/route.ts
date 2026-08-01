import { randomUUID } from "node:crypto";

import { addDays, todayKey } from "@/lib/date";
import { parseNewRoutine } from "@/lib/routines/input";
import type { Routine } from "@/lib/routines/types";
import { getStore } from "@/lib/store";

function sortRoutines(rotinas: Routine[]): Routine[] {
  return rotinas
    .filter((routine) => !routine.archived)
    .sort((a, b) => (a.nextDueDate === b.nextDueDate ? 0 : a.nextDueDate < b.nextDueDate ? -1 : 1));
}

export async function GET() {
  const rotinas = await getStore().listRoutines();
  return Response.json({ rotinas: sortRoutines(rotinas) });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const parsed = parseNewRoutine(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  const now = new Date().toISOString();
  const routine: Routine = {
    id: randomUUID(),
    ...parsed.value,
    createdAt: now,
    updatedAt: now,
    lastDoneAt: null,
    lastDoneBy: null,
    nextDueDate: addDays(todayKey(), parsed.value.cycleDays),
    reminderSentAt: null,
    history: [],
    archived: false,
  };

  await getStore().insertRoutine(routine);
  return Response.json({ routine }, { status: 201 });
}
