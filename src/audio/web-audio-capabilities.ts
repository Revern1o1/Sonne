export interface WebAudioCapabilities {
  readonly supported: boolean;
  readonly audioWorklet: boolean;
  readonly offlineContext: boolean;
  readonly sampleRate?: number;
}

export function detectWebAudioCapabilities(): WebAudioCapabilities {
  const AudioContextConstructor = globalThis.AudioContext;
  const OfflineContextConstructor = globalThis.OfflineAudioContext;
  return {
    supported: typeof AudioContextConstructor === 'function',
    audioWorklet: typeof AudioContextConstructor === 'function'
      && 'audioWorklet' in AudioContextConstructor.prototype,
    offlineContext: typeof OfflineContextConstructor === 'function',
    sampleRate: typeof AudioContextConstructor === 'function'
      ? new AudioContextConstructor().sampleRate
      : undefined,
  };
}