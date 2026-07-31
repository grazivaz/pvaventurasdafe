import type { Pool } from "pg";

import type { PushSubscriptionRecord, Task } from "../types";
import type { AgendaStore, VapidKeys } from "./types";

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS agenda_tasks (
    id text PRIMARY KEY,
    data jsonb NOT NULL
  );
  CREATE TABLE IF NOT EXISTS agenda_subscriptions (
    endpoint text PRIMARY KEY,
    data jsonb NOT NULL
  );
  CREATE TABLE IF NOT EXISTS agenda_settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL
  );
`;

/**
 * Adaptador para hospedagens sem disco persistente (Vercel e similares).
 * Guarda cada registro como JSONB, então o formato acompanha o tipo `Task`
 * sem precisar de migração a cada campo novo.
 */
export class PostgresStore implements AgendaStore {
  private pool: Pool | null = null;
  private ready: Promise<Pool> | null = null;

  constructor(private readonly connectionString: string) {}

  private connect(): Promise<Pool> {
    if (!this.ready) {
      this.ready = (async () => {
        const { Pool: PgPool } = await import("pg");
        const needsSsl = /sslmode=(require|verify-ca|verify-full)/.test(this.connectionString);
        const pool = new PgPool({
          connectionString: this.connectionString,
          ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
          max: 4,
        });
        await pool.query(SCHEMA);
        this.pool = pool;
        return pool;
      })().catch((error) => {
        // Permite nova tentativa no próximo pedido em vez de travar para sempre.
        this.ready = null;
        throw error;
      });
    }
    return this.ready;
  }

  private async query<T>(text: string, values: unknown[] = []): Promise<T[]> {
    const pool = this.pool ?? (await this.connect());
    const result = await pool.query(text, values);
    return result.rows as T[];
  }

  async listTasks(): Promise<Task[]> {
    const rows = await this.query<{ data: Task }>("SELECT data FROM agenda_tasks");
    return rows.map((row) => row.data);
  }

  async getTask(id: string): Promise<Task | null> {
    const rows = await this.query<{ data: Task }>(
      "SELECT data FROM agenda_tasks WHERE id = $1",
      [id],
    );
    return rows[0]?.data ?? null;
  }

  async insertTask(task: Task): Promise<Task> {
    await this.query("INSERT INTO agenda_tasks (id, data) VALUES ($1, $2)", [
      task.id,
      JSON.stringify(task),
    ]);
    return task;
  }

  async patchTask(id: string, patch: Partial<Task>): Promise<Task | null> {
    const rows = await this.query<{ data: Task }>(
      "UPDATE agenda_tasks SET data = data || $2::jsonb WHERE id = $1 RETURNING data",
      [id, JSON.stringify(patch)],
    );
    return rows[0]?.data ?? null;
  }

  async removeTask(id: string): Promise<boolean> {
    const rows = await this.query("DELETE FROM agenda_tasks WHERE id = $1 RETURNING id", [id]);
    return rows.length > 0;
  }

  async listSubscriptions(): Promise<PushSubscriptionRecord[]> {
    const rows = await this.query<{ data: PushSubscriptionRecord }>(
      "SELECT data FROM agenda_subscriptions",
    );
    return rows.map((row) => row.data);
  }

  async putSubscription(record: PushSubscriptionRecord): Promise<void> {
    await this.query(
      `INSERT INTO agenda_subscriptions (endpoint, data) VALUES ($1, $2)
       ON CONFLICT (endpoint) DO UPDATE SET data = EXCLUDED.data`,
      [record.endpoint, JSON.stringify(record)],
    );
  }

  async removeSubscription(endpoint: string): Promise<void> {
    await this.query("DELETE FROM agenda_subscriptions WHERE endpoint = $1", [endpoint]);
  }

  async getVapidKeys(): Promise<VapidKeys | null> {
    const rows = await this.query<{ value: VapidKeys }>(
      "SELECT value FROM agenda_settings WHERE key = 'vapid'",
    );
    return rows[0]?.value ?? null;
  }

  async setVapidKeys(keys: VapidKeys): Promise<void> {
    await this.query(
      `INSERT INTO agenda_settings (key, value) VALUES ('vapid', $1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [JSON.stringify(keys)],
    );
  }
}
