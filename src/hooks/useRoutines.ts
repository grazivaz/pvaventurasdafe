"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { PersonId } from "@/lib/people";
import type { NewRoutineInput } from "@/lib/routines/input";
import type { Routine } from "@/lib/routines/types";

const POLL_MS = 15_000;

export type RoutinesStatus = "carregando" | "pronto" | "erro";

export type RoutinesApi = {
  routines: Routine[];
  status: RoutinesStatus;
  refresh: () => Promise<void>;
  addRoutine: (input: NewRoutineInput) => Promise<Routine>;
  editRoutine: (id: string, patch: Record<string, unknown>) => Promise<void>;
  completeRoutine: (id: string, by: PersonId) => Promise<void>;
  removeRoutine: (id: string) => Promise<void>;
};

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  const resposta = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  const dados: unknown = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error((dados as { error?: string }).error ?? "Não deu certo. Tente de novo.");
  }
  return dados as T;
}

/** Mantém as rotinas sincronizadas com o servidor, igual ao `useTasks` faz com as tarefas. */
export function useRoutines(): RoutinesApi {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [status, setStatus] = useState<RoutinesStatus>("carregando");
  const ultimaResposta = useRef("");

  const aplicar = useCallback((lista: Routine[]) => {
    const serializada = JSON.stringify(lista);
    if (serializada === ultimaResposta.current) return;
    ultimaResposta.current = serializada;
    setRoutines(lista);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const dados = await pedir<{ rotinas: Routine[] }>("/api/rotinas");
      aplicar(dados.rotinas);
      setStatus("pronto");
    } catch {
      setStatus((atual) => (atual === "carregando" ? "erro" : atual));
    }
  }, [aplicar]);

  useEffect(() => {
    void (async () => {
      await refresh();
    })();

    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, POLL_MS);

    const aoVoltar = () => {
      if (document.visibilityState === "visible") void refresh();
    };

    document.addEventListener("visibilitychange", aoVoltar);
    window.addEventListener("online", aoVoltar);
    window.addEventListener("focus", aoVoltar);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", aoVoltar);
      window.removeEventListener("online", aoVoltar);
      window.removeEventListener("focus", aoVoltar);
    };
  }, [refresh]);

  const addRoutine = useCallback(async (input: NewRoutineInput) => {
    const { routine } = await pedir<{ routine: Routine }>("/api/rotinas", {
      method: "POST",
      body: JSON.stringify(input),
    });
    ultimaResposta.current = "";
    setRoutines((atuais) => [...atuais, routine]);
    return routine;
  }, []);

  const editRoutine = useCallback(
    async (id: string, patch: Record<string, unknown>) => {
      const { routine } = await pedir<{ routine: Routine }>(`/api/rotinas/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      ultimaResposta.current = "";
      setRoutines((atuais) => atuais.map((item) => (item.id === id ? routine : item)));
      void refresh();
    },
    [refresh],
  );

  const completeRoutine = useCallback(
    async (id: string, by: PersonId) => {
      const { routine } = await pedir<{ routine: Routine }>(`/api/rotinas/${id}/concluir`, {
        method: "POST",
        body: JSON.stringify({ by }),
      });
      ultimaResposta.current = "";
      setRoutines((atuais) => atuais.map((item) => (item.id === id ? routine : item)));
      void refresh();
    },
    [refresh],
  );

  const removeRoutine = useCallback(
    async (id: string) => {
      ultimaResposta.current = "";
      setRoutines((atuais) => atuais.filter((item) => item.id !== id));
      try {
        await pedir(`/api/rotinas/${id}`, { method: "DELETE" });
      } finally {
        void refresh();
      }
    },
    [refresh],
  );

  return { routines, status, refresh, addRoutine, editRoutine, completeRoutine, removeRoutine };
}
