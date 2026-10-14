export type AppErrorCode =
  | 'INVALID_STATE'
  | 'AUDIO_UNAVAILABLE'
  | 'EXTENSION_CONFLICT'
  | 'EXTENSION_ACTIVATION_FAILED'
  | 'PERSISTENCE_FAILED'
  | 'VALIDATION_FAILED';

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'AppError';
  }
}