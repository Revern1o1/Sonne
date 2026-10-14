import { AppError } from '../core/errors';

export const CURRENT_PROJECT_VERSION = 2 as const;
export interface ProjectTrack {
  id: string;
  name: string;
  muted: boolean;
  volume: number;
  pan: number;
}
export interface ProjectV2 {
  schemaVersion: typeof CURRENT_PROJECT_VERSION;
  id: string;
  name: string;
  tempo: number;
  timeSignature: { numerator: number; denominator: number };
  tracks: ProjectTrack[];
  metadata: Record<string, unknown>;
}
export interface LegacyProjectV1 {
  version?: 1;
  id?: string;
  name?: string;
  tempo?: number;
  tracks?: Array<Partial<ProjectTrack> & { id?: string; name?: string }>;
  [key: string]: unknown;
}
export type UnknownProject = Record<string, unknown>;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function finiteInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

export function migrateProject(input: unknown): ProjectV2 {
  if (!record(input)) throw new AppError('VALIDATION_FAILED', 'Project must be an object');
  const version = input.schemaVersion ?? input.version ?? 1;
  if (version === 2) return validateProject(input);
  if (version !== 1) throw new AppError('VALIDATION_FAILED', `Unsupported project version: ${String(version)}`);
  const legacy = input as LegacyProjectV1;
  const migrated: ProjectV2 = {
    schemaVersion: 2,
    id: typeof legacy.id === 'string' && legacy.id ? legacy.id : 'project-import',
    name: typeof legacy.name === 'string' && legacy.name ? legacy.name : 'Imported project',
    tempo: finiteInRange(legacy.tempo, 20, 300) ? legacy.tempo : 120,
    timeSignature: { numerator: 4, denominator: 4 },
    tracks: Array.isArray(legacy.tracks) ? legacy.tracks.map((track, index) => ({
      id: typeof track.id === 'string' && track.id ? track.id : `track-${index + 1}`,
      name: typeof track.name === 'string' && track.name ? track.name : `Track ${index + 1}`,
      muted: typeof track.muted === 'boolean' ? track.muted : false,
      volume: finiteInRange(track.volume, 0, 2) ? track.volume : 1,
      pan: finiteInRange(track.pan, -1, 1) ? track.pan : 0,
    })) : [],
    metadata: {},
  };
  return validateProject(migrated);
}

export function validateProject(input: unknown): ProjectV2 {
  if (!record(input) || input.schemaVersion !== 2) {
    throw new AppError('VALIDATION_FAILED', 'Expected project schema version 2');
  }
  if (typeof input.id !== 'string' || !input.id.trim()) throw new AppError('VALIDATION_FAILED', 'Project id is required');
  if (typeof input.name !== 'string' || !input.name.trim()) throw new AppError('VALIDATION_FAILED', 'Project name is required');
  if (!finiteInRange(input.tempo, 20, 300)) throw new AppError('VALIDATION_FAILED', 'Tempo must be between 20 and 300 BPM');
  if (!record(input.timeSignature)
    || !Number.isInteger(input.timeSignature.numerator) || !finiteInRange(input.timeSignature.numerator, 1, 32)
    || !Number.isInteger(input.timeSignature.denominator) || ![1, 2, 4, 8, 16].includes(input.timeSignature.denominator as number)) {
    throw new AppError('VALIDATION_FAILED', 'Invalid time signature');
  }
  if (!Array.isArray(input.tracks)) throw new AppError('VALIDATION_FAILED', 'Tracks must be an array');
  const tracks = input.tracks.map((track, index) => {
    if (!record(track) || typeof track.id !== 'string' || !track.id || typeof track.name !== 'string'
      || typeof track.muted !== 'boolean' || !finiteInRange(track.volume, 0, 2)
      || !finiteInRange(track.pan, -1, 1)) {
      throw new AppError('VALIDATION_FAILED', `Invalid track at index ${index}`);
    }
    return { id: track.id, name: track.name, muted: track.muted, volume: track.volume, pan: track.pan };
  });
  if (!record(input.metadata)) throw new AppError('VALIDATION_FAILED', 'Project metadata must be an object');
  return {
    schemaVersion: 2,
    id: input.id,
    name: input.name,
    tempo: input.tempo,
    timeSignature: {
      numerator: input.timeSignature.numerator as number,
      denominator: input.timeSignature.denominator as number,
    },
    tracks,
    metadata: { ...input.metadata },
  };
}