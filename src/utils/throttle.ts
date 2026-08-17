/**
 * Throttling and Debouncing Utilities
 * Implements standard rate limiting, debouncing, and in-flight promise deduplication.
 */

export function debounce<T extends (...args: any[]) => void>(fn: T, delayMs: number): T & { cancel: () => void } {
  let timer: any = null;

  const debounced = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delayMs);
  };

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced as T & { cancel: () => void };
}

export function throttle<T extends (...args: any[]) => void>(fn: T, intervalMs: number): T {
  let lastCall = 0;
  let timer: any = null;

  return ((...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = intervalMs - (now - lastCall);

    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      lastCall = now;
      fn(...args);
    } else if (!timer) {
      timer = setTimeout(() => {
        lastCall = Date.now();
        timer = null;
        fn(...args);
      }, remaining);
    }
  }) as T;
}

/**
 * In-flight promise cache to prevent redundant concurrent GET requests
 */
class RequestDeduplicator {
  private inFlight = new Map<string, Promise<any>>();

  async execute<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key) as Promise<T>;
    }

    const promise = fetcher().finally(() => {
      this.inFlight.delete(key);
    });

    this.inFlight.set(key, promise);
    return promise;
  }

  clear() {
    this.inFlight.clear();
  }
}

export const requestDeduplicator = new RequestDeduplicator();
