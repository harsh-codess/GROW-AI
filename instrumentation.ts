// instrumentation.ts
// Fix for Node.js 22+ where --localstorage-file creates a broken localStorage global
// that doesn't implement the Web Storage API (getItem/setItem/removeItem/clear/key/length)
export async function register() {
  if (typeof window === 'undefined') {
    // We're on the server - check if localStorage exists but is broken
    const g = globalThis as Record<string, unknown>;
    if (g.localStorage && typeof (g.localStorage as Storage).getItem !== 'function') {
      // Replace with a no-op implementation of the Web Storage API
      const storage = new Map<string, string>();
      g.localStorage = {
        getItem(key: string): string | null {
          return storage.get(key) ?? null;
        },
        setItem(key: string, value: string): void {
          storage.set(key, String(value));
        },
        removeItem(key: string): void {
          storage.delete(key);
        },
        clear(): void {
          storage.clear();
        },
        key(index: number): string | null {
          const keys = Array.from(storage.keys());
          return keys[index] ?? null;
        },
        get length(): number {
          return storage.size;
        },
      };
    }
  }
}
