import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Workforce from './Workforce.jsx';
import { _clearAICache } from '../lib/ai.js';

describe('Workforce', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    _clearAICache();
  });

  it('renders 6 venue demand/staffing tiles', () => {
    render(<Workforce />);
    const tiles = screen.getAllByText((_, el) => /^Demand \d+% · Staff \d+$/.test(el?.textContent ?? ''));
    expect(tiles).toHaveLength(6);
  });

  it('recommends a cross-venue reallocation mentioning stewards, with real (not undefined) demand figures', async () => {
    const { container } = render(<Workforce />);
    fireEvent.click(screen.getByRole('button', { name: /ai reallocation plan/i }));
    await waitFor(() => expect(screen.getByText(/demo intelligence/i)).toBeInTheDocument());
    const output = container.querySelector('.ai-output');
    expect(output.textContent).toMatch(/reallocate|steward/i);
    expect(output.textContent).not.toMatch(/undefined/);
  });

  it('refreshing demand signals clears the previous recommendation', async () => {
    render(<Workforce />);
    fireEvent.click(screen.getByRole('button', { name: /ai reallocation plan/i }));
    await waitFor(() => expect(screen.getByText(/demo intelligence/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /refresh demand signals/i }));
    expect(screen.queryByText(/demo intelligence/i)).not.toBeInTheDocument();
  });
});
