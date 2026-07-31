import "server-only";

import { FileStore } from "./file-store";
import { PostgresStore } from "./postgres-store";
import type { AgendaStore } from "./types";

export type { AgendaStore, VapidKeys } from "./types";

let instance: AgendaStore | null = null;

/**
 * Escolhe o adaptador uma única vez por processo: Postgres quando há
 * `DATABASE_URL`, senão um arquivo JSON em `AGENDA_DATA_DIR` (padrão `.data`).
 */
export function getStore(): AgendaStore {
  if (!instance) {
    const databaseUrl = process.env.DATABASE_URL?.trim();
    instance = databaseUrl
      ? new PostgresStore(databaseUrl)
      : new FileStore(process.env.AGENDA_DATA_DIR?.trim() || ".data");
  }
  return instance;
}

export function describeStore(): string {
  return process.env.DATABASE_URL?.trim() ? "postgres" : "arquivo";
}
