import { ProtoClientError } from './errors';

export type QueuedMutation = {
  id: string;
  label: string;
  run: () => Promise<unknown>;
  enqueuedAt: number;
};

export type OfflineQueueOptions = {
  /** Max queued items (default 50) */
  maxSize?: number;
  /** Called whenever queue length changes */
  onChange?: (size: number) => void;
  /** Persist/rehydrate hooks for app storage */
  storage?: {
    load: () => Promise<QueuedMutation[]> | QueuedMutation[];
    save: (items: QueuedMutation[]) => Promise<void> | void;
  };
};

/**
 * Queue failed (or deferred) mutations and flush when back online.
 * Does not auto-detect network — call `setOnline(true/false)` or `flush()` yourself.
 */
export class OfflineMutationQueue {
  private items: QueuedMutation[] = [];
  private readonly maxSize: number;
  private readonly onChange?: (size: number) => void;
  private readonly storage?: OfflineQueueOptions['storage'];
  private online = true;
  private flushing = false;

  constructor(options: OfflineQueueOptions = {}) {
    this.maxSize = options.maxSize ?? 50;
    this.onChange = options.onChange;
    this.storage = options.storage;
  }

  async hydrate(): Promise<void> {
    if (!this.storage) return;
    const loaded = await this.storage.load();
    this.items = Array.isArray(loaded) ? loaded.slice(0, this.maxSize) : [];
    this.emit();
  }

  setOnline(online: boolean): void {
    this.online = online;
    if (online) {
      void this.flush();
    }
  }

  isOnline(): boolean {
    return this.online;
  }

  size(): number {
    return this.items.length;
  }

  /**
   * Run immediately when online; otherwise enqueue and resolve after flush.
   */
  async runOrEnqueue<T>(
    label: string,
    run: () => Promise<T>
  ): Promise<T> {
    if (this.online) {
      return run();
    }

    return new Promise<T>((resolve, reject) => {
      if (this.items.length >= this.maxSize) {
        reject(
          new ProtoClientError({
            code: 'INVALID_ARGUMENT',
            message: `Offline queue is full (max ${this.maxSize})`,
          })
        );
        return;
      }

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      this.items.push({
        id,
        label,
        enqueuedAt: Date.now(),
        run: async () => {
          const result = await run();
          resolve(result);
          return result;
        },
      });
      this.emit();
      void this.persist();
    });
  }

  enqueue(label: string, run: () => Promise<unknown>): string {
    if (this.items.length >= this.maxSize) {
      throw new ProtoClientError({
        code: 'INVALID_ARGUMENT',
        message: `Offline queue is full (max ${this.maxSize})`,
      });
    }
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    this.items.push({ id, label, run, enqueuedAt: Date.now() });
    this.emit();
    void this.persist();
    return id;
  }

  async flush(): Promise<{ ok: number; failed: number }> {
    if (this.flushing) {
      return { ok: 0, failed: 0 };
    }
    this.flushing = true;
    let ok = 0;
    let failed = 0;

    try {
      while (this.items.length > 0 && this.online) {
        const item = this.items[0];
        if (!item) break;
        try {
          await item.run();
          this.items.shift();
          ok += 1;
          this.emit();
          await this.persist();
        } catch {
          failed += 1;
          break;
        }
      }
    } finally {
      this.flushing = false;
    }

    return { ok, failed };
  }

  clear(): void {
    this.items = [];
    this.emit();
    void this.persist();
  }

  private emit(): void {
    if (this.onChange) {
      this.onChange(this.items.length);
    }
  }

  private async persist(): Promise<void> {
    if (!this.storage) return;
    await this.storage.save(this.items);
  }
}
