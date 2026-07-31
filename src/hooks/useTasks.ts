"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { PersonId } from "@/lib/people";
import type { NewTaskInput } from "@/lib/task-input";
import type { Task } from "@/lib/types";

const POLL_MS = 10_000;

export type TasksStatus = "carregando" | "pronto" | "erro";

export type TasksApi = {
  tasks: Task[];
  status: TasksStatus;
  refresh: () => Promise<void>;
  addTask: (input: NewTaskInput) => Promise<Task>;
  editTask: (id: string, patch: Record<string, unknown>) => Promise<void>;
  toggleDone: (task: Task) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
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

/**
 * Mantém a lista sincronizada com o servidor: recarrega a cada 10s, ao voltar
 * para o app e depois de cada alteração. Avisa via `onRemoteAdd` quando a
 * outra pessoa anota algo novo.
 */
export function useTasks(person: PersonId, onRemoteAdd?: (tasks: Task[]) => void): TasksApi {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [status, setStatus] = useState<TasksStatus>("carregando");

  /** Última resposta serializada — evita re-render quando nada mudou. */
  const ultimaResposta = useRef("");
  /** `null` até a primeira carga, para não anunciar as tarefas que já existiam. */
  const conhecidas = useRef<Set<string> | null>(null);

  const aplicar = useCallback(
    (lista: Task[]) => {
      const serializada = JSON.stringify(lista);
      if (serializada === ultimaResposta.current) return;
      ultimaResposta.current = serializada;

      setTasks(lista);

      const anteriores = conhecidas.current;
      conhecidas.current = new Set(lista.map((task) => task.id));
      if (!anteriores) return;

      const novas = lista.filter((task) => !anteriores.has(task.id) && task.createdBy !== person);
      if (novas.length > 0) onRemoteAdd?.(novas);
    },
    [person, onRemoteAdd],
  );

  const refresh = useCallback(async () => {
    try {
      const dados = await pedir<{ tasks: Task[] }>("/api/tarefas");
      aplicar(dados.tasks);
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

  const addTask = useCallback(async (input: NewTaskInput) => {
    const { task } = await pedir<{ task: Task }>("/api/tarefas", {
      method: "POST",
      body: JSON.stringify(input),
    });
    // Sai da lista de "novas" para não disparar o aviso de tarefa de outra pessoa.
    conhecidas.current?.add(task.id);
    ultimaResposta.current = "";
    setTasks((atuais) => [...atuais, task]);
    return task;
  }, []);

  const editTask = useCallback(
    async (id: string, patch: Record<string, unknown>) => {
      const { task } = await pedir<{ task: Task }>(`/api/tarefas/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      ultimaResposta.current = "";
      setTasks((atuais) => atuais.map((item) => (item.id === id ? task : item)));
      void refresh();
    },
    [refresh],
  );

  const toggleDone = useCallback(
    async (task: Task) => {
      const proximo = !task.done;
      // Resposta imediata na tela; se falhar, o refresh corrige.
      ultimaResposta.current = "";
      setTasks((atuais) =>
        atuais.map((item) => (item.id === task.id ? { ...item, done: proximo } : item)),
      );
      try {
        await pedir(`/api/tarefas/${task.id}`, {
          method: "PATCH",
          body: JSON.stringify({ done: proximo, by: person }),
        });
      } finally {
        void refresh();
      }
    },
    [person, refresh],
  );

  const removeTask = useCallback(
    async (id: string) => {
      conhecidas.current?.delete(id);
      ultimaResposta.current = "";
      setTasks((atuais) => atuais.filter((item) => item.id !== id));
      try {
        await pedir(`/api/tarefas/${id}`, { method: "DELETE" });
      } finally {
        void refresh();
      }
    },
    [refresh],
  );

  return { tasks, status, refresh, addTask, editTask, toggleDone, removeTask };
}
