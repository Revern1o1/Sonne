import type { Disposable } from '../core/disposable';

export type ExtensionSlot = 'instrument' | 'effect' | 'generator' | 'panel' | 'storage';
export interface ExtensionManifest {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly apiVersion: 1;
  readonly slot: ExtensionSlot;
  readonly description?: string;
}
export interface ExtensionContext {
  readonly signal: AbortSignal;
  readonly logger: Pick<Console, 'debug' | 'info' | 'warn' | 'error'>;
}
export interface ExtensionInstance extends Disposable {}
export interface ExtensionDefinition<T extends ExtensionInstance = ExtensionInstance> {
  readonly manifest: ExtensionManifest;
  activate(context: ExtensionContext): T | Promise<T>;
}
export interface InstrumentVoice {
  noteOn(note: number, velocity: number, atTime?: number): void;
  noteOff(note: number, atTime?: number): void;
  allNotesOff(atTime?: number): void;
  dispose(): void;
}
export interface InstrumentInstance extends ExtensionInstance {
  createVoice(): InstrumentVoice;
}
export interface EffectInstance extends ExtensionInstance {
  readonly input: AudioNode;
  readonly output: AudioNode;
  setParameter(name: string, value: number): void;
}
export interface GeneratedNote {
  readonly pitch: number;
  readonly velocity: number;
  readonly startBeat: number;
  readonly durationBeats: number;
}
export interface GeneratorRequest {
  readonly seed?: number;
  readonly bars: number;
  readonly tempo: number;
}
export interface GeneratorInstance extends ExtensionInstance {
  generate(request: GeneratorRequest, signal: AbortSignal): Promise<readonly GeneratedNote[]>;
}
export interface PanelInstance extends ExtensionInstance {
  mount(host: HTMLElement): void;
}
export interface StorageInstance extends ExtensionInstance {
  read(key: string): Promise<Uint8Array | undefined>;
  write(key: string, value: Uint8Array): Promise<void>;
  remove(key: string): Promise<void>;
}