import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VibeTag } from '../VibeTag';

describe('VibeTag', () => {
  it('should display tag text', () => {
    render(<VibeTag>romantic</VibeTag>);
    expect(screen.getByText('romantic')).toBeInTheDocument();
  });

  it('should apply primary variant class by default', () => {
    render(<VibeTag>modern</VibeTag>);
    const tag = screen.getByText('modern');
    expect(tag).toHaveClass('bg-purple-100');
    expect(tag).toHaveClass('text-purple-700');
  });

  it('should apply primary variant class when specified', () => {
    render(<VibeTag variant="primary">modern</VibeTag>);
    const tag = screen.getByText('modern');
    expect(tag).toHaveClass('bg-purple-100');
  });

  it('should apply secondary variant class', () => {
    render(<VibeTag variant="secondary">coastal</VibeTag>);
    const tag = screen.getByText('coastal');
    expect(tag).toHaveClass('bg-blue-100');
    expect(tag).toHaveClass('text-blue-700');
  });

  it('should apply accent variant class', () => {
    render(<VibeTag variant="accent">vibrant</VibeTag>);
    const tag = screen.getByText('vibrant');
    expect(tag).toHaveClass('bg-pink-100');
    expect(tag).toHaveClass('text-pink-700');
  });

  it('should apply default variant class', () => {
    render(<VibeTag variant="default">classic</VibeTag>);
    const tag = screen.getByText('classic');
    expect(tag).toHaveClass('bg-gray-100');
    expect(tag).toHaveClass('text-gray-700');
  });

  it('should render long tag names', () => {
    const longTag = 'supercalifragilisticexpialidocious';
    render(<VibeTag>{longTag}</VibeTag>);
    const tag = screen.getByText(longTag);
    expect(tag).toBeInTheDocument();
  });

  it('should have correct base styles', () => {
    render(<VibeTag>test</VibeTag>);
    const tag = screen.getByText('test');
    expect(tag.className).toMatch(/vibeTag/);
  });

  it('should apply additional className if provided', () => {
    render(<VibeTag className="extra-class">styled</VibeTag>);
    const tag = screen.getByText('styled');
    expect(tag).toHaveClass('extra-class');
  });
});
