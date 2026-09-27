/**
 * WS14-T08 — Frontend: B2BRegister Tests
 *
 * Tests the B2BRegister form component.
 * Covers: rendering, validation, loading state, success, API failure.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../../../test/test-utils';
import B2BRegister from '../B2BRegister';

// Mock axios directly since B2BRegister uses raw axios (not b2b.service)
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}));

import axios from 'axios';
const mockAxios = axios as { default: { post: ReturnType<typeof vi.fn> } } & { post: ReturnType<typeof vi.fn> };

const renderRegister = () => render(<B2BRegister />);

describe('WS14-T08 Frontend — B2BRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── A. Rendering ─────────────────────────────────────────────────────────

  it('A1 — renders all required form fields', () => {
    renderRegister();

    expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Minimum 8 characters')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Company Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('company@example.com')).toBeInTheDocument();
  });

  it('A2 — renders account type selector with CLIENT and VENDOR options', () => {
    renderRegister();

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Client' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Vendor' })).toBeInTheDocument();
  });

  it('A3 — renders submit button', () => {
    renderRegister();
    expect(screen.getByRole('button', { name: /Submit Registration/i })).toBeInTheDocument();
  });

  it('A4 — has "Sign in" link', () => {
    renderRegister();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  // ── B. Validation ─────────────────────────────────────────────────────────

  it('B1 — shows error when password is too short', async () => {
    renderRegister();

    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'jane@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Minimum 8 characters'), { target: { value: 'short' } }); // < 8 chars
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'short' } });
    fireEvent.change(screen.getByPlaceholderText('Company Name'), { target: { value: 'TestCo' } });
    fireEvent.change(screen.getByPlaceholderText('company@example.com'), { target: { value: 'company@test.com' } });

    fireEvent.click(screen.getByRole('button', { name: /Submit Registration/i }));

    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('B2 — shows error when passwords do not match', async () => {
    renderRegister();

    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'jane@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Minimum 8 characters'), { target: { value: 'Password1!' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'DifferentPass1!' } });
    fireEvent.change(screen.getByPlaceholderText('Company Name'), { target: { value: 'Co' } });
    fireEvent.change(screen.getByPlaceholderText('company@example.com'), { target: { value: 'co@test.com' } });

    fireEvent.click(screen.getByRole('button', { name: /Submit Registration/i }));

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('B3 — shows error when company name is missing', async () => {
    renderRegister();

    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'jane@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Minimum 8 characters'), { target: { value: 'Password1!' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'Password1!' } });
    // Leave company name blank
    fireEvent.change(screen.getByPlaceholderText('company@example.com'), { target: { value: 'co@test.com' } });

    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(screen.getByText(/Company name is required/i)).toBeInTheDocument();
    });
  });

  it('B4 — shows error when company email is missing', async () => {
    renderRegister();

    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'jane@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Minimum 8 characters'), { target: { value: 'Password1!' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'Password1!' } });
    fireEvent.change(screen.getByPlaceholderText('Company Name'), { target: { value: 'MyCo' } });
    // Leave company email blank

    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(screen.getByText(/Company email is required/i)).toBeInTheDocument();
    });
  });

  // ── C. Loading State ──────────────────────────────────────────────────────

  it('C1 — shows loading state while submitting', async () => {
    // Simulate a delayed API call
    (axios.post as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: { message: 'OK' } }), 500))
    );

    renderRegister();

    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'jane@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Minimum 8 characters'), { target: { value: 'Password1!' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'Password1!' } });
    fireEvent.change(screen.getByPlaceholderText('Company Name'), { target: { value: 'TestCo' } });
    fireEvent.change(screen.getByPlaceholderText('company@example.com'), { target: { value: 'co@test.com' } });

    fireEvent.click(screen.getByRole('button', { name: /Submit Registration/i }));

    expect(screen.getByRole('button', { name: /Submitting/i })).toBeDisabled();
  });

  // ── D. Success ────────────────────────────────────────────────────────────

  it('D1 — shows success message on successful registration', async () => {
    (axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { message: 'Submitted' } });

    renderRegister();

    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'jane@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Minimum 8 characters'), { target: { value: 'Password1!' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'Password1!' } });
    fireEvent.change(screen.getByPlaceholderText('Company Name'), { target: { value: 'TestCo' } });
    fireEvent.change(screen.getByPlaceholderText('company@example.com'), { target: { value: 'co@test.com' } });

    fireEvent.click(screen.getByRole('button', { name: /Submit Registration/i }));

    await waitFor(() => {
      expect(screen.getByText(/Registration submitted successfully/i)).toBeInTheDocument();
    });
  });

  // ── E. API Error ──────────────────────────────────────────────────────────

  it('E1 — shows API error message on registration failure', async () => {
    (axios.post as ReturnType<typeof vi.fn>).mockRejectedValue({
      response: { data: { error: 'Email already registered' } },
    });

    renderRegister();

    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'jane@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Minimum 8 characters'), { target: { value: 'Password1!' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'Password1!' } });
    fireEvent.change(screen.getByPlaceholderText('Company Name'), { target: { value: 'TestCo' } });
    fireEvent.change(screen.getByPlaceholderText('company@example.com'), { target: { value: 'co@test.com' } });

    fireEvent.click(screen.getByRole('button', { name: /Submit Registration/i }));

    await waitFor(() => {
      expect(screen.getByText(/Email already registered/i)).toBeInTheDocument();
    });
  });

  it('E2 — shows generic error message when API returns no specific message', async () => {
    (axios.post as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    renderRegister();

    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'jane@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Minimum 8 characters'), { target: { value: 'Password1!' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'Password1!' } });
    fireEvent.change(screen.getByPlaceholderText('Company Name'), { target: { value: 'TestCo' } });
    fireEvent.change(screen.getByPlaceholderText('company@example.com'), { target: { value: 'co@test.com' } });

    fireEvent.click(screen.getByRole('button', { name: /Submit Registration/i }));

    await waitFor(() => {
      expect(screen.getByText(/Registration failed/i)).toBeInTheDocument();
    });
  });
});
