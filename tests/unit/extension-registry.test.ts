import { describe, expect, it, vi } from 'vitest';
import { ExtensionRegistry } from '../../src/extensions/registry';

const definition = (id = 'test.synth') => ({
  manifest: { id, name: 'Test Synth', version: '1.0.0', apiVersion: 1 as const, slot: 'instrument' as const },
  activate: vi.fn(async () => ({ dispose: vi.fn() })),
});

describe('ExtensionRegistry', () => {
  it('registers and filters manifests by slot', () => {
    const registry = new ExtensionRegistry();
    registry.register(definition());
    expect(registry.list('instrument')).toHaveLength(1);
    expect(registry.list('effect')).toHaveLength(0);
  });

  it('rejects duplicate ids', () => {
    const registry = new ExtensionRegistry();
    registry.register(definition());
    expect(() => registry.register(definition())).toThrow(/Duplicate extension id/);
  });

  it('activates once and disposes active instances', async () => {
    const registry = new ExtensionRegistry();
    const item = definition();
    registry.register(item);
    const instance = await registry.activate('test.synth');
    await expect(registry.activate('test.synth')).rejects.toThrow(/already active/);
    await registry.dispose();
    expect(instance.dispose).toHaveBeenCalledOnce();
  });
});