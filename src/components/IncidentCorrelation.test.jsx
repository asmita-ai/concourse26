import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IncidentCorrelation from './IncidentCorrelation.jsx';

describe('IncidentCorrelation', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
  });

  it('does nothing when submitted with an empty report', () => {
    render(<IncidentCorrelation />);
    fireEvent.click(screen.getByRole('button', { name: /submit \+ ai triage/i }));
    expect(screen.queryByText(/demo intelligence/i)).not.toBeInTheDocument();
  });

  it('submits a report and logs a triaged entry with severity', async () => {
    render(<IncidentCorrelation />);
    fireEvent.change(screen.getByLabelText(/incident report/i), {
      target: { value: 'Fan collapsed near Gate C, needs medical attention' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit \+ ai triage/i }));
    await waitFor(() => {
      expect(screen.getByText(/SEVERITY:/)).toBeInTheDocument();
    });
    expect(screen.getByText(/"Fan collapsed near Gate C, needs medical attention"/)).toBeInTheDocument();
  });

  it('supports submitting via the Enter key', async () => {
    render(<IncidentCorrelation />);
    const input = screen.getByLabelText(/incident report/i);
    fireEvent.change(input, { target: { value: 'Lost child near Section B4' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => {
      expect(screen.getByText(/SEVERITY:/)).toBeInTheDocument();
    });
  });

  it('clears the input field after a successful submission', async () => {
    render(<IncidentCorrelation />);
    const input = screen.getByLabelText(/incident report/i);
    fireEvent.change(input, { target: { value: 'Minor facilities issue at Gate D' } });
    fireEvent.click(screen.getByRole('button', { name: /submit \+ ai triage/i }));
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });
});
