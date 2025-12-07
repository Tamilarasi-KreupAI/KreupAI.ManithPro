import {
  ReactNode,
  useState,
  useEffect,
  useRef,
  CSSProperties,
  createContext,
  useContext,
} from 'react';
import { cn } from '../../utils/cn';
import { usePrefersReducedMotion } from './Accessibility';

// ============================================================
// ANIMATION CONTEXT (for reduced motion)
// ============================================================

interface AnimationContextValue {
  reducedMotion: boolean;
  duration: number;
}

const AnimationContext = createContext<AnimationContextValue>({
  reducedMotion: false,
  duration: 300,
});

export function useAnimation() {
  return useContext(AnimationContext);
}

export interface AnimationProviderProps {
  children: ReactNode;
  defaultDuration?: number;
}

function AnimationProvider({
  children,
  defaultDuration = 300,
}: AnimationProviderProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <AnimationContext.Provider
      value={{
        reducedMotion: prefersReducedMotion,
        duration: prefersReducedMotion ? 0 : defaultDuration,
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
}

// ============================================================
// FADE
// ============================================================

export interface FadeProps {
  children: ReactNode;
  show?: boolean;
  duration?: number;
  delay?: number;
  className?: string;
  onExited?: () => void;
}

function Fade({
  children,
  show = true,
  duration = 300,
  delay = 0,
  className,
  onExited,
}: FadeProps) {
  const { reducedMotion } = useAnimation();
  const [render, setRender] = useState(show);
  const [isVisible, setIsVisible] = useState(false);

  const actualDuration = reducedMotion ? 0 : duration;

  useEffect(() => {
    if (show) {
      setRender(true);
      const timer = setTimeout(() => setIsVisible(true), delay + 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setRender(false);
        onExited?.();
      }, actualDuration);
      return () => clearTimeout(timer);
    }
  }, [show, actualDuration, delay, onExited]);

  if (!render) return null;

  return (
    <div
      className={cn('transition-opacity', className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transitionDuration: `${actualDuration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================
// SLIDE
// ============================================================

type SlideDirection = 'up' | 'down' | 'left' | 'right';

export interface SlideProps {
  children: ReactNode;
  show?: boolean;
  direction?: SlideDirection;
  distance?: number | string;
  duration?: number;
  delay?: number;
  fade?: boolean;
  className?: string;
  onExited?: () => void;
}

function Slide({
  children,
  show = true,
  direction = 'up',
  distance = 20,
  duration = 300,
  delay = 0,
  fade = true,
  className,
  onExited,
}: SlideProps) {
  const { reducedMotion } = useAnimation();
  const [render, setRender] = useState(show);
  const [isVisible, setIsVisible] = useState(false);

  const actualDuration = reducedMotion ? 0 : duration;
  const actualDistance = typeof distance === 'number' ? `${distance}px` : distance;

  const getTransform = (visible: boolean): string => {
    if (visible || reducedMotion) return 'translate(0, 0)';

    const transforms: Record<SlideDirection, string> = {
      up: `translateY(${actualDistance})`,
      down: `translateY(-${actualDistance})`,
      left: `translateX(${actualDistance})`,
      right: `translateX(-${actualDistance})`,
    };

    return transforms[direction];
  };

  useEffect(() => {
    if (show) {
      setRender(true);
      const timer = setTimeout(() => setIsVisible(true), delay + 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setRender(false);
        onExited?.();
      }, actualDuration);
      return () => clearTimeout(timer);
    }
  }, [show, actualDuration, delay, onExited]);

  if (!render) return null;

  return (
    <div
      className={cn('transition-all', className)}
      style={{
        transform: getTransform(isVisible),
        opacity: fade ? (isVisible ? 1 : 0) : 1,
        transitionDuration: `${actualDuration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </div>
  );
}

// ============================================================
// SCALE
// ============================================================

export interface ScaleProps {
  children: ReactNode;
  show?: boolean;
  initialScale?: number;
  duration?: number;
  delay?: number;
  fade?: boolean;
  className?: string;
  onExited?: () => void;
}

function Scale({
  children,
  show = true,
  initialScale = 0.95,
  duration = 200,
  delay = 0,
  fade = true,
  className,
  onExited,
}: ScaleProps) {
  const { reducedMotion } = useAnimation();
  const [render, setRender] = useState(show);
  const [isVisible, setIsVisible] = useState(false);

  const actualDuration = reducedMotion ? 0 : duration;

  useEffect(() => {
    if (show) {
      setRender(true);
      const timer = setTimeout(() => setIsVisible(true), delay + 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setRender(false);
        onExited?.();
      }, actualDuration);
      return () => clearTimeout(timer);
    }
  }, [show, actualDuration, delay, onExited]);

  if (!render) return null;

  return (
    <div
      className={cn('transition-all', className)}
      style={{
        transform: isVisible || reducedMotion ? 'scale(1)' : `scale(${initialScale})`,
        opacity: fade ? (isVisible ? 1 : 0) : 1,
        transitionDuration: `${actualDuration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </div>
  );
}

// ============================================================
// COLLAPSE
// ============================================================

export interface CollapseProps {
  children: ReactNode;
  show?: boolean;
  duration?: number;
  className?: string;
  onExited?: () => void;
}

function Collapse({
  children,
  show = true,
  duration = 300,
  className,
  onExited,
}: CollapseProps) {
  const { reducedMotion } = useAnimation();
  const [render, setRender] = useState(show);
  const [height, setHeight] = useState<number | 'auto'>(show ? 'auto' : 0);
  const contentRef = useRef<HTMLDivElement>(null);

  const actualDuration = reducedMotion ? 0 : duration;

  useEffect(() => {
    if (show) {
      setRender(true);
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        setHeight(contentHeight);
        // Set to auto after animation completes
        const timer = setTimeout(() => setHeight('auto'), actualDuration);
        return () => clearTimeout(timer);
      }
    } else {
      if (contentRef.current) {
        // First set to actual height, then to 0
        setHeight(contentRef.current.scrollHeight);
        requestAnimationFrame(() => {
          setHeight(0);
        });
      }
      const timer = setTimeout(() => {
        setRender(false);
        onExited?.();
      }, actualDuration);
      return () => clearTimeout(timer);
    }
  }, [show, actualDuration, onExited]);

  if (!render) return null;

  return (
    <div
      className={cn('overflow-hidden transition-all', className)}
      style={{
        height: height === 'auto' ? 'auto' : `${height}px`,
        transitionDuration: `${actualDuration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
}

// ============================================================
// STAGGER CHILDREN
// ============================================================

export interface StaggerProps {
  children: ReactNode[];
  show?: boolean;
  staggerDelay?: number;
  duration?: number;
  animation?: 'fade' | 'slide' | 'scale';
  direction?: SlideDirection;
  className?: string;
  childClassName?: string;
}

function Stagger({
  children,
  show = true,
  staggerDelay = 50,
  duration = 300,
  animation = 'fade',
  direction = 'up',
  className,
  childClassName,
}: StaggerProps) {
  const { reducedMotion } = useAnimation();

  if (reducedMotion) {
    return (
      <div className={className}>
        {children.map((child, i) => (
          <div key={i} className={childClassName}>
            {show ? child : null}
          </div>
        ))}
      </div>
    );
  }

  const AnimationComponent = animation === 'slide' ? Slide : animation === 'scale' ? Scale : Fade;

  return (
    <div className={className}>
      {children.map((child, index) => (
        <AnimationComponent
          key={index}
          show={show}
          delay={index * staggerDelay}
          duration={duration}
          direction={animation === 'slide' ? direction : undefined}
          className={childClassName}
        >
          {child}
        </AnimationComponent>
      ))}
    </div>
  );
}

// ============================================================
// ANIMATE ON SCROLL (Intersection Observer)
// ============================================================

export interface AnimateOnScrollProps {
  children: ReactNode;
  animation?: 'fade' | 'slide' | 'scale';
  direction?: SlideDirection;
  duration?: number;
  delay?: number;
  threshold?: number;
  once?: boolean;
  className?: string;
}

function AnimateOnScroll({
  children,
  animation = 'fade',
  direction = 'up',
  duration = 500,
  delay = 0,
  threshold = 0.1,
  once = true,
  className,
}: AnimateOnScrollProps) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useAnimation();

  useEffect(() => {
    if (reducedMotion) {
      setIsInView(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, once, reducedMotion]);

  const AnimationComponent = animation === 'slide' ? Slide : animation === 'scale' ? Scale : Fade;

  return (
    <div ref={ref} className={className}>
      <AnimationComponent
        show={isInView}
        duration={duration}
        delay={delay}
        direction={animation === 'slide' ? direction : undefined}
      >
        {children}
      </AnimationComponent>
    </div>
  );
}

// ============================================================
// PULSE
// ============================================================

export interface PulseProps {
  children: ReactNode;
  active?: boolean;
  duration?: number;
  className?: string;
}

function Pulse({
  children,
  active = true,
  duration = 2000,
  className,
}: PulseProps) {
  const { reducedMotion } = useAnimation();

  if (reducedMotion || !active) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={cn('animate-pulse', className)}
      style={{
        animationDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================
// SHAKE
// ============================================================

export interface ShakeProps {
  children: ReactNode;
  active?: boolean;
  intensity?: 'light' | 'medium' | 'strong';
  duration?: number;
  className?: string;
}

function Shake({
  children,
  active = false,
  intensity = 'medium',
  duration = 500,
  className,
}: ShakeProps) {
  const { reducedMotion } = useAnimation();
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (active && !reducedMotion) {
      setShaking(true);
      const timer = setTimeout(() => setShaking(false), duration);
      return () => clearTimeout(timer);
    }
  }, [active, duration, reducedMotion]);

  const intensities = {
    light: 'animate-[shake_0.5s_ease-in-out]',
    medium: 'animate-[shake_0.5s_ease-in-out]',
    strong: 'animate-[shake_0.5s_ease-in-out]',
  };

  return (
    <div
      className={cn(shaking && intensities[intensity], className)}
      style={{
        animationDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================
// TRANSITION GROUP (for list animations)
// ============================================================

export interface TransitionGroupProps<T> {
  items: T[];
  keyExtractor: (item: T) => string | number;
  renderItem: (item: T, index: number) => ReactNode;
  animation?: 'fade' | 'slide' | 'scale';
  direction?: SlideDirection;
  duration?: number;
  staggerDelay?: number;
  className?: string;
  itemClassName?: string;
}

function TransitionGroup<T>({
  items,
  keyExtractor,
  renderItem,
  animation = 'fade',
  direction = 'up',
  duration = 300,
  staggerDelay = 50,
  className,
  itemClassName,
}: TransitionGroupProps<T>) {
  const { reducedMotion } = useAnimation();
  const previousItems = useRef<T[]>([]);
  const [displayItems, setDisplayItems] = useState<
    Array<{ item: T; state: 'entering' | 'entered' | 'exiting' }>
  >([]);

  useEffect(() => {
    const prevKeys = new Set(previousItems.current.map(keyExtractor));
    const currentKeys = new Set(items.map(keyExtractor));

    // Items that are entering
    const entering = items
      .filter((item) => !prevKeys.has(keyExtractor(item)))
      .map((item) => ({ item, state: 'entering' as const }));

    // Items that remain
    const remaining = items
      .filter((item) => prevKeys.has(keyExtractor(item)))
      .map((item) => ({ item, state: 'entered' as const }));

    // Items that are exiting
    const exiting = previousItems.current
      .filter((item) => !currentKeys.has(keyExtractor(item)))
      .map((item) => ({ item, state: 'exiting' as const }));

    setDisplayItems([...entering, ...remaining, ...exiting]);
    previousItems.current = items;

    // Remove exiting items after animation
    if (exiting.length > 0 && !reducedMotion) {
      const timer = setTimeout(() => {
        setDisplayItems((prev) =>
          prev.filter((entry) => entry.state !== 'exiting')
        );
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [items, keyExtractor, duration, reducedMotion]);

  const AnimationComponent = animation === 'slide' ? Slide : animation === 'scale' ? Scale : Fade;

  return (
    <div className={className}>
      {displayItems.map((entry, index) => (
        <AnimationComponent
          key={keyExtractor(entry.item)}
          show={entry.state !== 'exiting'}
          duration={duration}
          delay={entry.state === 'entering' ? index * staggerDelay : 0}
          direction={animation === 'slide' ? direction : undefined}
          className={itemClassName}
        >
          {renderItem(entry.item, index)}
        </AnimationComponent>
      ))}
    </div>
  );
}

// ============================================================
// CSS KEYFRAMES (for use in tailwind config or styled components)
// ============================================================

export const keyframes = {
  fadeIn: {
    from: { opacity: '0' },
    to: { opacity: '1' },
  },
  fadeOut: {
    from: { opacity: '1' },
    to: { opacity: '0' },
  },
  slideInUp: {
    from: { transform: 'translateY(20px)', opacity: '0' },
    to: { transform: 'translateY(0)', opacity: '1' },
  },
  slideInDown: {
    from: { transform: 'translateY(-20px)', opacity: '0' },
    to: { transform: 'translateY(0)', opacity: '1' },
  },
  slideInLeft: {
    from: { transform: 'translateX(-20px)', opacity: '0' },
    to: { transform: 'translateX(0)', opacity: '1' },
  },
  slideInRight: {
    from: { transform: 'translateX(20px)', opacity: '0' },
    to: { transform: 'translateX(0)', opacity: '1' },
  },
  scaleIn: {
    from: { transform: 'scale(0.95)', opacity: '0' },
    to: { transform: 'scale(1)', opacity: '1' },
  },
  shake: {
    '0%, 100%': { transform: 'translateX(0)' },
    '25%': { transform: 'translateX(-5px)' },
    '75%': { transform: 'translateX(5px)' },
  },
  bounce: {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-10px)' },
  },
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  ping: {
    '75%, 100%': { transform: 'scale(2)', opacity: '0' },
  },
  pulse: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.5' },
  },
};

export {
  AnimationProvider,
  Fade,
  Slide,
  Scale,
  Collapse,
  Stagger,
  AnimateOnScroll,
  Pulse,
  Shake,
  TransitionGroup,
};
