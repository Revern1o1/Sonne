# Migration checklist

## Baseline and tooling
- [ ] Install dependencies in a clean environment.
- [ ] Run `npm run check` and record output.
- [ ] Record browser support and baseline screenshots.
- [ ] Characterize boot, transport, tempo, notes, all instruments, mixer, presets, import/export, save/restore, and responsive layout.

## Project data
- [ ] Identify every existing localStorage key and serialized shape.
- [ ] Add fixtures from real existing projects.
- [ ] Verify import, migration, save, reload, and export round trips.
- [ ] Preserve unknown extension-owned fields.

## Audio and transport
- [ ] Define scheduler timing guarantees and latency assumptions.
- [ ] Add tests for note-on/note-off pairing and stop/pause behavior.
- [ ] Confirm no stuck notes after visibility changes or instrument removal.
- [ ] Measure scheduling drift before considering AudioWorklet.

## Feature extraction
- [ ] Transport / clock
- [ ] Instrument adapters
- [ ] Sequencer
- [ ] Piano roll
- [ ] Mixer and effects
- [ ] Preset browser and project persistence
- [ ] Waveform and other visualizers

For each feature: add characterization tests first, move one cohesive responsibility, verify keyboard/pointer interactions, verify cleanup, then compare audio and visual behavior.

## Release readiness
- [ ] Browser-level smoke tests.
- [ ] OfflineAudioContext or deterministic DSP tests where supported.
- [ ] Keyboard and accessibility checks.
- [ ] Performance profile for long sessions and many notes.
- [ ] CI for typecheck, unit tests, build, and browser tests.