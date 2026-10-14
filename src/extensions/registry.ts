import { AppError } from '../core/errors';
import type { Disposable } from '../core/disposable';
import type { ExtensionDefinition, ExtensionInstance, ExtensionManifest, ExtensionSlot } from './contracts';

const ID_PATTERN = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/;

function validateManifest(manifest: ExtensionManifest): void {
  if (!ID_PATTERN.test(manifest.id)) throw new AppError('VALIDATION_FAILED', `Invalid extension id: ${manifest.id}`);
  if (!VERSION_PATTERN.test(manifest.version)) throw new AppError('VALIDATION_FAILED', `Invalid extension version: ${manifest.version}`);
  if (manifest.apiVersion !== 1) throw new AppError('VALIDATION_FAILED', `Unsupported extension API: ${manifest.apiVersion}`);
  if (!manifest.name.trim()) throw new AppError('VALIDATION_FAILED', 'Extension name cannot be empty');
}

interface ActiveExtension {
  readonly instance: ExtensionInstance;
  readonly controller: AbortController;
}

/** Owns extension identity, activation, and deterministic cleanup. */
export class ExtensionRegistry implements Disposable {
  #definitions = new Map<string, ExtensionDefinition>();
  #active = new Map<string, ActiveExtension>();
  #disposed = false;

  register(definition: ExtensionDefinition): Disposable {
    this.#assertAlive();
    validateManifest(definition.manifest);
    if (this.#definitions.has(definition.manifest.id)) {
      throw new AppError('EXTENSION_CONFLICT', `Duplicate extension id: ${definition.manifest.id}`);
    }
    this.#definitions.set(definition.manifest.id, definition);
    return { dispose: () => {
      if (this.#active.has(definition.manifest.id)) {
        throw new AppError('INVALID_STATE', 'Deactivate an extension before unregistering it');
      }
      this.#definitions.delete(definition.manifest.id);
    } };
  }

  list(slot?: ExtensionSlot): readonly ExtensionManifest[] {
    return [...this.#definitions.values()]
      .map(definition => definition.manifest)
      .filter(manifest => !slot || manifest.slot === slot);
  }

  async activate(id: string): Promise<ExtensionInstance> {
    this.#assertAlive();
    const definition = this.#definitions.get(id);
    if (!definition) throw new AppError('INVALID_STATE', `Unknown extension: ${id}`);
    if (this.#active.has(id)) throw new AppError('EXTENSION_CONFLICT', `Extension already active: ${id}`);
    const controller = new AbortController();
    try {
      const instance = await definition.activate({
        signal: controller.signal,
        logger: console,
      });
      if (this.#disposed || controller.signal.aborted) {
        await instance.dispose();
        throw new AppError('INVALID_STATE', 'Registry was disposed during activation');
      }
      this.#active.set(id, { instance, controller });
      return instance;
    } catch (cause) {
      controller.abort(cause);
      if (cause instanceof AppError) throw cause;
      throw new AppError('EXTENSION_ACTIVATION_FAILED', `Failed to activate extension: ${id}`, { cause });
    }
  }

  async deactivate(id: string): Promise<void> {
    const active = this.#active.get(id);
    if (!active) return;
    this.#active.delete(id);
    active.controller.abort();
    await active.instance.dispose();
  }

  async dispose(): Promise<void> {
    if (this.#disposed) return;
    this.#disposed = true;
    const errors: unknown[] = [];
    for (const id of [...this.#active.keys()].reverse()) {
      try { await this.deactivate(id); } catch (error) { errors.push(error); }
    }
    this.#definitions.clear();
    if (errors.length) throw new AggregateError(errors, 'Extension registry disposal failed');
  }

  #assertAlive(): void {
    if (this.#disposed) throw new AppError('INVALID_STATE', 'Extension registry is disposed');
  }
}