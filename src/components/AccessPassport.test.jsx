import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AccessPassport from './AccessPassport.jsx';

describe('AccessPassport', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
  });

  it('generates a venue-specific accommodation plan in demo mode', async () => {
    render(<AccessPassport />);
    fireEvent.click(screen.getByRole('button', { name: /generate venue-specific accommodation plan/i }));
    await waitFor(() => {
      expect(screen.getByText(/demo intelligence/i)).toBeInTheDocument();
    });
  });

  it('toggles high-contrast mode', () => {
    render(<AccessPassport />);
    const toggle = screen.getByRole('button', { name: /high-contrast off/i });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: /high-contrast on/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles large text mode', () => {
    render(<AccessPassport />);
    const toggle = screen.getByRole('button', { name: /large text off/i });
    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: /large text on/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('applies a preset need when its button is clicked', () => {
    render(<AccessPassport />);
    fireEvent.click(screen.getByRole('button', { name: 'Hearing assistance for alerts' }));
    expect(screen.getByLabelText(/accessibility need/i)).toHaveValue('Hearing assistance for alerts');
  });
});
