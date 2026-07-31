"use client";

import { isPersonId, type PersonId } from "./people";

const PESSOA_KEY = "agenda:pessoa";
const ALERTADOS_KEY = "agenda:alertados";

const ouvintes = new Set<() => void>();

/** Avisa quem está lendo a pessoa escolhida (inclusive outra aba aberta). */
export function subscribePerson(callback: () => void): () => void {
  ouvintes.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    ouvintes.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function notificar(): void {
  for (const callback of [...ouvintes]) callback();
}

export function loadPerson(): PersonId | null {
  if (typeof window === "undefined") return null;
  const valor = window.localStorage.getItem(PESSOA_KEY);
  return isPersonId(valor) ? valor : null;
}

export function savePerson(person: PersonId): void {
  window.localStorage.setItem(PESSOA_KEY, person);
  notificar();
}

export function clearPerson(): void {
  window.localStorage.removeItem(PESSOA_KEY);
  notificar();
}

/** Ids de tarefas que já tocaram o alarme neste aparelho. */
export function loadAlerted(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const bruto: unknown = JSON.parse(window.localStorage.getItem(ALERTADOS_KEY) ?? "[]");
    return Array.isArray(bruto) ? bruto.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function saveAlerted(ids: string[]): void {
  // Mantém só os últimos para a lista não crescer para sempre.
  window.localStorage.setItem(ALERTADOS_KEY, JSON.stringify(ids.slice(-200)));
}
