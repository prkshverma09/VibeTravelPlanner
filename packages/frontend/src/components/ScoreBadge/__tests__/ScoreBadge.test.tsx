import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreBadge } from '../ScoreBadge';

describe('ScoreBadge', () => {
  it('should display score value', () => {
    render(<ScoreBadge type="culture" score={8} />);
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('should display correct icon for culture', () => {
    render(<ScoreBadge type="culture" score={7} />);
    expect(screen.getByText('🎭')).toBeInTheDocument();
  });

  it('should display correct icon for nightlife', () => {
    render(<ScoreBadge type="nightlife" score={9} />);
    expect(screen.getByText('🌙')).toBeInTheDocument();
  });

  it('should display correct icon for nature', () => {
    render(<ScoreBadge type="nature" score={6} />);
    expect(screen.getByText('🌲')).toBeInTheDocument();
  });

  it('should display correct icon for beach', () => {
    render(<ScoreBadge type="beach" score={5} />);
    expect(screen.getByText('🏖️')).toBeInTheDocument();
  });

  it('should display correct icon for adventure', () => {
    render(<ScoreBadge type="adventure" score={8} />);
    expect(screen.getByText('🧗')).toBeInTheDocument();
  });

  it('should apply high score class for scores >= 8', () => {
    render(<ScoreBadge type="culture" score={9} />);
    const badge = screen.getByTestId('score-badge');
    expect(badge).toHaveClass('high');
  });

  it('should apply medium score class for scores 5-7', () => {
    render(<ScoreBadge type="culture" score={6} />);
    const badge = screen.getByTestId('score-badge');
    expect(badge).toHaveClass('medium');
  });

  it('should apply low score class for scores < 5', () => {
    render(<ScoreBadge type="culture" score={3} />);
    const badge = screen.getByTestId('score-badge');
    expect(badge).toHaveClass('low');
  });

  it('should display label by default', () => {
    render(<ScoreBadge type="culture" score={8} />);
    expect(screen.getByText('Culture:')).toBeInTheDocument();
  });

  it('should hide label when showLabel is false', () => {
    render(<ScoreBadge type="culture" score={8} showLabel={false} />);
    expect(screen.queryByText('Culture:')).not.toBeInTheDocument();
  });

  it('should have accessible role for icon', () => {
    render(<ScoreBadge type="nightlife" score={7} />);
    const icon = screen.getByRole('img', { name: 'nightlife' });
    expect(icon).toBeInTheDocument();
  });
});
