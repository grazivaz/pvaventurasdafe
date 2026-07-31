"use client";

import { useEffect } from "react";

import { ClockIcon } from "@/components/icons";
import { describeWhen } from "@/lib/date";
import { getPerson, personStyle } from "@/lib/people";
import { playAlarm } from "@/lib/sound";
import { CATEGORIES, type Task } from "@/lib/types";

type Props = {
  task: Task;
  onDismiss: () => void;
  onDone: () => void;
};

/** O alarme que aparece por cima da agenda quando chega a hora de uma tarefa. */
export default function ReminderOverlay({ task, onDismiss, onDone }: Props) {
  useEffect(() => {
    playAlarm();
  }, [task.id]);

  const categoria = CATEGORIES[task.category] ?? CATEGORIES.outro;
  const autora = getPerson(task.createdBy);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-5">
      <div className="animate-fade-in absolute inset-0 bg-black/55 backdrop-blur-sm" />

      <div
        role="alertdialog"
        aria-labelledby="alarme-titulo"
        style={personStyle(task.createdBy)}
        className="person-theme animate-rise relative w-full max-w-sm overflow-hidden rounded-[1.75rem] border border-line bg-surface p-6 text-center shadow-[var(--shadow-float)]"
      >
        <span
          className="mx-auto flex size-16 items-center justify-center rounded-full text-3xl"
          style={{ background: "var(--person-tint-strong)" }}
        >
          {categoria.emoji}
        </span>

        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Hora da tarefa
        </p>
        <h2 id="alarme-titulo" className="mt-1 font-display text-2xl font-semibold text-ink">
          {task.title}
        </h2>

        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-soft">
          <ClockIcon className="size-4" />
          {describeWhen(task)} · anotado por {autora.name}
        </p>

        {task.notes ? <p className="mt-3 text-sm text-muted">{task.notes}</p> : null}

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onDone}
            className="rounded-2xl py-3 font-semibold text-white transition active:scale-[0.99]"
            style={{ background: "var(--person)" }}
          >
            Já fiz
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-2xl border border-line py-3 font-medium text-ink-soft transition active:scale-[0.99]"
          >
            Ok, entendi
          </button>
        </div>
      </div>
    </div>
  );
}
