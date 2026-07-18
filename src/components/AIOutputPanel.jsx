import React from 'react';

/**
 * The result panel shown by every AI-backed module after a call completes.
 * `tag` is the small label rendered above the output — usually
 * `source === 'live' ? 'AI-generated ...' : 'Demo intelligence'`, but left
 * as a plain node so callers with richer tags (e.g. venue + timestamp) can
 * compose their own without this component knowing about their shape.
 */
export default function AIOutputPanel({ tag, children, style }) {
  return (
    <div className="ai-output" style={style}>
      <span className="tag">{tag}</span>
      {children}
    </div>
  );
}

/** Convenience helper for the common "AI-generated X" vs "Demo intelligence" tag. */
export function aiTag(source, liveLabel) {
  return source === 'live' ? liveLabel : 'Demo intelligence';
}
