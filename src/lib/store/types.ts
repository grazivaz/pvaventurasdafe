import type { PushSubscriptionRecord, Task } from "../types";

export type VapidKeys = { publicKey: string; privateKey: string };

/**
 * Contrato de persistência da agenda. Há duas implementações:
 * arquivo JSON (padrão) e Postgres (quando `DATABASE_URL` está definida).
 */
export interface AgendaStore {
  listTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | null>;
  insertTask(task: Task): Promise<Task>;
  patchTask(id: string, patch: Partial<Task>): Promise<Task | null>;
  removeTask(id: string): Promise<boolean>;

  listSubscriptions(): Promise<PushSubscriptionRecord[]>;
  putSubscription(record: PushSubscriptionRecord): Promise<void>;
  removeSubscription(endpoint: string): Promise<void>;

  getVapidKeys(): Promise<VapidKeys | null>;
  setVapidKeys(keys: VapidKeys): Promise<void>;
}
