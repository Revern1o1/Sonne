# Architecture and migration strategy

## Goal

Move Sonne toward independently maintainable TypeScript modules without changing its musical behavior prematurely. The legacy interface and audio behavior are the baseline until characterization tests can demonstrate parity.

## Dependency direction

```text
UI / feature modules
  ├── core lifecycle + typed events
  ├── audio contracts
  ├── extension contracts
  └── project schema + persistence
```

Feature modules should communicate through stable contracts and typed events, not by reaching into another feature's DOM or private state. The composition root is responsible for wiring implementations.

## Module ownership

- `core/`: errors, event delivery, resource lifecycle.
- `audio/`: engine contracts and browser capability checks; DSP and scheduling implementations are separate follow-up work.
- `extensions/`: stable IDs, API-versioned manifests, activation and disposal.
- `project/`: validated, versioned project documents and storage adapter.
- `features/`: migration boundaries around legacy feature seams.
- `legacy/` and `styles/`: temporary behavior-preservation boundary.

## Extension slots

Instrument, effect, generator, panel, and storage extensions have distinct contracts. A manifest is versioned independently from an extension's implementation. The registry owns activation and cancellation; feature modules own their internal resources and expose one disposal handle.

## Preservation-first sequence

1. Record and test workflows against the original app: boot, transport, tempo, each instrument, notes, mixer, presets, import/export, save/restore, responsive view.
2. Validate/migrate project data at the boundary; preserve old saved fields until round-trip tests establish compatibility.
3. Extract transport and scheduling behind the audio contract without changing timing or sound.
4. Wrap existing instruments and effects with extension contracts.
5. Extract sequencer, mixer, preset browser, and visualizers one at a time with focused tests.
6. Add browser automation and audio-buffer checks before replacing render loops or DSP.

## Quality gates

- Every event listener, timer, audio node, and mounted panel has a clear owner and cleanup path.
- User data is validated at import and persistence boundaries.
- Async extension work receives an abort signal.
- UI frame cadence never becomes the source of truth for audio timing.
- New dependencies require a concrete capability or measurable benefit.
- Type checking and unit tests are required; browser/audio regressions must be added as features are extracted.

## Current limitation

The initial TypeScript modules establish boundaries and testable foundations. They do not yet prove full application behavior or replace the legacy synthesis engine. Do not mark a feature migrated until its parity tests pass.