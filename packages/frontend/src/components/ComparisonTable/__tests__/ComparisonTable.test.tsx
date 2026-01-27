import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComparisonTable } from '../ComparisonTable';
import { mockCities } from '@vibe-travel/shared';

describe('ComparisonTable', () => {
  const defaultProps = {
    cities: [mockCities[0], mockCities[1]],
  };

  it('should render comparison table', () => {
    render(<ComparisonTable {...defaultProps} />);
    expect(screen.getByTestId('comparison-table')).toBeInTheDocument();
  });

  it('should display city names in headers', () => {
    render(<ComparisonTable {...defaultProps} />);
    expect(screen.getByText('Tokyo')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
  });

  it('should display country names', () => {
    render(<ComparisonTable {...defaultProps} />);
    expect(screen.getByText('Japan')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
  });

  it('should display comparison attributes', () => {
    render(<ComparisonTable {...defaultProps} />);
    expect(screen.getByText('Culture')).toBeInTheDocument();
    expect(screen.getByText('Nightlife')).toBeInTheDocument();
    expect(screen.getByText('Beach')).toBeInTheDocument();
  });

  it('should highlight highest scores', () => {
    render(<ComparisonTable {...defaultProps} />);
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('should display vibe tags for each city', () => {
    render(<ComparisonTable {...defaultProps} />);
    expect(screen.getByText('neon')).toBeInTheDocument();
    expect(screen.getByText('romantic')).toBeInTheDocument();
  });

  it('should show recommendation when provided', () => {
    render(
      <ComparisonTable
        {...defaultProps}
        recommendation="Tokyo excels in nightlife, Paris excels in culture."
      />
    );
    expect(screen.getByText(/Tokyo excels in nightlife/)).toBeInTheDocument();
  });

  it('should not show recommendation section when not provided', () => {
    render(<ComparisonTable {...defaultProps} />);
    expect(screen.queryByText('Recommendation:')).not.toBeInTheDocument();
  });

  it('should call onSelect when select button is clicked', () => {
    const onSelect = vi.fn();
    render(<ComparisonTable {...defaultProps} onSelect={onSelect} />);

    const selectButtons = screen.getAllByRole('button', { name: /choose/i });
    fireEvent.click(selectButtons[0]);

    expect(onSelect).toHaveBeenCalledWith(mockCities[0]);
  });

  it('should show select buttons when onSelect is provided', () => {
    const onSelect = vi.fn();
    render(<ComparisonTable {...defaultProps} onSelect={onSelect} />);

    expect(screen.getByRole('button', { name: /choose tokyo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /choose paris/i })).toBeInTheDocument();
  });

  it('should not show select buttons when onSelect is not provided', () => {
    render(<ComparisonTable {...defaultProps} />);
    expect(screen.queryByRole('button', { name: /choose/i })).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<ComparisonTable {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should show close button when onClose is provided', () => {
    const onClose = vi.fn();
    render(<ComparisonTable {...defaultProps} onClose={onClose} />);
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('should only show focus attributes when provided', () => {
    render(
      <ComparisonTable
        {...defaultProps}
        focusAttributes={['culture_score', 'beach_score']}
      />
    );
    expect(screen.getByText('Culture')).toBeInTheDocument();
    expect(screen.getByText('Beach')).toBeInTheDocument();
    expect(screen.queryByText('Adventure')).not.toBeInTheDocument();
  });

  it('should compare up to 4 cities', () => {
    const fourCities = mockCities.slice(0, 4);
    render(<ComparisonTable cities={fourCities} />);

    expect(screen.getByText('Tokyo')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Cape Town')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
  });

  it('should have accessible table structure', () => {
    render(<ComparisonTable {...defaultProps} />);
    
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    
    const columnHeaders = screen.getAllByRole('columnheader');
    expect(columnHeaders.length).toBeGreaterThan(0);
  });
});
