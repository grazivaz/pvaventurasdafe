"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import RoutineCard from "@/components/RoutineCard";
import RoutineSheet from "@/components/RoutineSheet";
import Toasts, { type Toast } from "@/components/Toasts";
import { PlusIcon, RepeatIcon } from "@/components/icons";
import { usePerson } from "@/hooks/useClientState";
import { useRoutines } from "@/hooks/useRoutines";
import { todayKey } from "@/lib/date";
import type { PersonId } from "@/lib/people";
import type { Routine } from "@/lib/routines/types";

export default function RoutinesScreen() {
  const router = useRouter();
  const { person, hidratado } = usePerson();

  useEffect(() => {
    if (hidratado && !person) router.replace("/");
  }, [hidratado, person, router]);

  if (!person) {
    return <main className="min-h-svh" aria-busy="true" />;
  }

  return <Rotinas person={person} />;
}

function Rotinas({ person }: { person: PersonId }) {
  const { routines, status, addRoutine, editRoutine, completeRoutine, removeRoutine } = useRoutines();
  const [sheet, setSheet] = useState<{ routine: Routine | null } | null>(null);
  const [concluindo, setConcluindo] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const avisar = useCallback((text: string) => {
    const toast: Toast = { id: Date.now() + Math.random(), text };
    setToasts((atuais) => [...atuais.slice(-2), toast]);
    setTimeout(() => setToasts((atuais) => atuais.filter((item) => item.id !== toast.id)), 5000);
  }, []);

  async function concluir(routine: Routine) {
    setConcluindo(routine.id);
    try {
      await completeRoutine(routine.id, person);
      avisar(`"${routine.title}" marcada como feita hoje.`);
    } catch (error) {
      avisar(error instanceof Error ? error.message : "Não consegui marcar. Tente de novo.");
    } finally {
      setConcluindo(null);
    }
  }

  async function excluir(routine: Routine) {
    await removeRoutine(routine.id);
    avisar("Rotina excluída.");
  }

  const hoje = todayKey();
  const atrasadas = routines.filter((routine) => routine.nextDueDate < hoje);
  const emDia = routines.filter((routine) => routine.nextDueDate >= hoje);

  return (
    <>
      <main className="mx-auto w-full max-w-2xl px-4 pb-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom)+6rem)]">
        <header className="pt-[max(1.25rem,env(safe-area-inset-top))]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Casa · Cachorros · José · Casal
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Rotinas</h1>
          <p className="mt-2 text-sm text-ink-soft">
            {status === "carregando"
              ? "Carregando…"
              : status === "erro"
                ? "Sem conexão com o servidor. Vou tentar de novo em instantes."
                : routines.length === 0
                  ? "Nenhuma rotina ainda — crie a primeira."
                  : atrasadas.length > 0
                    ? `${atrasadas.length} ${atrasadas.length === 1 ? "rotina atrasada" : "rotinas atrasadas"}.`
                    : "Tudo em dia por enquanto. 🌿"}
          </p>
        </header>

        {routines.length === 0 && status === "pronto" ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong px-6 py-10 text-center">
            <RepeatIcon className="size-8 text-muted" />
            <p className="text-sm text-ink-soft">
              Rotinas são coisas que se repetem sozinhas: banho dos cachorros, fralda do José,
              troca de filtro. Marque uma vez como feita e o app já avisa a próxima.
            </p>
          </div>
        ) : null}

        {atrasadas.length > 0 ? (
          <section className="mt-5">
            <h2 className="mb-2 px-1 text-sm font-semibold text-danger">Atrasadas</h2>
            <ul className="flex flex-col gap-2">
              {atrasadas.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  completando={concluindo === routine.id}
                  onComplete={() => void concluir(routine)}
                  onEdit={() => setSheet({ routine })}
                  onDelete={() => void excluir(routine)}
                />
              ))}
            </ul>
          </section>
        ) : null}

        {emDia.length > 0 ? (
          <section className="mt-5">
            {atrasadas.length > 0 ? (
              <h2 className="mb-2 px-1 text-sm font-semibold text-ink-soft">Em dia</h2>
            ) : null}
            <ul className="flex flex-col gap-2">
              {emDia.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  completando={concluindo === routine.id}
                  onComplete={() => void concluir(routine)}
                  onEdit={() => setSheet({ routine })}
                  onDelete={() => void excluir(routine)}
                />
              ))}
            </ul>
          </section>
        ) : null}
      </main>

      <button
        type="button"
        onClick={() => setSheet({ routine: null })}
        className="fixed bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom)+0.75rem)] right-5 z-40 flex items-center gap-2 rounded-full bg-brand py-4 pl-5 pr-6 font-semibold text-white shadow-[var(--shadow-float)] transition active:scale-95"
      >
        <PlusIcon className="size-5" />
        Nova rotina
      </button>

      <Toasts
        toasts={toasts}
        onDismiss={(id) => setToasts((atuais) => atuais.filter((item) => item.id !== id))}
      />

      {sheet ? (
        <RoutineSheet
          person={person}
          routine={sheet.routine}
          onClose={() => setSheet(null)}
          onCreate={async (input) => {
            await addRoutine(input);
            avisar("Rotina criada.");
          }}
          onUpdate={editRoutine}
        />
      ) : null}
    </>
  );
}
