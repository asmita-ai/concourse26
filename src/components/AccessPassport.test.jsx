import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AccessPassport from './AccessPassport.jsx';
import { _clearAICache } from '../lib/ai.js';

describe('AccessPassport', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    _clearAICache();
  });

  it('renders the need textarea, venue selector, and three quick presets', () => {
    render(<AccessPassport />);
    expect(screen.getByLabelText(/accessibility need/i)).toHaveValue('Wheelchair access');
    expect(screen.getByLabelText(/next venue on this fan.s itinerary/i)).toBeInTheDocument();
    expect(screen.getByText('Visually impaired, needs escort')).toBeInTheDocument();
  });

  it('updates the need field when a preset chip is clicked', () => {
    render(<AccessPassport />);
    fireEvent.click(screen.getByText('Hearing assistance for alerts'));
    expect(screen.getByLabelText(/accessibility need/i)).toHaveValue('Hearing assistance for alerts');
  });

  it('toggles high-contrast and large-text accessibility controls', () => {
    render(<AccessPassport />);
    const contrastBtn = screen.getByRole('button', { name: /high-contrast off/i });
    fireEvent.click(contrastBtn);
    expect(screen.getByRole('button', { name: /high-contrast on/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('generates a venue-specific accommodation plan', async () => {
    render(<AccessPassport />);
    fireEvent.click(screen.getByRole('button', { name: /generate venue-specific accommodation plan/i }));
    await waitFor(() => expect(screen.getByText(/demo intelligence/i)).toBeInTheDocument());
  });
});
