import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CityDetailLoading from '../loading';
import CityDetailError from '../error';
import CityNotFound from '../not-found';

describe('City Detail Page', () => {
  describe('Loading State', () => {
    it('should render loading skeleton', () => {
      render(<CityDetailLoading />);
      const pulsingElements = document.querySelectorAll('.animate-pulse');
      expect(pulsingElements.length).toBeGreaterThan(0);
    });

    it('should have main element', () => {
      render(<CityDetailLoading />);
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    const mockReset = vi.fn();
    const mockError = new Error('Test error message');

    beforeEach(() => {
      mockReset.mockClear();
    });

    it('should render error message', () => {
      render(<CityDetailError error={mockError} reset={mockReset} />);
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    });

    it('should have retry button', () => {
      render(<CityDetailError error={mockError} reset={mockReset} />);
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should have go back link', () => {
      render(<CityDetailError error={mockError} reset={mockReset} />);
      expect(screen.getByRole('link', { name: /go back home/i })).toBeInTheDocument();
    });

    it('should call reset when retry button clicked', () => {
      render(<CityDetailError error={mockError} reset={mockReset} />);
      screen.getByRole('button', { name: /try again/i }).click();
      expect(mockReset).toHaveBeenCalled();
    });
  });

  describe('Not Found State', () => {
    it('should render not found message', () => {
      render(<CityNotFound />);
      expect(screen.getByText(/Destination Not Found/)).toBeInTheDocument();
    });

    it('should have link back to home', () => {
      render(<CityNotFound />);
      const link = screen.getByRole('link', { name: /discover destinations/i });
      expect(link).toHaveAttribute('href', '/');
    });

    it('should have emoji icon', () => {
      render(<CityNotFound />);
      expect(screen.getByText('🗺️')).toBeInTheDocument();
    });
  });
});
