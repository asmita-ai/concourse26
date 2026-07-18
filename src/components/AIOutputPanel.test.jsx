import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ModuleIntro from './ModuleIntro.jsx';
import AIOutputPanel, { aiTag } from './AIOutputPanel.jsx';

describe('ModuleIntro', () => {
  it('renders its children inside the module-intro paragraph', () => {
    render(<ModuleIntro>Some explainer text</ModuleIntro>);
    const p = screen.getByText('Some explainer text');
    expect(p.tagName).toBe('P');
    expect(p).toHaveClass('module-intro');
  });
});

describe('AIOutputPanel', () => {
  it('renders the given tag and children', () => {
    render(<AIOutputPanel tag="AI-generated plan">Some result text</AIOutputPanel>);
    expect(screen.getByText('AI-generated plan')).toHaveClass('tag');
    expect(screen.getByText('Some result text')).toBeInTheDocument();
  });

  it('applies custom inline styles when provided', () => {
    const { container } = render(
      <AIOutputPanel tag="Demo intelligence" style={{ fontSize: 17 }}>Body</AIOutputPanel>
    );
    expect(container.querySelector('.ai-output')).toHaveStyle({ fontSize: '17px' });
  });
});

describe('aiTag', () => {
  it('returns the live label when source is live', () => {
    expect(aiTag('live', 'AI-generated plan')).toBe('AI-generated plan');
  });

  it('returns "Demo intelligence" for any non-live source', () => {
    expect(aiTag('demo', 'AI-generated plan')).toBe('Demo intelligence');
    expect(aiTag(null, 'AI-generated plan')).toBe('Demo intelligence');
  });
});
