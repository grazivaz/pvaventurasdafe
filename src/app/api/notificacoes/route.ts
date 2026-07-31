import { isPersonId } from "@/lib/people";
import { getPushPublicKey } from "@/lib/push";
import { getStore } from "@/lib/store";

/** O navegador precisa da chave pública para criar a inscrição de push. */
export async function GET() {
  try {
    return Response.json({ publicKey: await getPushPublicKey() });
  } catch (error) {
    console.error("[agenda] não foi possível preparar as chaves de push", error);
    return Response.json({ error: "Notificações indisponíveis no servidor." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const data = body as { subscription?: unknown; person?: unknown };
  const subscription = data.subscription as
    | { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } }
    | undefined;

  if (
    !isPersonId(data.person) ||
    typeof subscription?.endpoint !== "string" ||
    typeof subscription.keys?.p256dh !== "string" ||
    typeof subscription.keys?.auth !== "string"
  ) {
    return Response.json({ error: "Inscrição inválida." }, { status: 400 });
  }

  await getStore().putSubscription({
    endpoint: subscription.endpoint,
    keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
    person: data.person,
    createdAt: new Date().toISOString(),
  });

  return Response.json({ ok: true }, { status: 201 });
}

export async function DELETE(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const endpoint = (body as { endpoint?: unknown }).endpoint;
  if (typeof endpoint !== "string") {
    return Response.json({ error: "Inscrição inválida." }, { status: 400 });
  }

  await getStore().removeSubscription(endpoint);
  return Response.json({ ok: true });
}
