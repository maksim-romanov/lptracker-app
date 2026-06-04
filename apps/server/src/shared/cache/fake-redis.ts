type StoredValue = { value: string; expiresAt: number | null };

export class FakeRedis {
  private store = new Map<string, StoredValue>();
  private clock = 0;

  advance(ms: number): void {
    this.clock += ms;
  }

  get now(): number {
    return this.clock;
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== null && entry.expiresAt <= this.clock) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string): Promise<void> {
    this.store.set(key, { value, expiresAt: null });
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    const entry = this.store.get(key);
    if (!entry) return;
    entry.expiresAt = this.clock + ttlSeconds * 1000;
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}
