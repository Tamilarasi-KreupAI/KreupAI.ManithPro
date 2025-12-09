import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook, act } from '@testing-library/react';
import {
  VisuallyHidden,
  SkipLink,
  FocusTrap,
  LiveRegion,
  AnnouncerProvider,
  useAnnouncer,
  KeyboardNavigation,
  SrOnly,
  FocusRing,
  RovingTabIndex,
  DescribedBy,
  usePrefersReducedMotion,
  usePrefersHighContrast,
  usePrefersColorScheme,
  useId,
  getFocusableElements,
} from '../Accessibility';

describe('VisuallyHidden', () => {
  it('renders children', () => {
    render(<VisuallyHidden>Hidden text</VisuallyHidden>);

    expect(screen.getByText('Hidden text')).toBeInTheDocument();
  });

  it('applies visually hidden styles', () => {
    const { container } = render(<VisuallyHidden>Hidden</VisuallyHidden>);

    expect(container.firstChild).toHaveClass('absolute');
    expect(container.firstChild).toHaveClass('w-px');
    expect(container.firstChild).toHaveClass('h-px');
    expect(container.firstChild).toHaveClass('overflow-hidden');
  });

  it('renders as span by default', () => {
    const { container } = render(<VisuallyHidden>Text</VisuallyHidden>);

    expect(container.querySelector('span')).toBeInTheDocument();
  });

  it('renders as div when specified', () => {
    const { container } = render(<VisuallyHidden as="div">Text</VisuallyHidden>);

    expect(container.querySelector('div.absolute')).toBeInTheDocument();
  });
});

describe('SkipLink', () => {
  it('renders with default content', () => {
    render(<SkipLink />);

    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
  });

  it('renders with custom content', () => {
    render(<SkipLink>Jump to navigation</SkipLink>);

    expect(screen.getByText('Jump to navigation')).toBeInTheDocument();
  });

  it('links to main content by default', () => {
    render(<SkipLink />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '#main-content');
  });

  it('links to custom target', () => {
    render(<SkipLink href="#navigation" />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '#navigation');
  });

  it('applies focus styles', () => {
    const { container } = render(<SkipLink />);

    expect(container.querySelector('a')).toHaveClass('focus:translate-y-0');
  });

  it('applies custom className', () => {
    const { container } = render(<SkipLink className="custom-skip" />);

    expect(container.firstChild).toHaveClass('custom-skip');
  });
});

describe('FocusTrap', () => {
  it('renders children', () => {
    render(
      <FocusTrap>
        <button>Button 1</button>
        <button>Button 2</button>
      </FocusTrap>
    );

    expect(screen.getByRole('button', { name: 'Button 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Button 2' })).toBeInTheDocument();
  });

  it('focuses first focusable element on mount', async () => {
    render(
      <FocusTrap active initialFocus>
        <button>First</button>
        <button>Second</button>
      </FocusTrap>
    );

    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
  });

  it('does not trap focus when not active', () => {
    render(
      <FocusTrap active={false}>
        <button>Button</button>
      </FocusTrap>
    );

    expect(screen.getByRole('button')).not.toHaveFocus();
  });

  it('traps focus within container', async () => {
    render(
      <FocusTrap active>
        <button>First</button>
        <button>Last</button>
      </FocusTrap>
    );

    const first = screen.getByRole('button', { name: 'First' });
    const last = screen.getByRole('button', { name: 'Last' });

    // Focus last button
    last.focus();

    // Tab should go back to first
    await userEvent.tab();
    expect(first).toHaveFocus();
  });

  it('applies custom className', () => {
    const { container } = render(
      <FocusTrap className="custom-trap">
        <button>Button</button>
      </FocusTrap>
    );

    expect(container.firstChild).toHaveClass('custom-trap');
  });
});

