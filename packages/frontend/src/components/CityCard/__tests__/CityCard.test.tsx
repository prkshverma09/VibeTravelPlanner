import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CityCard } from '../CityCard';
import { mockCities } from '@vibe-travel/shared';

describe('CityCard', () => {
  const mockCity = mockCities[0];
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('should display city name and country', () => {
    render(<CityCard city={mockCity} onClick={mockOnClick} />);

    expect(screen.getByText(mockCity.city)).toBeInTheDocument();
    expect(screen.getByText(mockCity.country)).toBeInTheDocument();
  });

  it('should display maximum 3 vibe tags', () => {
    const cityWithManyTags = {
      ...mockCity,
      vibe_tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    };

    render(<CityCard city={cityWithManyTags} onClick={mockOnClick} />);

    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    expect(screen.getByText('tag3')).toBeInTheDocument();
    expect(screen.queryByText('tag4')).not.toBeInTheDocument();
  });

  it('should display truncated description', () => {
    const cityWithLongDesc = {
      ...mockCity,
      description: 'A'.repeat(200),
    };

    render(<CityCard city={cityWithLongDesc} onClick={mockOnClick} />);

    const description = screen.getByTestId('city-description');
    expect(description.textContent?.length).toBeLessThan(160);
    expect(description.textContent).toContain('...');
  });

  it('should display culture and nightlife scores', () => {
    render(<CityCard city={mockCity} onClick={mockOnClick} />);

    expect(screen.getByText(/Culture:/)).toBeInTheDocument();
    expect(screen.getByText(/Nightlife:/)).toBeInTheDocument();
  });

  it('should display city image', () => {
    render(<CityCard city={mockCity} onClick={mockOnClick} />);

    const image = screen.getByRole('img', { name: new RegExp(mockCity.city) });
    expect(image).toHaveAttribute('alt', expect.stringContaining(mockCity.city));
  });

  it('should call onClick when clicked', () => {
    render(<CityCard city={mockCity} onClick={mockOnClick} />);

    fireEvent.click(screen.getByRole('article'));

    expect(mockOnClick).toHaveBeenCalledWith(mockCity);
  });

  it('should be accessible', () => {
    render(<CityCard city={mockCity} onClick={mockOnClick} />);

    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('aria-label', expect.stringContaining(mockCity.city));
  });

  it('should handle missing image gracefully', () => {
    const cityNoImage = { ...mockCity, image_url: '' };
    render(<CityCard city={cityNoImage} onClick={mockOnClick} />);

    const image = screen.getByRole('img', { name: new RegExp(mockCity.city) });
    expect(image).toHaveAttribute('src', expect.stringContaining('unsplash'));
  });

  it('should handle keyboard navigation', () => {
    render(<CityCard city={mockCity} onClick={mockOnClick} />);

    const card = screen.getByRole('article');
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(mockOnClick).toHaveBeenCalledWith(mockCity);
  });

  it('should display vibe tags container', () => {
    render(<CityCard city={mockCity} onClick={mockOnClick} />);

    expect(screen.getByTestId('vibe-tags')).toBeInTheDocument();
  });

  it('should display score badges container', () => {
    render(<CityCard city={mockCity} onClick={mockOnClick} />);

    expect(screen.getByTestId('score-badges')).toBeInTheDocument();
  });
});
