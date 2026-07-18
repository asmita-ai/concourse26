import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Workforce from './Workforce.jsx';

describe('Workforce', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
  });

  it('renders venue demand tiles', () => {
    render(<Workforce />);
    expect(screen.getByText(/refresh demand signals/i)).toBeInTheDocument();
  });

  it('produces a reallocation plan in demo mode', async () => {
    render(<Workforce />);
    fireEvent.click(screen.getByRole('button', { name: /ai reallocation plan/i }));
    await waitFor(() => {
      expect(screen.getByText(/demo intelligence/i)).toBeInTheDocument();
    });
  });
});
