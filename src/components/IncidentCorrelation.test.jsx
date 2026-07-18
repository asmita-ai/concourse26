import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IncidentCorrelation from './IncidentCorrelation.jsx';
import { _clearAICache } from '../lib/ai.js';

describe('IncidentCorrelation', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    _clearAICache();
  });

  it('does not submit an empty report', () => {
    render(<IncidentCorrelation />);
    fireEvent.click(screen.getByRole('button', { name: /submit \+ ai triage/i }));
    expect(screen.queryByText(/severity:/i)).not.toBeInTheDocument();
  });

  it('triages a typed report and logs a severity classification', async () => {
    render(<IncidentCorrelation />);
    fireEvent.change(screen.getByLabelText(/incident report/i), {
      target: { value: 'Fan collapsed near Gate C, needs medical attention' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit \+ ai triage/i }));
    await waitFor(() => expect(screen.getByText(/severity:/i)).toBeInTheDocument());
    expect(screen.getAllByText(/medical/i).length).toBeGreaterThan(0);
  });

  it('submits via Enter key and clears the input afterward', async () => {
    render(<IncidentCorrelation />);
    const input = screen.getByLabelText(/incident report/i);
    fireEvent.change(input, { target: { value: 'Unauthorized person with a weapon near Gate A' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => expect(screen.getByText(/severity:/i)).toBeInTheDocument());
    expect(input).toHaveValue('');
  });
});
