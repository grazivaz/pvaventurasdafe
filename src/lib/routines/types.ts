import type { PersonId } from "../people";

export const ROUTINE_AREA_IDS = ["cachorros", "jose", "casa", "casal", "outro"] as const;

export type RoutineAreaId = (typeof ROUTINE_AREA_IDS)[number];

export type RoutineArea = { id: RoutineAreaId; label: string; emoji: string };

export const ROUTINE_AREAS: Record<RoutineAreaId, RoutineArea> = {
  cachorros: { id: "cachorros", label: "Cachorros", emoji: "🐾" },
  jose: { id: "jose", label: "José", emoji: "👶" },
  casa: { id: "casa", label: "Casa", emoji: "🏠" },
  casal: { id: "casal", label: "Casal", emoji: "💜" },
  outro: { id: "outro", label: "Outro", emoji: "📌" },
};

export const ROUTINE_AREA_LIST: RoutineArea[] = ROUTINE_AREA_IDS.map((id) => ROUTINE_AREAS[id]);

export function isRoutineAreaId(value: unknown): value is RoutineAreaId {
  return typeof value === "string" && (ROUTINE_AREA_IDS as readonly string[]).includes(value);
}

/** Atalhos de ciclo mais comuns; o campo aceita qualquer número de dias. */
export const ROUTINE_CYCLE_PRESETS = [7, 14, 30, 60, 90] as const;

export type RoutineCompletion = {
  /** Data (YYYY-MM-DD) em que foi marcada como feita. */
  date: string;
  by: PersonId;
};

export type Routine = {
  id: string;
  title: string;
  area: RoutineAreaId;
  /** A cada quantos dias a rotina se repete. */
  cycleDays: number;
  createdBy: PersonId;
  createdAt: string;
  updatedAt: string;
  lastDoneAt: string | null;
  lastDoneBy: PersonId | null;
  /** Data (YYYY-MM-DD) em que a rotina vence de novo. */
  nextDueDate: string;
  /** Marcado pelo servidor quando o lembrete do ciclo atual já saiu. */
  reminderSentAt: string | null;
  /** Últimas vezes em que foi feita, mais recente primeiro. */
  history: RoutineCompletion[];
  /** Pausada: continua guardada, mas não gera lembrete nem aparece na lista ativa. */
  archived: boolean;
};

const HISTORY_LIMIT = 12;

export function pushHistory(history: RoutineCompletion[], entry: RoutineCompletion): RoutineCompletion[] {
  return [entry, ...history].slice(0, HISTORY_LIMIT);
}
