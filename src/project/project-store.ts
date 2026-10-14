import { AppError } from '../core/errors';
import { migrateProject, type ProjectV2 } from './schema';

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
export interface ProjectStoreOptions {
  storage?: KeyValueStorage;
  keyPrefix?: string;
}

export class ProjectStore {
  readonly #storage: KeyValueStorage;
  readonly #keyPrefix: string;

  constructor(options: ProjectStoreOptions = {}) {
    const storage = options.storage ?? globalThis.localStorage;
    if (!storage) throw new AppError('PERSISTENCE_FAILED', 'No storage adapter is available');
    this.#storage = storage;
    this.#keyPrefix = options.keyPrefix ?? 'sonne.project.';
  }

  save(project: ProjectV2): void {
    try {
      this.#storage.setItem(this.#key(project.id), JSON.stringify(migrateProject(project)));
    } catch (cause) {
      throw new AppError('PERSISTENCE_FAILED', 'Could not save project', { cause });
    }
  }

  load(id: string): ProjectV2 | undefined {
    let raw: string | null;
    try { raw = this.#storage.getItem(this.#key(id)); }
    catch (cause) { throw new AppError('PERSISTENCE_FAILED', 'Could not read project', { cause }); }
    if (raw === null) return undefined;
    try { return migrateProject(JSON.parse(raw)); }
    catch (cause) {
      throw new AppError('PERSISTENCE_FAILED', `Stored project is invalid: ${id}`, { cause });
    }
  }

  remove(id: string): void {
    try { this.#storage.removeItem(this.#key(id)); }
    catch (cause) { throw new AppError('PERSISTENCE_FAILED', `Could not remove project: ${id}`, { cause }); }
  }

  #key(id: string): string {
    if (!id.trim()) throw new AppError('VALIDATION_FAILED', 'Project id cannot be empty');
    return `${this.#keyPrefix}${encodeURIComponent(id)}`;
  }
}