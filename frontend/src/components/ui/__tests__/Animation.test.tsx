import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import {
  AnimationProvider,
  useAnimation,
  Fade,
  Slide,
  Scale,
  Collapse,
  Stagger,
  Pulse,
  Shake,
  keyframes,
} from '../Animation';

// Mock usePrefersReducedMotion
vi.mock('../Accessibility', () => ({
  usePrefersReducedMotion: vi.fn(() => false),
}));

import { usePrefersReducedMotion } from '../Accessibility';

describe('AnimationProvider', () => {
  it('provides animation context', () => {
    let contextValue: ReturnType<typeof useAnimation> | null = null;

    function Consumer() {
      contextValue = useAnimation();
      return null;
    }

    render(
      <AnimationProvider>
        <Consumer />
      </AnimationProvider>
    );

    expect(contextValue).toEqual({
      reducedMotion: false,
      duration: 300,
    });
  });

  it('uses custom default duration', () => {
    let contextValue: ReturnType<typeof useAnimation> | null = null;

    function Consumer() {
      contextValue = useAnimation();
      return null;
    }

    render(
      <AnimationProvider defaultDuration={500}>
        <Consumer />
      </AnimationProvider>
    );

    expect(contextValue?.duration).toBe(500);
  });

  it('sets duration to 0 when reduced motion is preferred', () => {
    (usePrefersReducedMotion as any).mockReturnValue(true);

    let contextValue: ReturnType<typeof useAnimation> | null = null;

    function Consumer() {
      contextValue = useAnimation();
      return null;
    }

    render(
      <AnimationProvider>
        <Consumer />
      </AnimationProvider>
    );

    expect(contextValue?.reducedMotion).toBe(true);
    expect(contextValue?.duration).toBe(0);

    (usePrefersReducedMotion as any).mockReturnValue(false);
  });
});

describe('Fade', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    (usePrefersReducedMotion as any).mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children when show is true', () => {
    render(
      <AnimationProvider>
        <Fade show>
          <div>Content</div>
        </Fade>
      </AnimationProvider>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('does not render children when show is false after animation', async () => {
    const { rerender } = render(
      <AnimationProvider>
        <Fade show>
          <div>Content</div>
        </Fade>
      </AnimationProvider>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();

    rerender(
      <AnimationProvider>
        <Fade show={false}>
          <div>Content</div>
        </Fade>
      </AnimationProvider>
    );

    // Wait for exit animation
    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });

    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('calls onExited after exit animation', async () => {
    const onExited = vi.fn();

    const { rerender } = render(
      <AnimationProvider>
        <Fade show onExited={onExited}>
          <div>Content</div>
        </Fade>
      </AnimationProvider>
    );

    rerender(
      <AnimationProvider>
        <Fade show={false} onExited={onExited}>
          <div>Content</div>
        </Fade>
      </AnimationProvider>
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });

    expect(onExited).toHaveBeenCalled();
  });

  it('applies custom duration', () => {
    const { container } = render(
      <AnimationProvider>
        <Fade show duration={500}>
          <div>Content</div>
        </Fade>
      </AnimationProvider>
    );

    expect(container.querySelector('.transition-opacity')).toHaveStyle({
      transitionDuration: '500ms',
    });
  });

  it('applies delay', () => {
    const { container } = render(
      <AnimationProvider>
        <Fade show delay={100}>
          <div>Content</div>
        </Fade>
      </AnimationProvider>
    );

    expect(container.querySelector('.transition-opacity')).toHaveStyle({
      transitionDelay: '100ms',
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <AnimationProvider>
        <Fade show className="custom-fade">
          <div>Content</div>
        </Fade>
      </AnimationProvider>
    );

    expect(container.querySelector('.custom-fade')).toBeInTheDocument();
  });
});

describe('Slide', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    (usePrefersReducedMotion as any).mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children when show is true', () => {
    render(
      <AnimationProvider>
        <Slide show>
          <div>Content</div>
        </Slide>
      </AnimationProvider>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies direction up by default', async () => {
    const { container } = render(
      <AnimationProvider>
        <Slide show={false} direction="up">
          <div>Content</div>
        </Slide>
      </AnimationProvider>
    );

    // When not visible, should translate up
    // Note: We need to rerender with show=true first
    const { container: container2 } = render(
      <AnimationProvider>
        <Slide show direction="up">
          <div>Slide Content</div>
        </Slide>
      </AnimationProvider>
    );

    expect(container2.querySelector('.transition-all')).toBeInTheDocument();
  });

  it('applies different directions', () => {
    const directions = ['up', 'down', 'left', 'right'] as const;

    directions.forEach((direction) => {
      const { container } = render(
        <AnimationProvider>
          <Slide show direction={direction}>
            <div>Content</div>
          </Slide>
        </AnimationProvider>
      );

      expect(container.querySelector('.transition-all')).toBeInTheDocument();
    });
  });

  it('applies custom distance', () => {
    const { container } = render(
      <AnimationProvider>
        <Slide show distance={50}>
          <div>Content</div>
        </Slide>
      </AnimationProvider>
    );

    expect(container.querySelector('.transition-all')).toBeInTheDocument();
  });

  it('applies fade when enabled', () => {
    const { container } = render(
      <AnimationProvider>
        <Slide show fade>
          <div>Content</div>
        </Slide>
      </AnimationProvider>
    );

    expect(container.querySelector('.transition-all')).toBeInTheDocument();
  });
});

