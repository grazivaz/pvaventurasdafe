"use client";

import { WEEKDAY_SHORT, formatDayNumber, weekDays, weekdayIndex, type DayKey } from "@/lib/date";
import type { Task } from "@/lib/types";

type Props = {
  weekStart: DayKey;
  today: DayKey;
  tasksByDay: Map<DayKey, Task[]>;
  onSelect: (day: DayKey) => void;
};

/** Régua com os sete dias da semana; toca em um dia e a lista rola até ele. */
export default function WeekStrip({ weekStart, today, tasksByDay, onSelect }: Props) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {weekDays(weekStart).map((day) => {
        const tarefas = tasksByDay.get(day) ?? [];
        const pendentes = tarefas.filter((task) => !task.done).length;
        const ehHoje = day === today;

        return (
          <button
            key={day}
            type="button"
            onClick={() => onSelect(day)}
            aria-label={`Ir para ${WEEKDAY_SHORT[weekdayIndex(day)]}, dia ${formatDayNumber(day)}`}
            className={`flex flex-col items-center gap-1 rounded-2xl py-2 transition ${
              ehHoje ? "bg-brand text-white shadow-[var(--shadow-card)]" : "text-ink-soft hover:bg-surface-muted"
            }`}
          >
            <span
              className={`text-[0.65rem] font-semibold uppercase tracking-wide ${
                ehHoje ? "text-white/80" : "text-muted"
              }`}
            >
              {WEEKDAY_SHORT[weekdayIndex(day)]}
            </span>
            <span className="font-display text-base font-semibold">{formatDayNumber(day)}</span>
            <span
              aria-hidden
              className={`size-1.5 rounded-full transition ${
                pendentes === 0
                  ? "bg-transparent"
                  : ehHoje
                    ? "bg-white"
                    : tarefas.length > 0
                      ? "bg-brand"
                      : "bg-transparent"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
