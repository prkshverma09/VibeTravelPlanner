import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoadingSkeleton } from '../LoadingSkeleton';
import { ErrorBoundary } from '../ErrorBoundary';
import { ErrorMessage } from '../ErrorMessage';

describe('LoadingSkeleton', () => {
  it('should render skeleton elements', () => {
    render(<LoadingSkeleton />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should have animated pulse class', () => {
    render(<LoadingSkeleton />);
    const skeleton = screen.getByTestId('loading-skeleton');
    const pulsingElements = skeleton.querySelectorAll('.animate-pulse');
    expect(pulsingElements.length).toBeGreaterThan(0);
  });

  it('should render multiple skeletons when count is provided', () => {
    render(<LoadingSkeleton count={3} />);
    const skeleton = screen.getByTestId('loading-skeleton');
    const children = skeleton.children;
    expect(children.length).toBe(3);
  });

  it('should render card variant by default', () => {
    render(<LoadingSkeleton />);
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton.querySelector('.bg-white')).toBeInTheDocument();
  });

  it('should render text variant', () => {
    render(<LoadingSkeleton variant="text" />);
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton.querySelector('.space-y-2')).toBeInTheDocument();
  });

  it('should render avatar variant', () => {
    render(<LoadingSkeleton variant="avatar" />);
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton.querySelector('.rounded-full')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<LoadingSkeleton className="custom-class" />);
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveClass('custom-class');
  });
});

describe('ErrorBoundary', () => {
  const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>Normal content</div>;
  };

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should catch errors and display fallback', () => {
    render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error occurred')).toBeInTheDocument();
  });

  it('should render children when no error', () => {
    render(
      <ErrorBoundary fallback={<div>Error</div>}>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('should render default fallback when no custom fallback provided', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    const onError = vi.fn();
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
  });
});

describe('ErrorMessage', () => {
  it('should display error message', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should display default title', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Error');
  });

  it('should display custom title', () => {
    render(<ErrorMessage message="Details" title="Custom Error" />);
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
  });

  it('should have retry button when onRetry provided', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Error" onRetry={onRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should call onRetry when retry button clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Error" onRetry={onRetry} />);
    
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    
    expect(onRetry).toHaveBeenCalled();
  });

  it('should not show retry button when onRetry not provided', () => {
    render(<ErrorMessage message="Error" />);
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });

  it('should have error-message test id', () => {
    render(<ErrorMessage message="Test" />);
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<ErrorMessage message="Test" className="custom-class" />);
    const errorMessage = screen.getByTestId('error-message');
    expect(errorMessage).toHaveClass('custom-class');
  });
});
