import React from 'react';

/** The one-line explainer paragraph every module renders at its top. */
export default function ModuleIntro({ children }) {
  return <p className="module-intro">{children}</p>;
}
