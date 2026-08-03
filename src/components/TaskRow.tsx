"use client";

import { useState } from "react";

import { BellIcon, CheckIcon, PencilIcon, TrashIcon } from "@/components/icons";
import { taskInstant } from "@/lib/date";
import { getPerson, personStyle } from "@/lib/people";
import { CATEGORIES, REMINDER_OPTIONS, type Task } from "@/lib/types";

type Props = {
  task: Task;
  /** Relógio vindo de cima, para o "atrasada" não depender de render impuro. */
  now: number;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function rotuloLembrete(minutos: number | null): string | null {
  if (minutos === null) return null;
  return REMINDER_OPTIONS.find((opcao) => opcao.value === minutos)?.label ?? null;
}

export default function TaskRow({ task, now, onToggle, onEdit, onDelete }: Props) {
  const [confirmando, setConfirmando] = useState(false);

  const autora = getPerson(task.createdBy);
  const categoria = CATEGORIES[task.category] ?? CATEGORIES.outro;
  const lembrete = rotuloLembrete(task.remindMinutes);
  const atrasada = !task.done && taskInstant(task).getTime() < now;
  // O lembrete já saiu e ninguém marcou como feita ainda — pulsa até alguém agir.
  const pendenteAposAviso = !task.done && task.reminderSentAt !== null;

  return (
    <li
      className={`person-theme relative overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)] ${
        pendenteAposAviso ? "animate-pulse-alert" : ""
      }`}
      style={personStyle(task.createdBy)}
    >
      <span
        aria-hidden
        className="absolute inset-y-3 left-0 w-1 rounded-r-full"
        style={{ background: "var(--person)" }}
      />

      <div className="flex items-start gap-3 py-3 pl-4 pr-3">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={task.done}
          aria-label={task.done ? "Marcar como não feita" : "Marcar como feita"}
          className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition"
          style={{
            borderColor: task.done ? "var(--person)" : "var(--person-line)",
            background: task.done ? "var(--person)" : "transparent",
            color: "#fff",
          }}
        >
          {task.done ? <CheckIcon className="size-3.5" /> : null}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={
              task.done
                ? "text-[0.975rem] leading-snug text-muted line-through"
                : "text-[0.975rem] font-medium leading-snug text-ink"
            }
          >
            {task.title}
          </p>

          {task.notes ? (
            <p className="mt-1 text-sm leading-snug text-muted">{task.notes}</p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span
              className="rounded-full px-2 py-0.5 font-semibold"
              style={{ background: "var(--person-tint)", color: "var(--person-text)" }}
            >
              {task.time ?? "dia todo"}
            </span>

            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-ink-soft">
              {categoria.emoji} {categoria.label}
            </span>

            {lembrete ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-muted">
                <BellIcon className="size-3" />
                {lembrete}
                {task.remindTarget === "somente-eu" ? " · só p/ quem anotou" : null}
              </span>
            ) : null}

            {atrasada ? (
              <span className="rounded-full bg-danger/12 px-2 py-0.5 font-semibold text-danger">
                atrasada
              </span>
            ) : null}

            <span className="ml-auto flex items-center gap-1 text-muted">
              <span
                aria-hidden
                className="size-1.5 rounded-full"
                style={{ background: "var(--person)" }}
              />
              {autora.name}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Editar ${task.title}`}
            className="flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-muted hover:text-ink"
          >
            <PencilIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            aria-label={`Excluir ${task.title}`}
            className="flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-muted hover:text-danger"
          >
            <TrashIcon className="size-4" />
          </button>
        </div>
      </div>

      {confirmando ? (
        <div className="animate-fade-in flex items-center justify-between gap-3 border-t border-line bg-surface-muted px-4 py-2.5">
          <span className="text-sm text-ink-soft">Excluir esta tarefa?</span>
          <span className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="rounded-full px-3 py-1 text-sm font-medium text-muted"
            >
              Não
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-full bg-danger px-3 py-1 text-sm font-semibold text-white"
            >
              Excluir
            </button>
          </span>
        </div>
      ) : null}
    </li>
  );
}
