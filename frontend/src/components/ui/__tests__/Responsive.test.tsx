import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import {
  Show,
  Hide,
  Container,
  Grid,
  Stack,
  HStack,
  VStack,
  AspectRatio,
  Spacer,
  Divider,
  ResponsiveProvider,
  useResponsive,
  useBreakpoint,
  useBreakpointDown,
  useBreakpointBetween,
  useCurrentBreakpoint,
  useDeviceType,
  useMediaQuery,
  breakpoints,
} from '../Responsive';

// Mock matchMedia
const createMatchMedia = (width: number) => {
  return (query: string): MediaQueryList => {
    // Parse the min-width from the query
    const minWidthMatch = query.match(/min-width:\s*(\d+)px/);
    const maxWidthMatch = query.match(/max-width:\s*(\d+)px/);

    let matches = true;

    if (minWidthMatch) {
      const minWidth = parseInt(minWidthMatch[1], 10);
      matches = matches && width >= minWidth;
    }

    if (maxWidthMatch) {
      const maxWidth = parseInt(maxWidthMatch[1], 10);
      matches = matches && width <= maxWidth;
    }

    return {
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  };
};

describe('breakpoints', () => {
  it('defines all breakpoints', () => {
    expect(breakpoints.xs).toBe(0);
    expect(breakpoints.sm).toBe(640);
    expect(breakpoints.md).toBe(768);
    expect(breakpoints.lg).toBe(1024);
    expect(breakpoints.xl).toBe(1280);
    expect(breakpoints['2xl']).toBe(1536);
  });
});

describe('useMediaQuery', () => {
  beforeEach(() => {
    window.matchMedia = createMatchMedia(1024);
  });

  it('returns true when query matches', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(true);
  });

  it('returns false when query does not match', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 1280px)'));

    expect(result.current).toBe(false);
  });
});

describe('useBreakpoint', () => {
  it('returns true when at or above breakpoint', () => {
    window.matchMedia = createMatchMedia(1024);

    const { result } = renderHook(() => useBreakpoint('md'));

    expect(result.current).toBe(true);
  });

  it('returns false when below breakpoint', () => {
    window.matchMedia = createMatchMedia(600);

    const { result } = renderHook(() => useBreakpoint('md'));

    expect(result.current).toBe(false);
  });
});

describe('useBreakpointDown', () => {
  it('returns true when below breakpoint', () => {
    window.matchMedia = createMatchMedia(600);

    const { result } = renderHook(() => useBreakpointDown('md'));

    expect(result.current).toBe(true);
  });

  it('returns false when at or above breakpoint', () => {
    window.matchMedia = createMatchMedia(1024);

    const { result } = renderHook(() => useBreakpointDown('md'));

    expect(result.current).toBe(false);
  });
});

describe('useBreakpointBetween', () => {
  it('returns true when between breakpoints', () => {
    window.matchMedia = createMatchMedia(900);

    const { result } = renderHook(() => useBreakpointBetween('md', 'lg'));

    expect(result.current).toBe(true);
  });

  it('returns false when outside range', () => {
    window.matchMedia = createMatchMedia(1200);

    const { result } = renderHook(() => useBreakpointBetween('md', 'lg'));

    expect(result.current).toBe(false);
  });
});

describe('useCurrentBreakpoint', () => {
  it('returns xs for small screens', () => {
    window.matchMedia = createMatchMedia(400);

    const { result } = renderHook(() => useCurrentBreakpoint());

    expect(result.current).toBe('xs');
  });

  it('returns lg for large screens', () => {
    window.matchMedia = createMatchMedia(1100);

    const { result } = renderHook(() => useCurrentBreakpoint());

    expect(result.current).toBe('lg');
  });
});

describe('useDeviceType', () => {
  it('returns mobile for small screens', () => {
    window.matchMedia = createMatchMedia(400);

    const { result } = renderHook(() => useDeviceType());

    expect(result.current).toBe('mobile');
  });

  it('returns tablet for medium screens', () => {
    window.matchMedia = createMatchMedia(900);

    const { result } = renderHook(() => useDeviceType());

    expect(result.current).toBe('tablet');
  });

  it('returns desktop for large screens', () => {
    window.matchMedia = createMatchMedia(1200);

    const { result } = renderHook(() => useDeviceType());

    expect(result.current).toBe('desktop');
  });
});

describe('ResponsiveProvider', () => {
  beforeEach(() => {
    window.matchMedia = createMatchMedia(1024);
  });

  it('provides responsive context', () => {
    let context: ReturnType<typeof useResponsive> | null = null;

    function Consumer() {
      context = useResponsive();
      return null;
    }

    render(
      <ResponsiveProvider>
        <Consumer />
      </ResponsiveProvider>
    );

    expect(context).toBeDefined();
    expect(context?.breakpoint).toBeDefined();
    expect(context?.deviceType).toBeDefined();
  });

  it('throws when used outside provider', () => {
    function Consumer() {
      useResponsive();
      return null;
    }

    expect(() => render(<Consumer />)).toThrow(
      'useResponsive must be used within a ResponsiveProvider'
    );
  });
});

