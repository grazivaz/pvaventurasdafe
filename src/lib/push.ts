import "server-only";

import webpush from "web-push";

import type { PersonId } from "./people";
import { getStore, type VapidKeys } from "./store";

export type PushPayload = {
  title: string;
  body: string;
  /** Notificações com a mesma tag se substituem em vez de empilhar. */
  tag: string;
  url: string;
  /** `lembrete` faz o celular vibrar num padrão mais insistente. */
  kind: "lembrete" | "nova-tarefa";
};

let cachedKeys: VapidKeys | null = null;
let configuring: Promise<VapidKeys> | null = null;

/**
 * As chaves VAPID identificam este servidor para o serviço de push do
 * navegador. Se não vierem por variável de ambiente, geramos um par na
 * primeira execução e guardamos junto com os dados — assim o app funciona
 * sem nenhuma configuração manual.
 */
async function ensureVapidKeys(): Promise<VapidKeys> {
  if (cachedKeys) return cachedKeys;

  if (!configuring) {
    configuring = (async () => {
      const fromEnv = {
        publicKey: process.env.VAPID_PUBLIC_KEY?.trim() ?? "",
        privateKey: process.env.VAPID_PRIVATE_KEY?.trim() ?? "",
      };

      let keys: VapidKeys;
      if (fromEnv.publicKey && fromEnv.privateKey) {
        keys = fromEnv;
      } else {
        const store = getStore();
        keys = (await store.getVapidKeys()) ?? webpush.generateVAPIDKeys();
        await store.setVapidKeys(keys);
      }

      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT?.trim() || "mailto:agenda@localhost",
        keys.publicKey,
        keys.privateKey,
      );
      cachedKeys = keys;
      return keys;
    })().catch((error) => {
      configuring = null;
      throw error;
    });
  }

  return configuring;
}

export async function getPushPublicKey(): Promise<string> {
  return (await ensureVapidKeys()).publicKey;
}

/**
 * Envia a notificação para todos os aparelhos das pessoas indicadas.
 * Inscrições que o navegador já descartou (404/410) são removidas.
 */
export async function sendPush(targets: PersonId[], payload: PushPayload): Promise<number> {
  if (targets.length === 0) return 0;

  await ensureVapidKeys();
  const store = getStore();
  const subscriptions = (await store.listSubscriptions()).filter((sub) =>
    targets.includes(sub.person),
  );

  const body = JSON.stringify(payload);
  let delivered = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          body,
          { TTL: 60 * 60 },
        );
        delivered += 1;
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await store.removeSubscription(sub.endpoint);
        } else {
          console.error("[push] falha ao enviar", sub.endpoint, status ?? error);
        }
      }
    }),
  );

  return delivered;
}