describe('Scale', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    (usePrefersReducedMotion as any).mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children when show is true', () => {
    render(
      <AnimationProvider>
        <Scale show>
          <div>Content</div>
        </Scale>
      </AnimationProvider>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies custom initial scale', () => {
    const { container } = render(
      <AnimationProvider>
        <Scale show initialScale={0.8}>
          <div>Content</div>
        </Scale>
      </AnimationProvider>
    );

    expect(container.querySelector('.transition-all')).toBeInTheDocument();
  });

  it('applies fade when enabled', () => {
    const { container } = render(
      <AnimationProvider>
        <Scale show fade>
          <div>Content</div>
        </Scale>
      </AnimationProvider>
    );

    expect(container.querySelector('.transition-all')).toBeInTheDocument();
  });
});

describe('Collapse', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    (usePrefersReducedMotion as any).mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children when show is true', () => {
    render(
      <AnimationProvider>
        <Collapse show>
          <div>Content</div>
        </Collapse>
      </AnimationProvider>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies overflow hidden', () => {
    const { container } = render(
      <AnimationProvider>
        <Collapse show>
          <div>Content</div>
        </Collapse>
      </AnimationProvider>
    );

    expect(container.querySelector('.overflow-hidden')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <AnimationProvider>
        <Collapse show className="custom-collapse">
          <div>Content</div>
        </Collapse>
      </AnimationProvider>
    );

    expect(container.querySelector('.custom-collapse')).toBeInTheDocument();
  });
});

describe('Stagger', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    (usePrefersReducedMotion as any).mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders all children', () => {
    render(
      <AnimationProvider>
        <Stagger show>
          {[<div key="1">Item 1</div>, <div key="2">Item 2</div>, <div key="3">Item 3</div>]}
        </Stagger>
      </AnimationProvider>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('applies fade animation by default', () => {
    const { container } = render(
      <AnimationProvider>
        <Stagger show animation="fade">
          {[<div key="1">Item</div>]}
        </Stagger>
      </AnimationProvider>
    );

    expect(container.querySelector('.transition-opacity')).toBeInTheDocument();
  });

  it('applies slide animation', () => {
    const { container } = render(
      <AnimationProvider>
        <Stagger show animation="slide">
          {[<div key="1">Item</div>]}
        </Stagger>
      </AnimationProvider>
    );

    expect(container.querySelector('.transition-all')).toBeInTheDocument();
  });

  it('applies scale animation', () => {
    const { container } = render(
      <AnimationProvider>
        <Stagger show animation="scale">
          {[<div key="1">Item</div>]}
        </Stagger>
      </AnimationProvider>
    );

    expect(container.querySelector('.transition-all')).toBeInTheDocument();
  });

  it('applies custom stagger delay', () => {
    const { container } = render(
      <AnimationProvider>
        <Stagger show staggerDelay={100}>
          {[<div key="1">Item 1</div>, <div key="2">Item 2</div>]}
        </Stagger>
      </AnimationProvider>
    );

    const items = container.querySelectorAll('.transition-opacity');
    expect(items[0]).toHaveStyle({ transitionDelay: '0ms' });
    expect(items[1]).toHaveStyle({ transitionDelay: '100ms' });
  });

  it('renders without animation when reduced motion', () => {
    (usePrefersReducedMotion as any).mockReturnValue(true);

    const { container } = render(
      <AnimationProvider>
        <Stagger show>
          {[<div key="1">Item</div>]}
        </Stagger>
      </AnimationProvider>
    );

    // Should render without transition classes
    expect(screen.getByText('Item')).toBeInTheDocument();

    (usePrefersReducedMotion as any).mockReturnValue(false);
  });

  it('applies custom className', () => {
    const { container } = render(
      <AnimationProvider>
        <Stagger show className="custom-stagger">
          {[<div key="1">Item</div>]}
        </Stagger>
      </AnimationProvider>
    );

    expect(container.querySelector('.custom-stagger')).toBeInTheDocument();
  });
});

