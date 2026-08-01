"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import AlertsCard from "@/components/AlertsCard";
import DaySection from "@/components/DaySection";
import ReminderOverlay from "@/components/ReminderOverlay";
import TaskSheet from "@/components/TaskSheet";
import Toasts, { type Toast } from "@/components/Toasts";
import WeekStrip from "@/components/WeekStrip";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "@/components/icons";
import { useNow, usePerson } from "@/hooks/useClientState";
import { useReminderAlarm } from "@/hooks/useReminderAlarm";
import { useTasks } from "@/hooks/useTasks";
import { clearPerson } from "@/lib/client-storage";
import {
  addDays,
  formatMonthYear,
  formatWeekRange,
  startOfWeek,
  todayKey,
  weekDays,
  type DayKey,
} from "@/lib/date";
import { getPerson, personStyle, type PersonId } from "@/lib/people";
import { playChime, unlockAudio } from "@/lib/sound";
import type { Task } from "@/lib/types";

export default function AgendaScreen() {
  const router = useRouter();
  const { person, hidratado } = usePerson();

  useEffect(() => {
    // Sem nome escolhido não dá para marcar de quem é a tarefa.
    if (hidratado && !person) router.replace("/");
  }, [hidratado, person, router]);

  if (!person) {
    return <main className="min-h-svh" aria-busy="true" />;
  }

  return <Agenda person={person} />;
}

type SheetState = { task: Task | null; day: DayKey } | null;

