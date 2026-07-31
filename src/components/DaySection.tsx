"use client";

import TaskRow from "@/components/TaskRow";
import { PlusIcon } from "@/components/icons";
import { WEEKDAY_LONG, formatDayNumber, weekdayIndex, type DayKey } from "@/lib/date";
import type { Task } from "@/lib/types";

type Props = {
  day: DayKey;
  tasks: Task[];
  now: number;
  isToday: boolean;
  isPast: boolean;
  onAdd: (day: DayKey) => void;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

export default function DaySection({
  day,
  tasks,
  now,
  isToday,
  isPast,
  onAdd,
  onToggle,
  onEdit,
  onDelete,
}: Props) {
  const feitas = tasks.filter((task) => task.done).length;

  return (
    <section id={`dia-${day}`} className="scroll-mt-44">
      <div className="mb-2 flex items-baseline gap-2 px-1">
        <h2
          className={`font-display text-lg font-semibold first-letter:uppercase ${
            isPast && !isToday ? "text-muted" : "text-ink"
          }`}
        >
          {WEEKDAY_LONG[weekdayIndex(day)]}
        </h2>
        <span className="text-sm text-muted">dia {formatDayNumber(day)}</span>

        {isToday ? (
          <span className="rounded-full bg-brand px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-white">
            hoje
          </span>
        ) : null}

        {tasks.length > 0 ? (
          <span className="ml-auto text-xs font-medium text-muted">
            {feitas}/{tasks.length} feitas
          </span>
        ) : null}
      </div>

      {tasks.length === 0 ? (
        <button
          type="button"
          onClick={() => onAdd(day)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong py-3.5 text-sm text-muted transition hover:border-brand hover:text-brand"
        >
          <PlusIcon className="size-4" />
          Nada marcado — adicionar
        </button>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              now={now}
              onToggle={() => onToggle(task)}
              onEdit={() => onEdit(task)}
              onDelete={() => onDelete(task)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
