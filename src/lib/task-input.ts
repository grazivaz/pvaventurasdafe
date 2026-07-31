import { isDayKey, isTimeString } from "./date";
import { isPersonId, type PersonId } from "./people";
import { REMINDER_OPTIONS, isCategoryId, type CategoryId, type RemindTarget, type Task } from "./types";

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

const TITULO_MAX = 120;
const NOTAS_MAX = 500;

const REMINDER_VALUES = REMINDER_OPTIONS.map((option) => option.value);

export type NewTaskInput = {
  title: string;
  notes: string;
  category: CategoryId;
  date: string;
  time: string | null;
  remindMinutes: number | null;
  remindTarget: RemindTarget;
  createdBy: PersonId;
};

function asRecord(body: unknown): Record<string, unknown> | null {
  return typeof body === "object" && body !== null ? (body as Record<string, unknown>) : null;
}

function parseTitle(value: unknown): ParseResult<string> {
  if (typeof value !== "string") return { ok: false, error: "Título inválido." };
  const title = value.trim();
  if (!title) return { ok: false, error: "Escreva o que precisa ser feito." };
  if (title.length > TITULO_MAX) return { ok: false, error: "Título muito longo." };
  return { ok: true, value: title };
}

function parseNotes(value: unknown): ParseResult<string> {
  if (value === undefined || value === null) return { ok: true, value: "" };
  if (typeof value !== "string") return { ok: false, error: "Observação inválida." };
  const notes = value.trim();
  if (notes.length > NOTAS_MAX) return { ok: false, error: "Observação muito longa." };
  return { ok: true, value: notes };
}

function parseTime(value: unknown): ParseResult<string | null> {
  if (value === undefined || value === null || value === "") return { ok: true, value: null };
  if (!isTimeString(value)) return { ok: false, error: "Horário inválido." };
  return { ok: true, value };
}

function parseRemindMinutes(value: unknown): ParseResult<number | null> {
  if (value === undefined) return { ok: true, value: 30 };
  if (value === null) return { ok: true, value: null };
  if (typeof value !== "number" || !REMINDER_VALUES.includes(value)) {
    return { ok: false, error: "Antecedência do lembrete inválida." };
  }
  return { ok: true, value };
}

function parseRemindTarget(value: unknown): ParseResult<RemindTarget> {
  if (value === undefined) return { ok: true, value: "todas" };
  if (value !== "todas" && value !== "somente-eu") {
    return { ok: false, error: "Destinatário do lembrete inválido." };
  }
  return { ok: true, value };
}

export function parseNewTask(body: unknown): ParseResult<NewTaskInput> {
  const data = asRecord(body);
  if (!data) return { ok: false, error: "Pedido inválido." };

  const title = parseTitle(data.title);
  if (!title.ok) return title;

  const notes = parseNotes(data.notes);
  if (!notes.ok) return notes;

  if (!isCategoryId(data.category)) return { ok: false, error: "Categoria inválida." };
  if (!isDayKey(data.date)) return { ok: false, error: "Data inválida." };
  if (!isPersonId(data.createdBy)) return { ok: false, error: "Escolha quem está anotando." };

  const time = parseTime(data.time);
  if (!time.ok) return time;

  const remindMinutes = parseRemindMinutes(data.remindMinutes);
  if (!remindMinutes.ok) return remindMinutes;

  const remindTarget = parseRemindTarget(data.remindTarget);
  if (!remindTarget.ok) return remindTarget;

  return {
    ok: true,
    value: {
      title: title.value,
      notes: notes.value,
      category: data.category,
      date: data.date,
      time: time.value,
      remindMinutes: remindMinutes.value,
      remindTarget: remindTarget.value,
      createdBy: data.createdBy,
    },
  };
}

/**
 * Campos que mudam o instante do lembrete. Quando algum deles muda, o
 * lembrete volta a ficar pendente mesmo que já tivesse sido enviado.
 */
const CAMPOS_DE_HORARIO = ["date", "time", "remindMinutes"] as const;

export function parseTaskPatch(body: unknown): ParseResult<Partial<Task>> {
  const data = asRecord(body);
  if (!data) return { ok: false, error: "Pedido inválido." };

  const patch: Partial<Task> = {};

  if ("title" in data) {
    const title = parseTitle(data.title);
    if (!title.ok) return title;
    patch.title = title.value;
  }

  if ("notes" in data) {
    const notes = parseNotes(data.notes);
    if (!notes.ok) return notes;
    patch.notes = notes.value;
  }

  if ("category" in data) {
    if (!isCategoryId(data.category)) return { ok: false, error: "Categoria inválida." };
    patch.category = data.category;
  }

  if ("date" in data) {
    if (!isDayKey(data.date)) return { ok: false, error: "Data inválida." };
    patch.date = data.date;
  }

  if ("time" in data) {
    const time = parseTime(data.time);
    if (!time.ok) return time;
    patch.time = time.value;
  }

  if ("remindMinutes" in data) {
    const remindMinutes = parseRemindMinutes(data.remindMinutes);
    if (!remindMinutes.ok) return remindMinutes;
    patch.remindMinutes = remindMinutes.value;
  }

  if ("remindTarget" in data) {
    const remindTarget = parseRemindTarget(data.remindTarget);
    if (!remindTarget.ok) return remindTarget;
    patch.remindTarget = remindTarget.value;
  }

  if ("done" in data) {
    if (typeof data.done !== "boolean") return { ok: false, error: "Estado inválido." };
    if (!isPersonId(data.by)) return { ok: false, error: "Escolha quem está marcando." };
    patch.done = data.done;
    patch.doneAt = data.done ? new Date().toISOString() : null;
    patch.doneBy = data.done ? data.by : null;
  }

  if (Object.keys(patch).length === 0) return { ok: false, error: "Nada para alterar." };

  if (CAMPOS_DE_HORARIO.some((campo) => campo in patch)) {
    patch.reminderSentAt = null;
  }

  patch.updatedAt = new Date().toISOString();
  return { ok: true, value: patch };
}