describe('LiveRegion', () => {
  it('renders children', () => {
    render(<LiveRegion>Status message</LiveRegion>);

    expect(screen.getByText('Status message')).toBeInTheDocument();
  });

  it('has role status', () => {
    render(<LiveRegion>Message</LiveRegion>);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('uses polite by default', () => {
    render(<LiveRegion>Message</LiveRegion>);

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('uses assertive when specified', () => {
    render(<LiveRegion politeness="assertive">Urgent message</LiveRegion>);

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'assertive');
  });

  it('sets atomic attribute', () => {
    render(<LiveRegion atomic>Message</LiveRegion>);

    expect(screen.getByRole('status')).toHaveAttribute('aria-atomic', 'true');
  });

  it('sets relevant attribute', () => {
    render(<LiveRegion relevant="all">Message</LiveRegion>);

    expect(screen.getByRole('status')).toHaveAttribute('aria-relevant', 'all');
  });

  it('is visually hidden by default', () => {
    render(<LiveRegion>Message</LiveRegion>);

    expect(screen.getByRole('status')).toHaveClass('sr-only');
  });
});

describe('AnnouncerProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('provides announce function', () => {
    let announcer: ReturnType<typeof useAnnouncer> | null = null;

    function Consumer() {
      announcer = useAnnouncer();
      return null;
    }

    render(
      <AnnouncerProvider>
        <Consumer />
      </AnnouncerProvider>
    );

    expect(announcer?.announce).toBeDefined();
  });

  it('announces polite message', async () => {
    function Consumer() {
      const { announce } = useAnnouncer();
      return <button onClick={() => announce('Polite message')}>Announce</button>;
    }

    render(
      <AnnouncerProvider>
        <Consumer />
      </AnnouncerProvider>
    );

    await userEvent.click(screen.getByRole('button'));

    // Wait for announcement delay
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(screen.getByText('Polite message')).toBeInTheDocument();
  });

  it('announces assertive message', async () => {
    function Consumer() {
      const { announce } = useAnnouncer();
      return <button onClick={() => announce('Urgent!', 'assertive')}>Announce</button>;
    }

    render(
      <AnnouncerProvider>
        <Consumer />
      </AnnouncerProvider>
    );

    await userEvent.click(screen.getByRole('button'));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(screen.getByText('Urgent!')).toBeInTheDocument();
  });

  it('throws when used outside provider', () => {
    function Consumer() {
      useAnnouncer();
      return null;
    }

    expect(() => render(<Consumer />)).toThrow(
      'useAnnouncer must be used within an AnnouncerProvider'
    );
  });
});

