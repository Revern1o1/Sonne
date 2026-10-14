import type { Disposable } from './disposable';

export type EventMap = Record<string, unknown>;
export type EventHandler<T> = (payload: T) => void;

/** Synchronous, typed in-process events. Handlers are isolated from one another. */
export class EventBus<Events extends EventMap> {
  #handlers = new Map<keyof Events, Set<EventHandler<never>>>();

  on<K extends keyof Events>(type: K, handler: EventHandler<Events[K]>): Disposable {
    let handlers = this.#handlers.get(type);
    if (!handlers) {
      handlers = new Set();
      this.#handlers.set(type, handlers);
    }
    handlers.add(handler as EventHandler<never>);
    let active = true;
    return {
      dispose: () => {
        if (!active) return;
        active = false;
        handlers?.delete(handler as EventHandler<never>);
        if (handlers?.size === 0) this.#handlers.delete(type);
      },
    };
  }

  emit<K extends keyof Events>(type: K, payload: Events[K]): void {
    const handlers = this.#handlers.get(type);
    if (!handlers) return;
    const errors: unknown[] = [];
    for (const handler of [...handlers]) {
      try { (handler as EventHandler<Events[K]>)(payload); } catch (error) { errors.push(error); }
    }
    if (errors.length) queueMicrotask(() => {
      throw new AggregateError(errors, `Event handlers failed for ${String(type)}`);
    });
  }

  clear(): void { this.#handlers.clear(); }
}