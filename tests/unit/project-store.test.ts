import { describe, expect, it } from 'vitest';
import { ProjectStore, type KeyValueStorage } from '../../src/project/project-store';
import type { ProjectV2 } from '../../src/project/schema';

class MemoryStorage implements KeyValueStorage {
  readonly data = new Map<string, string>();
  getItem(key: string): string | null { return this.data.get(key) ?? null; }
  setItem(key: string, value: string): void { this.data.set(key, value); }
  removeItem(key: string): void { this.data.delete(key); }
}
const project: ProjectV2 = {
  schemaVersion: 2,
  id: 'test-project',
  name: 'Test Project',
  tempo: 120,
  timeSignature: { numerator: 4, denominator: 4 },
  tracks: [],
  metadata: { origin: 'test' },
};

describe('ProjectStore', () => {
  it('round-trips a validated project through injected storage', () => {
    const storage = new MemoryStorage();
    const store = new ProjectStore({ storage });
    store.save(project);
    expect(store.load(project.id)).toEqual(project);
  });

  it('returns undefined for an unknown project', () => {
    const store = new ProjectStore({ storage: new MemoryStorage() });
    expect(store.load('missing')).toBeUndefined();
  });

  it('removes saved projects', () => {
    const store = new ProjectStore({ storage: new MemoryStorage() });
    store.save(project);
    store.remove(project.id);
    expect(store.load(project.id)).toBeUndefined();
  });
});