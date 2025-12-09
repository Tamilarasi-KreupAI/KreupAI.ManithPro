import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../Card';

describe('Card', () => {
  describe('basic rendering', () => {
    it('renders children', () => {
      render(<Card>Card content</Card>);

      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('applies default variant styles', () => {
      const { container } = render(<Card>Content</Card>);

      expect(container.firstChild).toHaveClass('rounded-xl');
      expect(container.firstChild).toHaveClass('bg-white');
    });

    it('accepts custom className', () => {
      const { container } = render(<Card className="custom-class">Content</Card>);

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('passes through HTML attributes', () => {
      render(<Card data-testid="test-card" role="article">Content</Card>);

      expect(screen.getByTestId('test-card')).toBeInTheDocument();
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('forwards ref', () => {
      const ref = { current: null };
      render(<Card ref={ref}>Content</Card>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('variants', () => {
    it('applies default variant', () => {
      const { container } = render(<Card variant="default">Content</Card>);

      expect(container.firstChild).toHaveClass('border');
    });

    it('applies elevated variant', () => {
      const { container } = render(<Card variant="elevated">Content</Card>);

      expect(container.firstChild).toHaveClass('shadow-soft-md');
    });

    it('applies outlined variant', () => {
      const { container } = render(<Card variant="outlined">Content</Card>);

      expect(container.firstChild).toHaveClass('border-2');
    });

    it('applies filled variant', () => {
      const { container } = render(<Card variant="filled">Content</Card>);

      expect(container.firstChild).toHaveClass('bg-gray-50');
    });

    it('applies ghost variant', () => {
      const { container } = render(<Card variant="ghost">Content</Card>);

      expect(container.firstChild).toHaveClass('bg-transparent');
    });

    it('applies gradient variant', () => {
      const { container } = render(<Card variant="gradient">Content</Card>);

      expect(container.firstChild).toHaveClass('bg-gradient-to-br');
    });

    it('applies interactive variant', () => {
      const { container } = render(<Card variant="interactive">Content</Card>);

      expect(container.firstChild).toHaveClass('cursor-pointer');
    });
  });

  describe('padding', () => {
    it('applies no padding', () => {
      const { container } = render(<Card padding="none">Content</Card>);

      expect(container.firstChild).toHaveClass('p-0');
    });

    it('applies xs padding', () => {
      const { container } = render(<Card padding="xs">Content</Card>);

      expect(container.firstChild).toHaveClass('p-2');
    });

    it('applies sm padding', () => {
      const { container } = render(<Card padding="sm">Content</Card>);

      expect(container.firstChild).toHaveClass('p-4');
    });

    it('applies md padding (default)', () => {
      const { container } = render(<Card padding="md">Content</Card>);

      expect(container.firstChild).toHaveClass('p-6');
    });

    it('applies lg padding', () => {
      const { container } = render(<Card padding="lg">Content</Card>);

      expect(container.firstChild).toHaveClass('p-8');
    });

    it('applies xl padding', () => {
      const { container } = render(<Card padding="xl">Content</Card>);

      expect(container.firstChild).toHaveClass('p-10');
    });
  });
});

describe('CardHeader', () => {
  it('renders children', () => {
    render(<CardHeader>Header content</CardHeader>);

    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('applies default styles', () => {
    const { container } = render(<CardHeader>Header</CardHeader>);

    expect(container.firstChild).toHaveClass('flex');
    expect(container.firstChild).toHaveClass('flex-col');
    expect(container.firstChild).toHaveClass('pb-4');
  });

  it('accepts custom className', () => {
    const { container } = render(<CardHeader className="custom">Header</CardHeader>);

    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref', () => {
    const ref = { current: null };
    render(<CardHeader ref={ref}>Header</CardHeader>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardTitle', () => {
  it('renders as h3', () => {
    render(<CardTitle>Title</CardTitle>);

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Title');
  });

  it('applies default styles', () => {
    const { container } = render(<CardTitle>Title</CardTitle>);

    expect(container.firstChild).toHaveClass('text-lg');
    expect(container.firstChild).toHaveClass('font-semibold');
  });

  it('accepts custom className', () => {
    const { container } = render(<CardTitle className="custom-title">Title</CardTitle>);

    expect(container.firstChild).toHaveClass('custom-title');
  });

  it('forwards ref', () => {
    const ref = { current: null };
    render(<CardTitle ref={ref}>Title</CardTitle>);

    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
  });
});

describe('CardDescription', () => {
  it('renders paragraph', () => {
    render(<CardDescription>Description text</CardDescription>);

    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  it('applies default styles', () => {
    const { container } = render(<CardDescription>Description</CardDescription>);

    expect(container.firstChild).toHaveClass('text-sm');
    expect(container.firstChild).toHaveClass('text-gray-500');
  });

  it('accepts custom className', () => {
    const { container } = render(
      <CardDescription className="custom-desc">Description</CardDescription>
    );

    expect(container.firstChild).toHaveClass('custom-desc');
  });

  it('forwards ref', () => {
    const ref = { current: null };
    render(<CardDescription ref={ref}>Description</CardDescription>);

    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });
});

describe('CardContent', () => {
  it('renders children', () => {
    render(<CardContent>Main content</CardContent>);

    expect(screen.getByText('Main content')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(
      <CardContent className="custom-content">Content</CardContent>
    );

    expect(container.firstChild).toHaveClass('custom-content');
  });

  it('forwards ref', () => {
    const ref = { current: null };
    render(<CardContent ref={ref}>Content</CardContent>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardFooter', () => {
  it('renders children', () => {
    render(<CardFooter>Footer content</CardFooter>);

    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('applies default styles', () => {
    const { container } = render(<CardFooter>Footer</CardFooter>);

    expect(container.firstChild).toHaveClass('flex');
    expect(container.firstChild).toHaveClass('items-center');
    expect(container.firstChild).toHaveClass('pt-4');
    expect(container.firstChild).toHaveClass('border-t');
  });

  it('accepts custom className', () => {
    const { container } = render(<CardFooter className="custom-footer">Footer</CardFooter>);

    expect(container.firstChild).toHaveClass('custom-footer');
  });

  it('forwards ref', () => {
    const ref = { current: null };
    render(<CardFooter ref={ref}>Footer</CardFooter>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('Card composition', () => {
  it('composes all card parts correctly', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
          <CardDescription>A test card description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card body content</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Card');
    expect(screen.getByText('A test card description')).toBeInTheDocument();
    expect(screen.getByText('Card body content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });
});