describe('Show', () => {
  beforeEach(() => {
    window.matchMedia = createMatchMedia(1024); // lg breakpoint
  });

  it('shows children by default', () => {
    render(<Show>Content</Show>);

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('shows children above specified breakpoint', () => {
    render(<Show above="md">Above MD</Show>);

    expect(screen.getByText('Above MD')).toBeInTheDocument();
  });

  it('hides children below specified breakpoint', () => {
    render(<Show above="xl">Above XL</Show>);

    expect(screen.queryByText('Above XL')).not.toBeInTheDocument();
  });

  it('shows children below specified breakpoint', () => {
    render(<Show below="xl">Below XL</Show>);

    expect(screen.getByText('Below XL')).toBeInTheDocument();
  });

  it('shows at specific breakpoint', () => {
    render(<Show at="lg">At LG</Show>);

    expect(screen.getByText('At LG')).toBeInTheDocument();
  });

  it('hides at different breakpoint', () => {
    render(<Show at="sm">At SM</Show>);

    expect(screen.queryByText('At SM')).not.toBeInTheDocument();
  });

  it('shows at multiple breakpoints', () => {
    render(<Show at={['md', 'lg']}>At MD or LG</Show>);

    expect(screen.getByText('At MD or LG')).toBeInTheDocument();
  });

  it('applies className when provided', () => {
    const { container } = render(
      <Show className="wrapper">Content</Show>
    );

    expect(container.querySelector('.wrapper')).toBeInTheDocument();
  });
});

describe('Hide', () => {
  beforeEach(() => {
    window.matchMedia = createMatchMedia(1024);
  });

  it('shows children by default', () => {
    render(<Hide>Content</Hide>);

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('hides children above specified breakpoint', () => {
    render(<Hide above="md">Hide Above MD</Hide>);

    expect(screen.queryByText('Hide Above MD')).not.toBeInTheDocument();
  });

  it('shows children below specified breakpoint', () => {
    render(<Hide above="xl">Hide Above XL</Hide>);

    expect(screen.getByText('Hide Above XL')).toBeInTheDocument();
  });

  it('hides at specific breakpoint', () => {
    render(<Hide at="lg">Hide At LG</Hide>);

    expect(screen.queryByText('Hide At LG')).not.toBeInTheDocument();
  });

  it('shows at different breakpoint', () => {
    render(<Hide at="sm">Hide At SM</Hide>);

    expect(screen.getByText('Hide At SM')).toBeInTheDocument();
  });
});

describe('Container', () => {
  it('renders children', () => {
    render(<Container>Content</Container>);

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies default max-width (xl)', () => {
    const { container } = render(<Container>Content</Container>);

    expect(container.firstChild).toHaveClass('max-w-screen-xl');
  });

  it('applies custom size', () => {
    const { container } = render(<Container size="md">Content</Container>);

    expect(container.firstChild).toHaveClass('max-w-screen-md');
  });

  it('centers by default', () => {
    const { container } = render(<Container>Content</Container>);

    expect(container.firstChild).toHaveClass('mx-auto');
  });

  it('does not center when disabled', () => {
    const { container } = render(<Container centered={false}>Content</Container>);

    expect(container.firstChild).not.toHaveClass('mx-auto');
  });

  it('applies padding by default', () => {
    const { container } = render(<Container>Content</Container>);

    expect(container.firstChild).toHaveClass('px-4');
  });

  it('removes padding when disabled', () => {
    const { container } = render(<Container padding={false}>Content</Container>);

    expect(container.firstChild).not.toHaveClass('px-4');
  });

  it('applies custom className', () => {
    const { container } = render(<Container className="custom">Content</Container>);

    expect(container.firstChild).toHaveClass('custom');
  });
});

describe('Grid', () => {
  it('renders children', () => {
    render(
      <Grid>
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('applies grid class', () => {
    const { container } = render(<Grid>Content</Grid>);

    expect(container.firstChild).toHaveClass('grid');
  });

  it('applies numeric columns', () => {
    const { container } = render(<Grid cols={3}>Content</Grid>);

    expect(container.firstChild).toHaveClass('grid-cols-3');
  });

  it('applies responsive columns', () => {
    const { container } = render(
      <Grid cols={{ xs: 1, sm: 2, md: 3, lg: 4 }}>Content</Grid>
    );

    expect(container.firstChild).toHaveClass('grid-cols-1');
    expect(container.firstChild).toHaveClass('sm:grid-cols-2');
    expect(container.firstChild).toHaveClass('md:grid-cols-3');
    expect(container.firstChild).toHaveClass('lg:grid-cols-4');
  });

  it('applies gap', () => {
    const { container } = render(<Grid gap={6}>Content</Grid>);

    expect(container.firstChild).toHaveClass('gap-6');
  });

  it('applies custom className', () => {
    const { container } = render(<Grid className="custom-grid">Content</Grid>);

    expect(container.firstChild).toHaveClass('custom-grid');
  });
});

describe('Stack', () => {
  it('renders children', () => {
    render(
      <Stack>
        <div>Item 1</div>
        <div>Item 2</div>
      </Stack>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('applies flex class', () => {
    const { container } = render(<Stack>Content</Stack>);

    expect(container.firstChild).toHaveClass('flex');
  });

  it('applies column direction by default', () => {
    const { container } = render(<Stack>Content</Stack>);

    expect(container.firstChild).toHaveClass('flex-col');
  });

  it('applies row direction', () => {
    const { container } = render(<Stack direction="row">Content</Stack>);

    expect(container.firstChild).toHaveClass('flex-row');
  });

  it('applies alignment', () => {
    const { container } = render(<Stack align="center">Content</Stack>);

    expect(container.firstChild).toHaveClass('items-center');
  });

  it('applies justification', () => {
    const { container } = render(<Stack justify="between">Content</Stack>);

    expect(container.firstChild).toHaveClass('justify-between');
  });

  it('applies wrap', () => {
    const { container } = render(<Stack wrap>Content</Stack>);

    expect(container.firstChild).toHaveClass('flex-wrap');
  });

  it('applies spacing', () => {
    const { container } = render(<Stack spacing={8}>Content</Stack>);

    expect(container.firstChild).toHaveClass('gap-8');
  });
});

describe('HStack', () => {
  it('renders as horizontal stack', () => {
    const { container } = render(<HStack>Content</HStack>);

    expect(container.firstChild).toHaveClass('flex-row');
  });

  it('passes through props', () => {
    const { container } = render(<HStack align="center" justify="between">Content</HStack>);

    expect(container.firstChild).toHaveClass('items-center');
    expect(container.firstChild).toHaveClass('justify-between');
  });
});

describe('VStack', () => {
  it('renders as vertical stack', () => {
    const { container } = render(<VStack>Content</VStack>);

    expect(container.firstChild).toHaveClass('flex-col');
  });

  it('passes through props', () => {
    const { container } = render(<VStack spacing={6}>Content</VStack>);

    expect(container.firstChild).toHaveClass('gap-6');
  });
});

describe('AspectRatio', () => {
  it('renders children', () => {
    render(
      <AspectRatio>
        <img src="" alt="test" />
      </AspectRatio>
    );

    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('applies 16:9 ratio by default', () => {
    const { container } = render(
      <AspectRatio>
        <div>Content</div>
      </AspectRatio>
    );

    // 16:9 = 56.25%
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.paddingBottom).toBe('56.25%');
  });

  it('applies 1:1 ratio', () => {
    const { container } = render(
      <AspectRatio ratio="1:1">
        <div>Content</div>
      </AspectRatio>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.paddingBottom).toBe('100%');
  });

  it('applies 4:3 ratio', () => {
    const { container } = render(
      <AspectRatio ratio="4:3">
        <div>Content</div>
      </AspectRatio>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.paddingBottom).toBe('75%');
  });

  it('applies custom numeric ratio', () => {
    const { container } = render(
      <AspectRatio ratio={2}>
        <div>Content</div>
      </AspectRatio>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.paddingBottom).toBe('50%');
  });

  it('applies custom className', () => {
    const { container } = render(
      <AspectRatio className="custom-aspect">
        <div>Content</div>
      </AspectRatio>
    );

    expect(container.firstChild).toHaveClass('custom-aspect');
  });
});

describe('Spacer', () => {
  it('renders vertical spacer by default', () => {
    const { container } = render(<Spacer />);

    expect(container.firstChild).toHaveClass('w-full');
  });

  it('renders horizontal spacer', () => {
    const { container } = render(<Spacer axis="horizontal" />);

    expect(container.firstChild).toHaveClass('shrink-0');
  });

  it('applies size as pixels', () => {
    const { container } = render(<Spacer size={8} />);

    const spacer = container.firstChild as HTMLElement;
    expect(spacer.style.height).toBe('2rem'); // 8 * 0.25rem
  });

  it('applies custom size string', () => {
    const { container } = render(<Spacer size="20px" />);

    const spacer = container.firstChild as HTMLElement;
    expect(spacer.style.height).toBe('20px');
  });

  it('is hidden from screen readers', () => {
    const { container } = render(<Spacer />);

    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies custom className', () => {
    const { container } = render(<Spacer className="custom-spacer" />);

    expect(container.firstChild).toHaveClass('custom-spacer');
  });
});

describe('Divider', () => {
  it('renders horizontal divider by default', () => {
    render(<Divider />);

    const divider = screen.getByRole('separator');
    expect(divider.tagName).toBe('HR');
  });

  it('renders vertical divider', () => {
    render(<Divider orientation="vertical" />);

    const divider = screen.getByRole('separator');
    expect(divider).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('applies solid variant by default', () => {
    const { container } = render(<Divider />);

    expect(container.firstChild).toHaveClass('border-solid');
  });

  it('applies dashed variant', () => {
    const { container } = render(<Divider variant="dashed" />);

    expect(container.firstChild).toHaveClass('border-dashed');
  });

  it('applies dotted variant', () => {
    const { container } = render(<Divider variant="dotted" />);

    expect(container.firstChild).toHaveClass('border-dotted');
  });

  it('applies custom className', () => {
    const { container } = render(<Divider className="custom-divider" />);

    expect(container.firstChild).toHaveClass('custom-divider');
  });
});
