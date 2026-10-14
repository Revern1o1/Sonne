export type MidiNote = number & { readonly __midiNote: unique symbol };
export type GainValue = number & { readonly __gainValue: unique symbol };

export interface NoteEvent {
  readonly note: number;
  readonly velocity: number;
  readonly startBeat: number;
  readonly durationBeats: number;
  readonly instrumentId: string;
}

export interface AudioEngine {
  readonly state: AudioContextState | 'unavailable';
  start(): Promise<void>;
  suspend(): Promise<void>;
  scheduleNote(event: NoteEvent): void;
  allNotesOff(instrumentId?: string): void;
  dispose(): Promise<void>;
}

export interface AudioEngineFactory {
  create(): AudioEngine;
}