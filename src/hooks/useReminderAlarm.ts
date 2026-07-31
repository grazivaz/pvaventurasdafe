"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { loadAlerted, saveAlerted } from "@/lib/client-storage";
import { reminderInstant } from "@/lib/date";
import type { PersonId } from "@/lib/people";
import type { Task } from "@/lib/types";

const CHECAGEM_MS = 10_000;
/** Lembretes vencidos há mais tempo que isso não tocam mais o alarme. */
const JANELA_MS = 30 * 60 * 1000;

function meInteressa(task: Task, person: PersonId): boolean {
  if (task.done || task.remindMinutes === null) return false;
  return task.remindTarget === "todas" || task.createdBy === person;
}

/**
 * Alarme dentro do app: enquanto a agenda está aberta, avisa na tela (com
 * som) quando chega a hora de uma tarefa. As notificações do sistema ficam
 * por conta do push, então um lembrete nunca aparece duas vezes.
 */
export function useReminderAlarm(tasks: Task[], person: PersonId) {
  const [alarme, setAlarme] = useState<Task | null>(null);
  const jaAlertadas = useRef<Set<string> | null>(null);

  useEffect(() => {
    const verificar = () => {
      jaAlertadas.current ??= new Set(loadAlerted());
      const registro = jaAlertadas.current;

      const agora = Date.now();
      const vencida = tasks.find((task) => {
        if (registro.has(task.id) || !meInteressa(task, person)) return false;
        const disparo = reminderInstant(task)?.getTime();
        if (disparo === undefined) return false;
        return disparo <= agora && agora - disparo <= JANELA_MS;
      });

      if (!vencida) return;

      registro.add(vencida.id);
      saveAlerted([...registro]);
      setAlarme(vencida);
    };

    const timer = setInterval(verificar, CHECAGEM_MS);
    return () => clearInterval(timer);
  }, [tasks, person]);

  return { alarme, dispensar: useCallback(() => setAlarme(null), []) };
}
