import { isPersonId } from "@/lib/people";
import { sendPush } from "@/lib/push";

/** Usado pelo botão "testar alerta" para conferir se o celular recebe push. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const person = (body as { person?: unknown }).person;
  if (!isPersonId(person)) {
    return Response.json({ error: "Pessoa inválida." }, { status: 400 });
  }

  const delivered = await sendPush([person], {
    title: "🔔 Alerta de teste",
    body: "Deu certo! É assim que os lembretes vão chegar.",
    tag: "teste",
    url: "/agenda",
    kind: "lembrete",
  });

  return Response.json({ delivered });
}
