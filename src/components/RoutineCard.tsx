"use client";

import { useState } from "react";

import { CheckIcon, PencilIcon, TrashIcon } from "@/components/icons";
import { daysBetween, todayKey } from "@/lib/date";
import { getPerson } from "@/lib/people";
import { ROUTINE_AREAS, type Routine } from "@/lib/routines/types";

type Props = {
  routine: Routine;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  completando: boolean;
};

function textoUltimaVez(routine: Routine, hoje: string): string {
  if (!routine.lastDoneAt) return "ainda não feita";
  const dataChave = routine.lastDoneAt.slice(0, 10);
  const dias = daysBetween(dataChave, hoje);
  if (dias <= 0) return "feita hoje";
  if (dias === 1) return "feita ontem";
  return `feita há ${dias} dias`;
}

function textoProximaVez(routine: Routine, hoje: string): { texto: string; atrasada: boolean } {
  const dias = daysBetween(hoje, routine.nextDueDate);
  if (dias > 1) return { texto: `próximo em ${dias} dias`, atrasada: false };
  if (dias === 1) return { texto: "próximo amanhã", atrasada: false };
  if (dias === 0) return { texto: "é hoje", atrasada: false };
  return { texto: `atrasada ${Math.abs(dias)} ${Math.abs(dias) === 1 ? "dia" : "dias"}`, atrasada: true };
}

export default function RoutineCard({ routine, onComplete, onEdit, onDelete, completando }: Props) {
  const [confirmando, setConfirmando] = useState(false);
  const hoje = todayKey();
  const area = ROUTINE_AREAS[routine.area] ?? ROUTINE_AREAS.outro;

  const base = routine.lastDoneAt ? routine.lastDoneAt.slice(0, 10) : routine.createdAt.slice(0, 10);
  const decorridos = Math.max(0, daysBetween(base, hoje));
  const proporcao = Math.min(1, decorridos / routine.cycleDays);
  const { texto: proximaVezTexto, atrasada } = textoProximaVez(routine, hoje);

  return (
    <li className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-3 p-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xl">
          {area.emoji}
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-medium leading-snug text-ink">{routine.title}</p>
          <p className="text-xs text-muted">
            {area.label} · a cada {routine.cycleDays} {routine.cycleDays === 1 ? "dia" : "dias"}
          </p>

          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.round(proporcao * 100)}%`,
                background: atrasada ? "var(--danger)" : "var(--brand)",
              }}
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span
              className={`rounded-full px-2 py-0.5 font-semibold ${
                atrasada ? "bg-danger/12 text-danger" : "bg-brand/10 text-brand"
              }`}
            >
              {proximaVezTexto}
            </span>
            <span className="text-muted">{textoUltimaVez(routine, hoje)}</span>
            {routine.lastDoneBy ? (
              <span className="text-muted">· {getPerson(routine.lastDoneBy).name}</span>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Editar ${routine.title}`}
            className="flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-muted hover:text-ink"
          >
            <PencilIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            aria-label={`Excluir ${routine.title}`}
            className="flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-muted hover:text-danger"
          >
            <TrashIcon className="size-4" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onComplete}
        disabled={completando}
        className="flex w-full items-center justify-center gap-2 border-t border-line py-3 text-sm font-semibold text-brand transition active:scale-[0.99] disabled:opacity-60"
      >
        <CheckIcon className="size-4" />
        {completando ? "Marcando…" : "Feito hoje"}
      </button>

      {confirmando ? (
        <div className="animate-fade-in flex items-center justify-between gap-3 border-t border-line bg-surface-muted px-4 py-2.5">
          <span className="text-sm text-ink-soft">Excluir esta rotina?</span>
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
