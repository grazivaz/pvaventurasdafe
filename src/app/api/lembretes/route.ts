import { dispatchDueReminders } from "@/lib/reminders";

/**
 * Dispara os lembretes vencidos. Em hospedagem com servidor sempre ligado o
 * agendador interno já faz isso sozinho; esta rota existe para quem usa
 * serverless e precisa de um cron externo chamando de minuto em minuto.
 * Defina `CRON_SECRET` para exigir `?token=` ou o cabeçalho `x-cron-secret`.
 */
async function run(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    const token =
      request.headers.get("x-cron-secret") ?? new URL(request.url).searchParams.get("token");
    if (token !== secret) {
      return Response.json({ error: "Não autorizado." }, { status: 401 });
    }
  }

  const result = await dispatchDueReminders();
  return Response.json(result);
}

export async function GET(request: Request) {
  return run(request);
}

export async function POST(request: Request) {
  return run(request);
}
