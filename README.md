# Sonne Audio Workstation

A TypeScript + Vite foundation for incrementally modularizing Sonne while preserving its existing musical behavior.

## Status

This repository now contains project tooling, architecture notes, TypeScript contracts, lifecycle primitives, an extension registry, a project schema/persistence adapter, and unit tests. **The original HTML application and stylesheet still need to be transferred into this repository** before this represents a runnable behavior-preserving migration.

## Requirements

Node.js 20.19+ or 22.12+, and npm.

## Commands

```sh
npm install
npm run dev
npm run typecheck
npm test
npm run build
npm run check
```

## Structure

```text
src/
  main.ts
  core/         typed events, errors, disposal
  audio/        engine contract and browser capability detection
  extensions/   stable extension slots, contracts, lifecycle registry
  project/      versioned schema, migration and persistence adapter
  features/     legacy extraction boundaries
  legacy/       preserved implementation (pending transfer)
  styles/       preserved stylesheet (pending transfer)
tests/
  unit/
```

## Extension slots

- **Instrument** — owns voices and note lifecycle.
- **Effect** — exposes audio input/output nodes and parameter updates.
- **Generator** — produces note data and accepts cancellation.
- **Panel** — mounts into a host and returns a disposable instance.
- **Storage** — asynchronous byte-oriented read/write/remove contract.

The registry validates manifests, rejects duplicate IDs, and owns activation and disposal. Feature modules should depend on contracts rather than another feature's private state or DOM.

## Migration policy

Preserve current behavior first. Characterize existing workflows, then migrate one cohesive feature at a time behind stable contracts. See [ARCHITECTURE.md](./ARCHITECTURE.md) and [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md).

## Known limitations

- The original app source and stylesheet are not yet present in this repository.
- The current project schema is a new internal schema, not yet proven compatible with the original app's saved state.
- Unit tests cover the new foundations, not end-to-end browser/audio behavior.
- Build and tests must be run in a clean environment before relying on this scaffold.