function Agenda({ person }: { person: PersonId }) {
  const router = useRouter();
  const eu = getPerson(person);

  /** Relógio que anda sozinho: a tela vira de dia (e de semana) sem recarregar. */
  const agora = useNow();
  const hoje = useMemo<DayKey>(() => todayKey(new Date(agora)), [agora]);
  /** 0 = semana atual, -1 = semana passada, 1 = próxima. */
  const [semanas, setSemanas] = useState(0);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const jaRolou = useRef(false);

  const avisar = useCallback((text: string, quem?: PersonId) => {
    const toast: Toast = { id: Date.now() + Math.random(), text, person: quem };
    setToasts((atuais) => [...atuais.slice(-2), toast]);
    setTimeout(() => setToasts((atuais) => atuais.filter((item) => item.id !== toast.id)), 6000);
  }, []);

  const aoReceberDeOutra = useCallback(
    (novas: Task[]) => {
      playChime();
      const primeira = novas[0];
      const autora = getPerson(primeira.createdBy);
      avisar(
        novas.length === 1
          ? `${autora.name} anotou: ${primeira.title}`
          : `${autora.name} anotou ${novas.length} tarefas novas`,
        primeira.createdBy,
      );
    },
    [avisar],
  );

  const { tasks, status, addTask, editTask, toggleDone, removeTask } = useTasks(
    person,
    aoReceberDeOutra,
  );
  const { alarme, dispensar } = useReminderAlarm(tasks, person);

  const inicioDaSemana = useMemo(
    () => addDays(startOfWeek(hoje), semanas * 7),
    [hoje, semanas],
  );
  const dias = useMemo(() => weekDays(inicioDaSemana), [inicioDaSemana]);

  const porDia = useMemo(() => {
    const mapa = new Map<DayKey, Task[]>();
    for (const task of tasks) {
      const lista = mapa.get(task.date);
      if (lista) lista.push(task);
      else mapa.set(task.date, [task]);
    }
    return mapa;
  }, [tasks]);

  const daSemana = useMemo(
    () => dias.flatMap((dia) => porDia.get(dia) ?? []),
    [dias, porDia],
  );
  const pendentes = daSemana.filter((task) => !task.done).length;
  const deHoje = (porDia.get(hoje) ?? []).filter((task) => !task.done).length;

  // Ao abrir, deixa o dia de hoje visível sem precisar rolar a tela.
  useEffect(() => {
    if (jaRolou.current || status !== "pronto" || semanas !== 0) return;
    jaRolou.current = true;
    const alvo = document.getElementById(`dia-${hoje}`);
    if (alvo) alvo.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [status, semanas, hoje]);

  function abrirNova(dia: DayKey) {
    unlockAudio();
    setSheet({ task: null, day: dia });
  }

  function trocarPessoa() {
    clearPerson();
    router.push("/");
  }

  async function excluir(task: Task) {
    await removeTask(task.id);
    avisar("Tarefa excluída.");
  }

  const diaSugerido = semanas === 0 ? hoje : inicioDaSemana;

  return (
    <>
      <main className="mx-auto w-full max-w-2xl px-4 pb-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom)+6rem)]">
        <header className="flex items-center justify-between gap-3 pt-[max(1.25rem,env(safe-area-inset-top))]">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {formatMonthYear(inicioDaSemana)}
            </p>
            <h1 className="mt-1 truncate font-display text-2xl font-semibold text-ink">
              Oi, {eu.name}
            </h1>
          </div>

          <button
            type="button"
            onClick={trocarPessoa}
            aria-label="Trocar de pessoa"
            title="Trocar de pessoa"
            className="flex size-11 shrink-0 items-center justify-center rounded-full font-display text-lg font-semibold text-white shadow-[var(--shadow-card)] transition active:scale-95"
            style={{ backgroundImage: eu.gradient }}
          >
            {eu.initial}
          </button>
        </header>

        <p className="mt-2 text-sm text-ink-soft">
          {status === "carregando"
            ? "Carregando as tarefas…"
            : status === "erro"
              ? "Sem conexão com o servidor. Vou tentar de novo em instantes."
              : deHoje > 0
                ? `Você tem ${deHoje} ${deHoje === 1 ? "tarefa" : "tarefas"} para hoje.`
                : pendentes > 0
                  ? `Nada para hoje. ${pendentes} ${pendentes === 1 ? "tarefa" : "tarefas"} no resto da semana.`
                  : "Semana livre por enquanto. 🌿"}
        </p>

        <div className="mt-4">
          <AlertsCard person={person} />
        </div>

        <div className="sticky top-0 z-30 -mx-4 mt-4 border-b border-line bg-canvas/85 px-4 pb-3 pt-3 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSemanas((valor) => valor - 1)}
              aria-label="Semana anterior"
              className="flex size-9 items-center justify-center rounded-full border border-line bg-surface text-ink-soft transition active:scale-95"
            >
              <ChevronLeftIcon className="size-5" />
            </button>

            <div className="min-w-0 flex-1 text-center">
              <p className="truncate font-display text-base font-semibold text-ink">
                {formatWeekRange(inicioDaSemana)}
              </p>
              <p className="text-xs text-muted">
                {semanas === 0
                  ? "esta semana"
                  : semanas === 1
                    ? "próxima semana"
                    : semanas === -1
                      ? "semana passada"
                      : semanas > 0
                        ? `em ${semanas} semanas`
                        : `${Math.abs(semanas)} semanas atrás`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSemanas((valor) => valor + 1)}
              aria-label="Próxima semana"
              className="flex size-9 items-center justify-center rounded-full border border-line bg-surface text-ink-soft transition active:scale-95"
            >
              <ChevronRightIcon className="size-5" />
            </button>
          </div>

          <div className="mt-2">
            <WeekStrip
              weekStart={inicioDaSemana}
              today={hoje}
              tasksByDay={porDia}
              onSelect={(dia) =>
                document.getElementById(`dia-${dia}`)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
            />
          </div>

          {semanas !== 0 ? (
            <button
              type="button"
              onClick={() => setSemanas(0)}
              className="mx-auto mt-2 block rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white"
            >
              Voltar para esta semana
            </button>
          ) : null}
        </div>

        <div className="mt-5 flex flex-col gap-6">
          {dias.map((dia) => (
            <DaySection
              key={dia}
              day={dia}
              tasks={porDia.get(dia) ?? []}
              now={agora}
              isToday={dia === hoje}
              isPast={dia < hoje}
              onAdd={abrirNova}
              onToggle={(task) => void toggleDone(task)}
              onEdit={(task) => setSheet({ task, day: task.date })}
              onDelete={(task) => void excluir(task)}
            />
          ))}
        </div>
      </main>

      <button
        type="button"
        onClick={() => abrirNova(diaSugerido)}
        style={personStyle(person)}
        className="person-theme fixed bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom)+0.75rem)] right-5 z-40 flex items-center gap-2 rounded-full py-4 pl-5 pr-6 font-semibold text-white shadow-[var(--shadow-float)] transition active:scale-95"
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ backgroundImage: eu.gradient }}
        />
        <PlusIcon className="relative size-5" />
        <span className="relative">Nova tarefa</span>
      </button>

      <Toasts
        toasts={toasts}
        onDismiss={(id) => setToasts((atuais) => atuais.filter((item) => item.id !== id))}
      />

      {alarme ? (
        <ReminderOverlay
          task={alarme}
          onDismiss={dispensar}
          onDone={() => {
            void toggleDone(alarme);
            dispensar();
          }}
        />
      ) : null}

      {sheet ? (
        <TaskSheet
          person={person}
          defaultDay={sheet.day}
          task={sheet.task}
          onClose={() => setSheet(null)}
          onCreate={async (input) => {
            await addTask(input);
            avisar("Tarefa adicionada.", person);
          }}
          onUpdate={editTask}
        />
      ) : null}
    </>
  );
}
