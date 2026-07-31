import { randomUUID } from "node:crypto";

import { describeWhen, todayKey } from "@/lib/date";
import { getPerson, otherPerson } from "@/lib/people";
import { sendPush } from "@/lib/push";
import { getStore } from "@/lib/store";
import { parseNewTask } from "@/lib/task-input";
import { CATEGORIES, type Task } from "@/lib/types";

function sortTasks(tasks: Task[]): Task[] {
  return tasks.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    // Tarefas de "dia todo" aparecem antes das que têm horário marcado.
    if (a.time === b.time) return a.createdAt < b.createdAt ? -1 : 1;
    if (a.time === null) return -1;
    if (b.time === null) return 1;
    return a.time < b.time ? -1 : 1;
  });
}

export async function GET() {
  const tasks = await getStore().listTasks();
  return Response.json({ tasks: sortTasks(tasks) });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const parsed = parseNewTask(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  const now = new Date().toISOString();
  const task: Task = {
    id: randomUUID(),
    ...parsed.value,
    createdAt: now,
    updatedAt: now,
    done: false,
    doneAt: null,
    doneBy: null,
    reminderSentAt: null,
  };

  await getStore().insertTask(task);

  // Avisa a outra pessoa na hora — mesmo com o app fechado.
  const autora = getPerson(task.createdBy);
  const category = CATEGORIES[task.category] ?? CATEGORIES.outro;
  void sendPush([otherPerson(task.createdBy).id], {
    title: `${autora.name} anotou uma tarefa`,
    body: `${category.emoji} ${task.title} · ${describeWhen(task, todayKey())}`,
    tag: `nova-${task.id}`,
    url: "/agenda",
    kind: "nova-tarefa",
  }).catch((error) => console.error("[agenda] push de nova tarefa falhou", error));

  return Response.json({ task }, { status: 201 });
}
