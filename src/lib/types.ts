import type { PersonId } from "./people";

export const CATEGORY_IDS = [
  "mercado",
  "saude",
  "farmacia",
  "casa",
  "contas",
  "pessoal",
  "outro",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export type Category = {
  id: CategoryId;
  label: string;
  emoji: string;
};

export const CATEGORIES: Record<CategoryId, Category> = {
  mercado: { id: "mercado", label: "Mercado", emoji: "🛒" },
  saude: { id: "saude", label: "Saúde", emoji: "🩺" },
  farmacia: { id: "farmacia", label: "Remédio", emoji: "💊" },
  casa: { id: "casa", label: "Casa", emoji: "🏠" },
  contas: { id: "contas", label: "Contas", emoji: "💳" },
  pessoal: { id: "pessoal", label: "Pessoal", emoji: "✨" },
  outro: { id: "outro", label: "Outro", emoji: "📌" },
};

export const CATEGORY_LIST: Category[] = CATEGORY_IDS.map((id) => CATEGORIES[id]);

export function isCategoryId(value: unknown): value is CategoryId {
  return typeof value === "string" && (CATEGORY_IDS as readonly string[]).includes(value);
}

/** Quem deve receber o lembrete de uma tarefa. */
export type RemindTarget = "todas" | "somente-eu";

export type Task = {
  id: string;
  title: string;
  notes: string;
  category: CategoryId;
  /** Data local no fuso do app, no formato `YYYY-MM-DD`. */
  date: string;
  /** Hora local `HH:mm`, ou `null` para "dia todo". */
  time: string | null;
  /** Minutos de antecedência do lembrete, ou `null` para não lembrar. */
  remindMinutes: number | null;
  remindTarget: RemindTarget;
  createdBy: PersonId;
  createdAt: string;
  updatedAt: string;
  done: boolean;
  doneAt: string | null;
  doneBy: PersonId | null;
  /** Marcado pelo servidor quando o push do lembrete já saiu. */
  reminderSentAt: string | null;
};

export type PushSubscriptionRecord = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  person: PersonId;
  createdAt: string;
};

export const REMINDER_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: "Sem lembrete" },
  { value: 0, label: "Na hora" },
  { value: 10, label: "10 min antes" },
  { value: 30, label: "30 min antes" },
  { value: 60, label: "1 hora antes" },
  { value: 180, label: "3 horas antes" },
  { value: 1440, label: "1 dia antes" },
];

/** Hora usada como âncora do lembrete quando a tarefa é "dia todo". */
export const ALL_DAY_ANCHOR = "08:00";
