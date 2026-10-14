export interface WebAudioCapabilities {
  readonly supported: boolean;
  readonly audioWorklet: boolean;
  readonly offlineContext: boolean;
}

/** Detect support without creating an AudioContext or consuming browser resources. */
export function detectWebAudioCapabilities(): WebAudioCapabilities {
  const AudioContextConstructor = globalThis.AudioContext;
  const OfflineContextConstructor = globalThis.OfflineAudioContext;
  return {
    supported: typeof AudioContextConstructor === 'function',
    audioWorklet: typeof AudioContextConstructor === 'function'
      && 'audioWorklet' in AudioContextConstructor.prototype,
    offlineContext: typeof OfflineContextConstructor === 'function',
  };
}