/**
 * Compatibility boundary for the preserved Sonne 2S implementation.
 * Keep old localStorage formats and DOM behavior here until characterization
 * tests prove a replacement is equivalent.
 */
export interface LegacyAdapter<TSnapshot> {
  readSnapshot(): TSnapshot;
  restoreSnapshot(snapshot: TSnapshot): void;
}
export interface LegacyFeatureBoundary {
  readonly featureId: string;
  readonly sourceModule: string;
  readonly extractionReady: boolean;
}
export const LEGACY_FEATURE_BOUNDARIES: readonly LegacyFeatureBoundary[] = [
  { featureId: 'transport', sourceModule: 'legacy-app.js', extractionReady: false },
  { featureId: 'instruments', sourceModule: 'legacy-app.js', extractionReady: false },
  { featureId: 'sequencer', sourceModule: 'legacy-app.js', extractionReady: false },
  { featureId: 'mixer', sourceModule: 'legacy-app.js', extractionReady: false },
  { featureId: 'preset-browser', sourceModule: 'legacy-app.js', extractionReady: false },
  { featureId: 'visualizers', sourceModule: 'legacy-app.js', extractionReady: false },
];