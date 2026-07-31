"use client";

import { useSyncExternalStore } from "react";

import { loadPerson, subscribePerson } from "@/lib/client-storage";
import type { PersonId } from "@/lib/people";

/**
 * Valores que só existem no navegador (localStorage, user agent, relógio).
 * `useSyncExternalStore` é o caminho recomendado para lê-los: o servidor
 * renderiza o estado neutro e o React reconcilia depois da hidratação, sem
 * aviso de conteúdo diferente.
 */

const semAssinatura = () => () => {};

/** `false` no servidor e durante a hidratação; `true` depois disso. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    semAssinatura,
    () => true,
    () => false,
  );
}

export function usePerson(): { person: PersonId | null; hidratado: boolean } {
  const person = useSyncExternalStore(subscribePerson, loadPerson, () => null);
  return { person, hidratado: useHydrated() };
}

const MINUTO = 60_000;

function assinarRelogio(callback: () => void): () => void {
  // Checa quatro vezes por minuto para a virada acontecer quase na hora.
  const timer = setInterval(callback, 15_000);
  return () => clearInterval(timer);
}

/** Horário atual arredondado para o minuto — estável o suficiente para render. */
export function useNow(): number {
  return useSyncExternalStore(
    assinarRelogio,
    () => Math.floor(Date.now() / MINUTO) * MINUTO,
    () => 0,
  );
}

export function useIsIphone(): boolean {
  return useSyncExternalStore(
    semAssinatura,
    () => /iPad|iPhone|iPod/.test(navigator.userAgent),
    () => false,
  );
}

function assinarModoApp(callback: () => void): () => void {
  const consulta = window.matchMedia("(display-mode: standalone)");
  consulta.addEventListener("change", callback);
  return () => consulta.removeEventListener("change", callback);
}

/** `true` quando o app foi aberto pelo ícone da tela de início. */
export function useIsStandalone(): boolean {
  return useSyncExternalStore(
    assinarModoApp,
    () => window.matchMedia("(display-mode: standalone)").matches,
    () => false,
  );
}
