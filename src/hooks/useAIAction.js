// src/hooks/useAIAction.js
//
// Every one of the six modules previously re-implemented the same three
// pieces of state (loading, result, source) and the same "call askAI, then
// store what comes back" function by hand. That's the same logic typed six
// times, which is exactly the kind of duplication that makes a codebase
// harder to maintain — a fix to how AI calls are tracked would have needed
// six matching edits. This hook is the single implementation; each module
// just calls it.

import { useState, useCallback } from 'react';
import { askAI } from '../lib/ai.js';

/**
 * @returns {{
 *   loading: boolean,
 *   result: string | null,
 *   source: 'live' | 'demo' | null,
 *   run: (mode: string, payload: string | object) => Promise<void>,
 *   reset: () => void,
 * }}
 */
export function useAIAction() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [source, setSource] = useState(null);

  const run = useCallback(async (mode, payload) => {
    setLoading(true);
    const { text, source: src } = await askAI(mode, payload);
    setResult(text);
    setSource(src);
    setLoading(false);
    return text;
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setSource(null);
  }, []);

  return { loading, result, source, run, reset };
}
