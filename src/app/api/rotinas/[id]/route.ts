import { parseRoutinePatch } from "@/lib/routines/input";
import { getStore } from "@/lib/store";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
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

  const parsed = parseRoutinePatch(body, atual.lastDoneAt);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  const routine = await store.patchRoutine(id, parsed.value);
  if (!routine) return Response.json({ error: "Rotina não encontrada." }, { status: 404 });

  return Response.json({ routine });
}

export async function DELETE(_request: Request, context: Context) {
  const { id } = await context.params;
  const removed = await getStore().removeRoutine(id);
  if (!removed) return Response.json({ error: "Rotina não encontrada." }, { status: 404 });
  return Response.json({ ok: true });
}
