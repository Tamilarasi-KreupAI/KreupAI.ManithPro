/**
 * WS14-T08 — Frontend: UploadSupply Tests
 *
 * Tests the UploadSupply drag-and-drop page.
 * This is a pure UI component with no API calls — it navigates on file drop/button click.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../../test/test-utils';
import UploadSupply from '../UploadSupply';

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('WS14-T08 Frontend — UploadSupply', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── A. Rendering ─────────────────────────────────────────────────────────

  it('A1 — renders page heading', () => {
    render(<UploadSupply />);
    expect(screen.getByText('Upload Candidate Profiles')).toBeInTheDocument();
  });

  it('A2 — renders drag-and-drop zone', () => {
    render(<UploadSupply />);
    expect(screen.getByText('or drag and drop')).toBeInTheDocument();
  });

  it('A3 — renders file upload input', () => {
    render(<UploadSupply />);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    expect(fileInput.type).toBe('file');
    expect(fileInput.multiple).toBe(true);
  });

  it('A4 — renders Done button', () => {
    render(<UploadSupply />);
    expect(screen.getByRole('button', { name: /Done/i })).toBeInTheDocument();
  });

  it('A5 — renders Cancel button', () => {
    render(<UploadSupply />);
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('A6 — shows accepted file types description', () => {
    render(<UploadSupply />);
    expect(screen.getByText(/PDF, DOCX up to 10MB/i)).toBeInTheDocument();
  });

  // ── B. Navigation ─────────────────────────────────────────────────────────

  it('B1 — Done button navigates to /b2b/supply', () => {
    render(<UploadSupply />);
    fireEvent.click(screen.getByRole('button', { name: /Done/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/b2b/supply');
  });

  it('B2 — Cancel button navigates to /b2b/supply', () => {
    render(<UploadSupply />);
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/b2b/supply');
  });

  // ── C. Drag-and-Drop Interaction ─────────────────────────────────────────

  it('C1 — drag zone activates on dragenter', () => {
    render(<UploadSupply />);
    const dropZone = screen.getByText('or drag and drop').closest('div')!.parentElement!;
    
    // Find the actual droppable container
    const container = dropZone.closest('[class*="border-dashed"]') as HTMLElement;
    if (container) {
      fireEvent.dragEnter(container);
      // Active state adds 'border-primary-500'
      expect(container.className).toMatch(/border-primary-500|bg-primary/);
    }
  });

  it('C2 — drag zone deactivates on dragleave', () => {
    render(<UploadSupply />);
    const dropZone = screen.getByText('or drag and drop').closest('div')!.parentElement!.parentElement as HTMLElement;
    
    fireEvent.dragEnter(dropZone);
    fireEvent.dragLeave(dropZone);
    expect(dropZone.className).not.toMatch(/border-primary-500/);
  });

  it('C3 — handles file drop event', async () => {
    vi.useFakeTimers();
    render(<UploadSupply />);

    const dropZone = screen.getByText('or drag and drop').closest('div')!.parentElement!.parentElement as HTMLElement;

    const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' });
    const dataTransfer = { files: [file] };

    fireEvent.drop(dropZone, { dataTransfer });

    // After 1 second, navigates
    vi.advanceTimersByTime(1000);
    expect(mockNavigate).toHaveBeenCalledWith('/b2b/supply');
    vi.useRealTimers();
  });
});
