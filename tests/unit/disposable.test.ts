import { describe, expect, it, vi } from 'vitest';
import { DisposableStack } from '../../src/core/disposable';

describe('DisposableStack', () => {
  it('disposes in reverse registration order exactly once', () => {
    const stack = new DisposableStack();
    const calls: number[] = [];
    stack.defer(() => calls.push(1));
    stack.defer(() => calls.push(2));
    stack.dispose();
    stack.dispose();
    expect(calls).toEqual([2, 1]);
  });

  it('immediately disposes a resource registered after shutdown', () => {
    const stack = new DisposableStack();
    stack.dispose();
    const dispose = vi.fn();
    expect(() => stack.use({ dispose })).toThrow(/after disposal/);
    expect(dispose).toHaveBeenCalledOnce();
  });
});