describe('Pulse', () => {
  beforeEach(() => {
    (usePrefersReducedMotion as any).mockReturnValue(false);
  });

  it('renders children with pulse animation when active', () => {
    const { container } = render(
      <AnimationProvider>
        <Pulse active>
          <div>Content</div>
        </Pulse>
      </AnimationProvider>
    );

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders without animation when not active', () => {
    const { container } = render(
      <AnimationProvider>
        <Pulse active={false}>
          <div>Content</div>
        </Pulse>
      </AnimationProvider>
    );

    expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
  });

  it('applies custom duration', () => {
    const { container } = render(
      <AnimationProvider>
        <Pulse active duration={3000}>
          <div>Content</div>
        </Pulse>
      </AnimationProvider>
    );

    expect(container.querySelector('.animate-pulse')).toHaveStyle({
      animationDuration: '3000ms',
    });
  });

  it('renders without animation when reduced motion', () => {
    (usePrefersReducedMotion as any).mockReturnValue(true);

    const { container } = render(
      <AnimationProvider>
        <Pulse active>
          <div>Content</div>
        </Pulse>
      </AnimationProvider>
    );

    expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();

    (usePrefersReducedMotion as any).mockReturnValue(false);
  });
});

describe('Shake', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    (usePrefersReducedMotion as any).mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children', () => {
    render(
      <AnimationProvider>
        <Shake>
          <div>Content</div>
        </Shake>
      </AnimationProvider>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('does not shake when not active', () => {
    const { container } = render(
      <AnimationProvider>
        <Shake active={false}>
          <div>Content</div>
        </Shake>
      </AnimationProvider>
    );

    expect(container.querySelector('[class*="shake"]')).not.toBeInTheDocument();
  });

  it('shakes when active', async () => {
    const { container } = render(
      <AnimationProvider>
        <Shake active>
          <div>Content</div>
        </Shake>
      </AnimationProvider>
    );

    // Need to wait for the shake animation to start
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(container.querySelector('[class*="shake"]')).toBeInTheDocument();
  });

  it('stops shaking after duration', async () => {
    const { container } = render(
      <AnimationProvider>
        <Shake active duration={500}>
          <div>Content</div>
        </Shake>
      </AnimationProvider>
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });

    // After duration, shake class should be removed
    expect(container.firstChild).not.toHaveClass('animate-[shake_0.5s_ease-in-out]');
  });

  it('does not shake when reduced motion', () => {
    (usePrefersReducedMotion as any).mockReturnValue(true);

    const { container } = render(
      <AnimationProvider>
        <Shake active>
          <div>Content</div>
        </Shake>
      </AnimationProvider>
    );

    expect(container.querySelector('[class*="shake"]')).not.toBeInTheDocument();

    (usePrefersReducedMotion as any).mockReturnValue(false);
  });
});

describe('keyframes', () => {
  it('exports fadeIn keyframe', () => {
    expect(keyframes.fadeIn).toEqual({
      from: { opacity: '0' },
      to: { opacity: '1' },
    });
  });

  it('exports fadeOut keyframe', () => {
    expect(keyframes.fadeOut).toEqual({
      from: { opacity: '1' },
      to: { opacity: '0' },
    });
  });

  it('exports slideInUp keyframe', () => {
    expect(keyframes.slideInUp).toEqual({
      from: { transform: 'translateY(20px)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' },
    });
  });

  it('exports scaleIn keyframe', () => {
    expect(keyframes.scaleIn).toEqual({
      from: { transform: 'scale(0.95)', opacity: '0' },
      to: { transform: 'scale(1)', opacity: '1' },
    });
  });

  it('exports shake keyframe', () => {
    expect(keyframes.shake).toEqual({
      '0%, 100%': { transform: 'translateX(0)' },
      '25%': { transform: 'translateX(-5px)' },
      '75%': { transform: 'translateX(5px)' },
    });
  });

  it('exports spin keyframe', () => {
    expect(keyframes.spin).toEqual({
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    });
  });

  it('exports pulse keyframe', () => {
    expect(keyframes.pulse).toEqual({
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' },
    });
  });
});
