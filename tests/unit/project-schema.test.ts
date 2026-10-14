import { describe, expect, it } from 'vitest';
import { migrateProject } from '../../src/project/schema';

describe('migrateProject', () => {
  it('migrates an older project into the current schema', () => {
    const project = migrateProject({ version: 1, id: 'old', tempo: 110, tracks: [{ name: 'Lead' }] });
    expect(project.schemaVersion).toBe(2);
    expect(project.tempo).toBe(110);
    expect(project.tracks[0]).toMatchObject({ id: 'track-1', name: 'Lead', muted: false, volume: 1, pan: 0 });
  });

  it('rejects invalid current schema values', () => {
    expect(() => migrateProject({ schemaVersion: 2, id: 'x', name: 'Bad', tempo: 500,
      timeSignature: { numerator: 4, denominator: 4 }, tracks: [], metadata: {} })).toThrow(/Tempo/);
  });

  it('preserves metadata on current schema validation', () => {
    const project = migrateProject({ schemaVersion: 2, id: 'p', name: 'Project', tempo: 120,
      timeSignature: { numerator: 4, denominator: 4 }, tracks: [], metadata: { owner: 'local' } });
    expect(project.metadata).toEqual({ owner: 'local' });
  });
});