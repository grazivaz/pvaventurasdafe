// localStorage pode falhar (aba anônima, cota cheia, Safari restrito):
// tudo aqui é "melhor esforço" e o app funciona sem ele.

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* sem espaço ou bloqueado — ignora */
  }
}

export function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignora */
  }
}

export type Settings = {
  sound: boolean;
  voice: boolean;
  fullscreen: boolean;
};

export const DEFAULT_SETTINGS: Settings = { sound: true, voice: true, fullscreen: true };
export const SETTINGS_KEY = "rabisquinhos:settings";
export const coloringKey = (id: string) => `rabisquinhos:colorir:${id}`;
export const PAD_KEY = "rabisquinhos:desenho";
