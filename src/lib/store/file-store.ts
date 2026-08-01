import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Routine } from "../routines/types";
import type { PushSubscriptionRecord, Task } from "../types";
import type { AgendaStore, VapidKeys } from "./types";

type FileShape = {
  tasks: Task[];
  subscriptions: PushSubscriptionRecord[];
  vapid: VapidKeys | null;
  rotinas: Routine[];
};

const EMPTY: FileShape = { tasks: [], subscriptions: [], vapid: null, rotinas: [] };

/**
 * Guarda tudo num único JSON. Simples de operar e de fazer backup — basta
 * copiar o arquivo. Exige um disco que persista entre reinícios (qualquer
 * VPS, Railway, Fly.io, Render com disco). Em hospedagem serverless use o
 * adaptador Postgres.
 */
export class FileStore implements AgendaStore {
  private readonly file: string;
  /** Fila que serializa as escritas para dois pedidos não sobrescreverem um ao outro. */
  private queue: Promise<unknown> = Promise.resolve();

  constructor(dataDir: string) {
    this.file = path.join(dataDir, "agenda.json");
  }

  private async read(): Promise<FileShape> {
    try {
      const raw = await readFile(this.file, "utf8");
      const parsed = JSON.parse(raw) as Partial<FileShape>;
      return {
        tasks: parsed.tasks ?? [],
        subscriptions: parsed.subscriptions ?? [],
        vapid: parsed.vapid ?? null,
        rotinas: parsed.rotinas ?? [],
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return { ...EMPTY };
      throw error;
    }
  }

  private async write(data: FileShape): Promise<void> {
    await mkdir(path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
    await rename(tmp, this.file);
  }

  /** Lê, transforma e grava sem intercalar com outra transação. */
  private transact<T>(fn: (data: FileShape) => T | Promise<T>): Promise<T> {
    const run = this.queue.then(async () => {
      const data = await this.read();
      const result = await fn(data);
      await this.write(data);
      return result;
    });
    // A fila segue mesmo se esta transação falhar.
    this.queue = run.catch(() => undefined);
    return run;
  }

  async listTasks(): Promise<Task[]> {
    const data = await this.read();
    return data.tasks;
  }

  async getTask(id: string): Promise<Task | null> {
    const data = await this.read();
    return data.tasks.find((task) => task.id === id) ?? null;
  }

  async insertTask(task: Task): Promise<Task> {
    return this.transact((data) => {
      data.tasks.push(task);
      return task;
    });
  }

  async patchTask(id: string, patch: Partial<Task>): Promise<Task | null> {
    return this.transact((data) => {
      const index = data.tasks.findIndex((task) => task.id === id);
      if (index === -1) return null;
      const updated = { ...data.tasks[index], ...patch, id };
      data.tasks[index] = updated;
      return updated;
    });
  }

  async removeTask(id: string): Promise<boolean> {
    return this.transact((data) => {
      const index = data.tasks.findIndex((task) => task.id === id);
      if (index === -1) return false;
      data.tasks.splice(index, 1);
      return true;
    });
  }

  async listSubscriptions(): Promise<PushSubscriptionRecord[]> {
    const data = await this.read();
    return data.subscriptions;
  }

  async putSubscription(record: PushSubscriptionRecord): Promise<void> {
    await this.transact((data) => {
      const index = data.subscriptions.findIndex((sub) => sub.endpoint === record.endpoint);
      if (index === -1) data.subscriptions.push(record);
      else data.subscriptions[index] = record;
    });
  }

  async removeSubscription(endpoint: string): Promise<void> {
    await this.transact((data) => {
      const index = data.subscriptions.findIndex((sub) => sub.endpoint === endpoint);
      if (index !== -1) data.subscriptions.splice(index, 1);
    });
  }

  async getVapidKeys(): Promise<VapidKeys | null> {
    const data = await this.read();
    return data.vapid;
  }

  async setVapidKeys(keys: VapidKeys): Promise<void> {
    await this.transact((data) => {
      data.vapid = keys;
    });
  }

  async listRoutines(): Promise<Routine[]> {
    const data = await this.read();
    return data.rotinas;
  }

  async getRoutine(id: string): Promise<Routine | null> {
    const data = await this.read();
    return data.rotinas.find((routine) => routine.id === id) ?? null;
  }

  async insertRoutine(routine: Routine): Promise<Routine> {
    return this.transact((data) => {
      data.rotinas.push(routine);
      return routine;
    });
  }

  async patchRoutine(id: string, patch: Partial<Routine>): Promise<Routine | null> {
    return this.transact((data) => {
      const index = data.rotinas.findIndex((routine) => routine.id === id);
      if (index === -1) return null;
      const updated = { ...data.rotinas[index], ...patch, id };
      data.rotinas[index] = updated;
      return updated;
    });
  }

  async removeRoutine(id: string): Promise<boolean> {
    return this.transact((data) => {
      const index = data.rotinas.findIndex((routine) => routine.id === id);
      if (index === -1) return false;
      data.rotinas.splice(index, 1);
      return true;
    });
  }
}
