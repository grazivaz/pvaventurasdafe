import { ALL_DAY_ANCHOR, type Task } from "./types";

/**
 * Fuso do app. Tudo que o usuário digita ("dia 12 às 14:00") é interpretado
 * aqui, para que o servidor calcule os lembretes no mesmo horário que o
 * celular mostra, independente de onde ele esteja rodando.
 */
export const APP_TIMEZONE = process.env.NEXT_PUBLIC_APP_TIMEZONE || "America/Sao_Paulo";

/** Chave de dia no formato `YYYY-MM-DD`. */
export type DayKey = string;

const DAY_MS = 24 * 60 * 60 * 1000;

export const WEEKDAY_LONG = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

export const WEEKDAY_SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

const MONTH_LONG = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export function isDayKey(value: unknown): value is DayKey {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isTimeString(value: unknown): value is string {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

/** Representa a chave de dia como um instante UTC ao meio-dia (evita saltos de fuso). */
function keyToUtcNoon(key: DayKey): number {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d, 12);
}

function utcNoonToKey(ms: number): DayKey {
  const d = new Date(ms);
  return [
    String(d.getUTCFullYear()).padStart(4, "0"),
    String(d.getUTCMonth() + 1).padStart(2, "0"),
    String(d.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function addDays(key: DayKey, amount: number): DayKey {
  return utcNoonToKey(keyToUtcNoon(key) + amount * DAY_MS);
}

/** 0 = domingo … 6 = sábado */
export function weekdayIndex(key: DayKey): number {
  return new Date(keyToUtcNoon(key)).getUTCDay();
}

/** Diferença em dias inteiros entre duas chaves (b - a). */
export function daysBetween(a: DayKey, b: DayKey): number {
  return Math.round((keyToUtcNoon(b) - keyToUtcNoon(a)) / DAY_MS);
}

/** Domingo da semana da chave informada. A semana vai de domingo a sábado. */
export function startOfWeek(key: DayKey): DayKey {
  return addDays(key, -weekdayIndex(key));
}

export function weekDays(startKey: DayKey): DayKey[] {
  return Array.from({ length: 7 }, (_, i) => addDays(startKey, i));
}

/** Data de hoje no fuso do app. */
export function todayKey(now: Date = new Date()): DayKey {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return parts;
}

/** Hora atual `HH:mm` no fuso do app. */
export function nowTime(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: APP_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
}

function timeZoneOffsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");

  // `hour` volta como 24 na virada do dia em alguns runtimes.
  const hour = get("hour") % 24;
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), hour, get("minute"), get("second"));
  return asUtc - instant.getTime();
}

/** Converte data + hora locais (no fuso do app) para o instante absoluto. */
export function zonedToInstant(date: DayKey, time: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const naive = Date.UTC(y, m - 1, d, hh, mm);
  // Duas passadas resolvem corretamente as bordas de horário de verão.
  let ms = naive - timeZoneOffsetMs(new Date(naive), APP_TIMEZONE);
  ms = naive - timeZoneOffsetMs(new Date(ms), APP_TIMEZONE);
  return new Date(ms);
}

/** Instante em que a tarefa acontece (tarefas de dia todo usam 08:00). */
export function taskInstant(task: Pick<Task, "date" | "time">): Date {
  return zonedToInstant(task.date, task.time ?? ALL_DAY_ANCHOR);
}

/** Instante em que o lembrete da tarefa deve disparar, ou `null` se não há lembrete. */
export function reminderInstant(
  task: Pick<Task, "date" | "time" | "remindMinutes">,
): Date | null {
  if (task.remindMinutes === null || task.remindMinutes === undefined) return null;
  return new Date(taskInstant(task).getTime() - task.remindMinutes * 60_000);
}

export function formatDayLong(key: DayKey): string {
  const [, m, d] = key.split("-").map(Number);
  return `${WEEKDAY_LONG[weekdayIndex(key)]}, ${d} de ${MONTH_LONG[m - 1]}`;
}

export function formatDayNumber(key: DayKey): string {
  return String(Number(key.split("-")[2]));
}

export function formatMonthYear(key: DayKey): string {
  const [y, m] = key.split("-").map(Number);
  return `${MONTH_LONG[m - 1]} de ${y}`;
}

/** "3 a 9 de agosto" / "29 de junho a 5 de julho" */
export function formatWeekRange(startKey: DayKey): string {
  const endKey = addDays(startKey, 6);
  const [, startMonth, startDay] = startKey.split("-").map(Number);
  const [, endMonth, endDay] = endKey.split("-").map(Number);

  if (startMonth === endMonth) {
    return `${startDay} a ${endDay} de ${MONTH_LONG[startMonth - 1]}`;
  }
  return `${startDay} de ${MONTH_LONG[startMonth - 1]} a ${endDay} de ${MONTH_LONG[endMonth - 1]}`;
}

/** "hoje", "amanhã", "ontem" ou o nome do dia. */
export function relativeDayLabel(key: DayKey, today: DayKey = todayKey()): string {
  const diff = daysBetween(today, key);
  if (diff === 0) return "hoje";
  if (diff === 1) return "amanhã";
  if (diff === -1) return "ontem";
  return WEEKDAY_LONG[weekdayIndex(key)];
}

/** Texto curto do horário para as notificações: "hoje às 14:30", "sábado (dia todo)". */
export function describeWhen(task: Pick<Task, "date" | "time">, today: DayKey = todayKey()): string {
  const day = relativeDayLabel(task.date, today);
  return task.time ? `${day} às ${task.time}` : `${day} (dia todo)`;
}
