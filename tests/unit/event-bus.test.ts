import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/event-bus';

type Events = { tempo: { bpm: number }; stopped: undefined };

describe('EventBus', () => {
  it('delivers typed payloads to subscribers', () => {
    const bus = new EventBus<Events>();
    const handler = vi.fn();
    bus.on('tempo', handler);
    bus.emit('tempo', { bpm: 128 });
    expect(handler).toHaveBeenCalledWith({ bpm: 128 });
  });

  it('supports idempotent unsubscription', () => {
    const bus = new EventBus<Events>();
    const handler = vi.fn();
    const subscription = bus.on('stopped', handler);
    subscription.dispose();
    subscription.dispose();
    bus.emit('stopped', undefined);
    expect(handler).not.toHaveBeenCalled();
  });
});