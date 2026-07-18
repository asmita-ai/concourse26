import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CrowdMesh from './CrowdMesh.jsx';

describe('CrowdMesh', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
  });

  it('renders a set of venue tiles with capacity stats', () => {
    render(<CrowdMesh />);
    expect(screen.getByText(/avg across active venues/i)).toBeInTheDocument();
    expect(screen.getByText(/venues at high density/i)).toBeInTheDocument();
  });

  it('refreshing generates a new set of venue readings', () => {
    render(<CrowdMesh />);
    fireEvent.click(screen.getByRole('button', { name: /refresh live feed/i }));
    // Values are randomized on refresh; the button should not throw and stats should still render.
    expect(screen.getByText(/avg across active venues/i)).toBeInTheDocument();
  });

  it('runs an AI risk analysis and falls back to demo intelligence without an API', async () => {
    render(<CrowdMesh />);
    fireEvent.click(screen.getByRole('button', { name: /ai cross-venue risk analysis/i }));
    await waitFor(() => {
      expect(screen.getByText(/demo intelligence/i)).toBeInTheDocument();
    });
  });
});
