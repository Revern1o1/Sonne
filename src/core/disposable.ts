export interface Disposable {
  dispose(): void;
}

export class DisposableStack implements Disposable {
  #items: Disposable[] = [];
  #disposed = false;

  get disposed(): boolean { return this.#disposed; }

  use<T extends Disposable>(resource: T): T {
    if (this.#disposed) {
      resource.dispose();
      throw new Error('Cannot register a resource after disposal');
    }
    this.#items.push(resource);
    return resource;
  }

  defer(dispose: () => void): void {
    this.use({ dispose });
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    const errors: unknown[] = [];
    for (const resource of this.#items.splice(0).reverse()) {
      try { resource.dispose(); } catch (error) { errors.push(error); }
    }
    if (errors.length) throw new AggregateError(errors, 'Resource disposal failed');
  }
}

export function listen(
  target: EventTarget,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions | boolean,
): Disposable {
  target.addEventListener(type, listener, options);
  return { dispose: () => target.removeEventListener(type, listener, options) };
}