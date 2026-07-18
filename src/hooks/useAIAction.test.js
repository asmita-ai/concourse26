import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAIAction } from './useAIAction.js';
import { _clearAICache } from '../lib/ai.js';

describe('useAIAction', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    _clearAICache();
  });

  it('starts idle with no result and not loading', () => {
    const { result } = renderHook(() => useAIAction());
    expect(result.current.loading).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.source).toBeNull();
  });

  it('sets loading true synchronously when run is called, then resolves with a result', async () => {
    const { result } = renderHook(() => useAIAction());

    act(() => {
      result.current.run('journey', 'Origin: Boston. Itinerary: Toronto.');
    });
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(typeof result.current.result).toBe('string');
    expect(result.current.source).toBe('demo');
  });

  it('reset clears the result and source', async () => {
    const { result } = renderHook(() => useAIAction());
    await act(async () => {
      await result.current.run('sustainledger', 'Venue: Miami. Transport mode chosen: Metro.');
    });
    expect(result.current.result).not.toBeNull();

    act(() => result.current.reset());
    expect(result.current.result).toBeNull();
    expect(result.current.source).toBeNull();
  });
});
