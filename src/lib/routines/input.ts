import { addDays, todayKey } from "../date";
import { isPersonId, type PersonId } from "../people";
import { isRoutineAreaId, type RoutineAreaId } from "./types";

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

const TITULO_MAX = 120;
const CICLO_MIN = 1;
const CICLO_MAX = 365;

export type NewRoutineInput = {
  title: string;
  area: RoutineAreaId;
  cycleDays: number;
  createdBy: PersonId;
};

function asRecord(body: unknown): Record<string, unknown> | null {
  return typeof body === "object" && body !== null ? (body as Record<string, unknown>) : null;
}

function parseTitle(value: unknown): ParseResult<string> {
  if (typeof value !== "string") return { ok: false, error: "Nome inválido." };
  const title = value.trim();
  if (!title) return { ok: false, error: "Dê um nome para a rotina." };
  if (title.length > TITULO_MAX) return { ok: false, error: "Nome muito longo." };
  return { ok: true, value: title };
}

function parseCycleDays(value: unknown): ParseResult<number> {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return { ok: false, error: "A repetição precisa ser em dias inteiros." };
  }
  if (value < CICLO_MIN || value > CICLO_MAX) {
    return { ok: false, error: `A repetição precisa ser entre ${CICLO_MIN} e ${CICLO_MAX} dias.` };
  }
  return { ok: true, value };
}

export function parseNewRoutine(body: unknown): ParseResult<NewRoutineInput> {
  const data = asRecord(body);
  if (!data) return { ok: false, error: "Pedido inválido." };

  const title = parseTitle(data.title);
  if (!title.ok) return title;

  if (!isRoutineAreaId(data.area)) return { ok: false, error: "Área inválida." };
  if (!isPersonId(data.createdBy)) return { ok: false, error: "Escolha quem está criando." };

  const cycleDays = parseCycleDays(data.cycleDays);
  if (!cycleDays.ok) return cycleDays;

  return {
    ok: true,
    value: { title: title.value, area: data.area, cycleDays: cycleDays.value, createdBy: data.createdBy },
  };
}

export type RoutinePatch = {
  title?: string;
  area?: RoutineAreaId;
  cycleDays?: number;
  archived?: boolean;
  updatedAt: string;
  /** Recalculado apenas quando o ciclo muda, a partir da última vez feita (ou de hoje). */
  nextDueDate?: string;
};

export function parseRoutinePatch(body: unknown, currentLastDone: string | null): ParseResult<RoutinePatch> {
  const data = asRecord(body);
  if (!data) return { ok: false, error: "Pedido inválido." };

  const patch: RoutinePatch = { updatedAt: new Date().toISOString() };

  if ("title" in data) {
    const title = parseTitle(data.title);
    if (!title.ok) return title;
    patch.title = title.value;
  }

  if ("area" in data) {
    if (!isRoutineAreaId(data.area)) return { ok: false, error: "Área inválida." };
    patch.area = data.area;
  }

  if ("cycleDays" in data) {
    const cycleDays = parseCycleDays(data.cycleDays);
    if (!cycleDays.ok) return cycleDays;
    patch.cycleDays = cycleDays.value;
    // Recalcula o vencimento a partir da base que já existia, com o novo ciclo.
    // `currentLastDone` chega como timestamp ISO completo; usamos só a data.
    const base = currentLastDone ? currentLastDone.slice(0, 10) : todayKey();
    patch.nextDueDate = addDays(base, cycleDays.value);
  }

  if ("archived" in data) {
    if (typeof data.archived !== "boolean") return { ok: false, error: "Valor inválido." };
    patch.archived = data.archived;
  }

  if (Object.keys(patch).length <= 1) return { ok: false, error: "Nada para alterar." };

  return { ok: true, value: patch };
}

export function parseCompleteBy(body: unknown): ParseResult<PersonId> {
  const data = asRecord(body);
  const by = data?.by;
  if (!isPersonId(by)) return { ok: false, error: "Escolha quem está marcando." };
  return { ok: true, value: by };
}