describe('KeyboardNavigation', () => {
  it('renders children', () => {
    render(
      <KeyboardNavigation>
        <button>Item 1</button>
        <button>Item 2</button>
      </KeyboardNavigation>
    );

    expect(screen.getByRole('button', { name: 'Item 1' })).toBeInTheDocument();
  });

  it('has listbox role', () => {
    render(
      <KeyboardNavigation>
        <button>Item</button>
      </KeyboardNavigation>
    );

    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('navigates with arrow keys (vertical)', async () => {
    render(
      <KeyboardNavigation orientation="vertical">
        <button>First</button>
        <button>Second</button>
      </KeyboardNavigation>
    );

    const first = screen.getByRole('button', { name: 'First' });
    first.focus();

    await userEvent.keyboard('{ArrowDown}');

    expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();
  });

  it('navigates with arrow keys (horizontal)', async () => {
    render(
      <KeyboardNavigation orientation="horizontal">
        <button>First</button>
        <button>Second</button>
      </KeyboardNavigation>
    );

    const first = screen.getByRole('button', { name: 'First' });
    first.focus();

    await userEvent.keyboard('{ArrowRight}');

    expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();
  });

  it('calls onSelect on Enter', async () => {
    const onSelect = vi.fn();
    render(
      <KeyboardNavigation onSelect={onSelect}>
        <button>First</button>
        <button>Second</button>
      </KeyboardNavigation>
    );

    const first = screen.getByRole('button', { name: 'First' });
    first.focus();

    await userEvent.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledWith(0);
  });

  it('loops navigation when enabled', async () => {
    render(
      <KeyboardNavigation loop>
        <button>First</button>
        <button>Last</button>
      </KeyboardNavigation>
    );

    const last = screen.getByRole('button', { name: 'Last' });
    last.focus();

    await userEvent.keyboard('{ArrowDown}');

    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
  });

  it('applies custom className', () => {
    const { container } = render(
      <KeyboardNavigation className="custom-nav">
        <button>Item</button>
      </KeyboardNavigation>
    );

    expect(container.firstChild).toHaveClass('custom-nav');
  });
});

describe('SrOnly', () => {
  it('renders children', () => {
    render(<SrOnly>Screen reader text</SrOnly>);

    expect(screen.getByText('Screen reader text')).toBeInTheDocument();
  });

  it('applies screen reader only styles', () => {
    const { container } = render(<SrOnly>Text</SrOnly>);

    expect(container.firstChild).toHaveClass('absolute');
    expect(container.firstChild).toHaveClass('w-px');
    expect(container.firstChild).toHaveClass('h-px');
    expect(container.firstChild).toHaveClass('overflow-hidden');
  });

  it('becomes visible on focus when focusable', () => {
    const { container } = render(<SrOnly focusable>Focusable text</SrOnly>);

    expect(container.firstChild).toHaveClass('focus:static');
    expect(container.firstChild).toHaveClass('focus:w-auto');
  });
});

describe('FocusRing', () => {
  it('renders children', () => {
    render(
      <FocusRing>
        <button>Button</button>
      </FocusRing>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('applies focus-within styles', () => {
    const { container } = render(
      <FocusRing>
        <button>Button</button>
      </FocusRing>
    );

    expect(container.firstChild).toHaveClass('focus-within:outline-none');
  });

  it('applies custom className', () => {
    const { container } = render(
      <FocusRing className="custom-ring">
        <button>Button</button>
      </FocusRing>
    );

    expect(container.firstChild).toHaveClass('custom-ring');
  });
});

describe('RovingTabIndex', () => {
  it('renders children', () => {
    render(
      <RovingTabIndex>
        <button>Tab 1</button>
        <button>Tab 2</button>
      </RovingTabIndex>
    );

    expect(screen.getByRole('button', { name: 'Tab 1' })).toBeInTheDocument();
  });

  it('has tablist role', () => {
    render(
      <RovingTabIndex>
        <button>Tab</button>
      </RovingTabIndex>
    );

    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('sets orientation', () => {
    render(
      <RovingTabIndex orientation="vertical">
        <button>Tab</button>
      </RovingTabIndex>
    );

    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('calls onChange on navigation', async () => {
    const onChange = vi.fn();
    render(
      <RovingTabIndex activeIndex={0} onChange={onChange}>
        <button>First</button>
        <button>Second</button>
      </RovingTabIndex>
    );

    const first = screen.getByRole('button', { name: 'First' });
    first.focus();

    await userEvent.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenCalledWith(1);
  });
});

describe('DescribedBy', () => {
  it('renders children with id', () => {
    render(<DescribedBy id="desc-1">Description text</DescribedBy>);

    const element = screen.getByText('Description text');
    expect(element).toHaveAttribute('id', 'desc-1');
  });

  it('is visually hidden', () => {
    render(<DescribedBy id="desc">Text</DescribedBy>);

    expect(screen.getByText('Text')).toHaveClass('sr-only');
  });
});

describe('usePrefersReducedMotion', () => {
  it('returns false by default', () => {
    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(false);
  });

  it('responds to media query changes', () => {
    const mockMatchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes('reduce'),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    window.matchMedia = mockMatchMedia;

    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(true);
  });
});

describe('usePrefersHighContrast', () => {
  it('returns false by default', () => {
    const mockMatchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    window.matchMedia = mockMatchMedia;

    const { result } = renderHook(() => usePrefersHighContrast());

    expect(result.current).toBe(false);
  });
});

describe('usePrefersColorScheme', () => {
  it('returns light by default', () => {
    const mockMatchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    window.matchMedia = mockMatchMedia;

    const { result } = renderHook(() => usePrefersColorScheme());

    expect(result.current).toBe('light');
  });

  it('returns dark when preferred', () => {
    const mockMatchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes('dark'),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    window.matchMedia = mockMatchMedia;

    const { result } = renderHook(() => usePrefersColorScheme());

    expect(result.current).toBe('dark');
  });
});

describe('useId', () => {
  it('generates unique ID', () => {
    const { result: result1 } = renderHook(() => useId());
    const { result: result2 } = renderHook(() => useId());

    expect(result1.current).not.toBe(result2.current);
  });

  it('uses custom prefix', () => {
    const { result } = renderHook(() => useId('custom'));

    expect(result.current).toMatch(/^custom-\d+$/);
  });

  it('returns stable ID across rerenders', () => {
    const { result, rerender } = renderHook(() => useId());

    const firstId = result.current;
    rerender();

    expect(result.current).toBe(firstId);
  });
});

describe('getFocusableElements', () => {
  it('returns focusable elements', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <button>Button</button>
      <input type="text" />
      <a href="#">Link</a>
      <select><option>Option</option></select>
      <textarea></textarea>
    `;
    document.body.appendChild(container);

    const elements = getFocusableElements(container);

    expect(elements.length).toBe(5);

    document.body.removeChild(container);
  });

  it('excludes disabled elements', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <button>Enabled</button>
      <button disabled>Disabled</button>
    `;
    document.body.appendChild(container);

    const elements = getFocusableElements(container);

    expect(elements.length).toBe(1);
    expect(elements[0].textContent).toBe('Enabled');

    document.body.removeChild(container);
  });

  it('excludes elements with tabindex -1', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <button>Focusable</button>
      <button tabindex="-1">Not focusable</button>
    `;
    document.body.appendChild(container);

    const elements = getFocusableElements(container);

    expect(elements.length).toBe(1);

    document.body.removeChild(container);
  });
});
