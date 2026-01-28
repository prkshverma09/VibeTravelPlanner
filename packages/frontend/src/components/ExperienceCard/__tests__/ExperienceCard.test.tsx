import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExperienceCard } from '../ExperienceCard';
import type { AlgoliaExperience } from '@vibe-travel/shared';

const mockExperience: AlgoliaExperience = {
  objectID: 'sunrise-temple-tour',
  name: 'Sunrise Temple Tour',
  category: 'cultural',
  description: 'Watch the sun rise over ancient temples with an expert local guide who shares hidden history and photography spots',
  vibe_tags: ['spiritual', 'photogenic', 'peaceful'],
  city_ids: ['siem-reap-cambodia', 'bagan-myanmar'],
  duration_hours: 4,
  price_tier: 'mid-range',
  best_season: ['november', 'december', 'january'],
  min_travelers: 1,
  max_travelers: 8,
  physical_level: 'moderate',
  highlights: ['Sunrise photography', 'Hidden temples', 'Local breakfast'],
  what_to_bring: ['Camera', 'Sun hat'],
  image_url: 'https://example.com/temple.jpg'
};

describe('ExperienceCard', () => {
  it('should render experience name', () => {
    render(<ExperienceCard experience={mockExperience} />);
    expect(screen.getByText('Sunrise Temple Tour')).toBeInTheDocument();
  });

  it('should render category badge', () => {
    render(<ExperienceCard experience={mockExperience} />);
    expect(screen.getByText(/cultural/i)).toBeInTheDocument();
  });

  it('should render description', () => {
    render(<ExperienceCard experience={mockExperience} />);
    expect(screen.getByText(/Watch the sun rise/)).toBeInTheDocument();
  });

  it('should render vibe tags', () => {
    render(<ExperienceCard experience={mockExperience} />);
    expect(screen.getByText('spiritual')).toBeInTheDocument();
    expect(screen.getByText('photogenic')).toBeInTheDocument();
  });

  it('should render duration', () => {
    render(<ExperienceCard experience={mockExperience} />);
    expect(screen.getByText(/4 hours/i)).toBeInTheDocument();
  });

  it('should render price tier', () => {
    render(<ExperienceCard experience={mockExperience} />);
    expect(screen.getByText(/mid-range/i)).toBeInTheDocument();
  });

  it('should render physical level', () => {
    render(<ExperienceCard experience={mockExperience} />);
    expect(screen.getByText(/moderate/i)).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<ExperienceCard experience={mockExperience} onClick={handleClick} />);

    const card = screen.getByRole('article');
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledWith(mockExperience);
  });

  it('should be keyboard accessible', () => {
    const handleClick = vi.fn();
    render(<ExperienceCard experience={mockExperience} onClick={handleClick} />);

    const card = screen.getByRole('article');
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(handleClick).toHaveBeenCalled();
  });

  it('should show number of cities available', () => {
    render(<ExperienceCard experience={mockExperience} />);
    expect(screen.getByText(/2 cities/i)).toBeInTheDocument();
  });
});
