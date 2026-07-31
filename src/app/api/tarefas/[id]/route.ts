import { getStore } from "@/lib/store";
import { parseTaskPatch } from "@/lib/task-input";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const parsed = parseTaskPatch(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  const task = await getStore().patchTask(id, parsed.value);
  if (!task) return Response.json({ error: "Tarefa não encontrada." }, { status: 404 });

  return Response.json({ task });
}

export async function DELETE(_request: Request, context: Context) {
  const { id } = await context.params;
  const removed = await getStore().removeTask(id);
  if (!removed) return Response.json({ error: "Tarefa não encontrada." }, { status: 404 });
  return Response.json({ ok: true });
}
