"use client";

import { useCallback, useEffect, useState } from "react";

import type { PersonId } from "@/lib/people";

export type PushStatus =
  /** Ainda conferindo o estado no navegador. */
  | "verificando"
  /** Navegador sem suporte (ou iPhone fora da tela de início). */
  | "indisponivel"
  /** A pessoa bloqueou as notificações nas configurações do navegador. */
  | "bloqueado"
  /** Suportado, mas ainda não ativado neste aparelho. */
  | "desativado"
  | "ativo";

/** A chave VAPID chega em base64url e o navegador precisa dela em bytes. */
function base64ParaBytes(base64: string): ArrayBuffer {
  const preenchimento = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalizado = (base64 + preenchimento).replace(/-/g, "+").replace(/_/g, "/");
  const bruto = window.atob(normalizado);
  const buffer = new ArrayBuffer(bruto.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bruto.length; i += 1) bytes[i] = bruto.charCodeAt(i);
  return buffer;
}

function suportado(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

async function registrarNoServidor(subscription: PushSubscription, person: PersonId) {
  const dados = subscription.toJSON() as { endpoint?: string; keys?: Record<string, string> };
  await fetch("/api/notificacoes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: { endpoint: dados.endpoint, keys: dados.keys }, person }),
  });
}

/** Cuida da inscrição de push deste aparelho para a pessoa que está usando o app. */
export function usePush(person: PersonId) {
  const [status, setStatus] = useState<PushStatus>("verificando");
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    (async () => {
      if (!suportado()) {
        if (!cancelado) setStatus("indisponivel");
        return;
      }

      try {
        const registro = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        const inscricao = await registro.pushManager.getSubscription();
        if (cancelado) return;

        if (inscricao) {
          // Reconfirma no servidor — a pessoa pode ter trocado de perfil.
          void registrarNoServidor(inscricao, person);
          setStatus("ativo");
        } else if (Notification.permission === "denied") {
          setStatus("bloqueado");
        } else {
          setStatus("desativado");
        }
      } catch {
        if (!cancelado) setStatus("indisponivel");
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [person]);

  const ativar = useCallback(async () => {
    setOcupado(true);
    setErro(null);
    try {
      const permissao = await Notification.requestPermission();
      if (permissao !== "granted") {
        setStatus(permissao === "denied" ? "bloqueado" : "desativado");
        return;
      }

      const resposta = await fetch("/api/notificacoes", { cache: "no-store" });
      if (!resposta.ok) throw new Error("Servidor sem notificações configuradas.");
      const { publicKey } = (await resposta.json()) as { publicKey: string };

      const registro = await navigator.serviceWorker.ready;
      const inscricao = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ParaBytes(publicKey),
      });

      await registrarNoServidor(inscricao, person);
      setStatus("ativo");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não consegui ativar os alertas.");
    } finally {
      setOcupado(false);
    }
  }, [person]);

  const desativar = useCallback(async () => {
    setOcupado(true);
    try {
      const registro = await navigator.serviceWorker.ready;
      const inscricao = await registro.pushManager.getSubscription();
      if (inscricao) {
        await fetch("/api/notificacoes", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: inscricao.endpoint }),
        });
        await inscricao.unsubscribe();
      }
      setStatus("desativado");
    } finally {
      setOcupado(false);
    }
  }, []);

  const testar = useCallback(async () => {
    setOcupado(true);
    setErro(null);
    try {
      const resposta = await fetch("/api/notificacoes/teste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ person }),
      });
      const dados = (await resposta.json()) as { delivered?: number };
      if (!resposta.ok || !dados.delivered) {
        setErro("Nenhum aparelho recebeu. Ative os alertas e tente de novo.");
      }
    } catch {
      setErro("Não consegui enviar o teste.");
    } finally {
      setOcupado(false);
    }
  }, [person]);

  return { status, ocupado, erro, ativar, desativar, testar };
}
