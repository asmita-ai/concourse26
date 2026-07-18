import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CrowdMesh from './CrowdMesh.jsx';
import { _clearAICache } from '../lib/ai.js';

describe('CrowdMesh', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    _clearAICache();
  });

  it('renders 8 active venue tiles and summary stats', () => {
    render(<CrowdMesh />);
    expect(screen.getByText(/avg across active venues/i)).toBeInTheDocument();
    expect(screen.getByText(/venues at high density/i)).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('re-randomizes the venue feed and clears any prior result on refresh', async () => {
    render(<CrowdMesh />);
    fireEvent.click(screen.getByRole('button', { name: /ai cross-venue risk analysis/i }));
    await waitFor(() => expect(screen.getByText(/demo intelligence/i)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /refresh live feed/i }));
    expect(screen.queryByText(/demo intelligence/i)).not.toBeInTheDocument();
  });

  it('produces a cross-venue risk analysis mentioning a dispatch action', async () => {
    render(<CrowdMesh />);
    fireEvent.click(screen.getByRole('button', { name: /ai cross-venue risk analysis/i }));
    await waitFor(() => expect(screen.getByText(/highest risk/i)).toBeInTheDocument());
    expect(screen.getByText(/dispatch/i)).toBeInTheDocument();
  });
});
