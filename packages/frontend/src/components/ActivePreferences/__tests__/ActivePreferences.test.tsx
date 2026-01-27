import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivePreferences } from '../ActivePreferences';
import { TripProvider, useTripContext } from '../../../context/TripContext';
import { useEffect } from 'react';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TripProvider>{children}</TripProvider>
);

function PreferenceSeeder({ preferences }: { preferences: Array<{ category: string; value: string; priority: string }> }) {
  const { dispatch } = useTripContext();
  
  useEffect(() => {
    preferences.forEach((pref) => {
      dispatch({
        type: 'ADD_PREFERENCE',
        payload: {
          category: pref.category as any,
          value: pref.value,
          priority: pref.priority as any,
        },
      });
    });
  }, [dispatch, preferences]);

  return <ActivePreferences />;
}

describe('ActivePreferences', () => {
  it('should not render when no preferences exist', () => {
    render(
      <TestWrapper>
        <ActivePreferences />
      </TestWrapper>
    );

    expect(screen.queryByTestId('active-preferences')).not.toBeInTheDocument();
  });

  it('should render when preferences exist', () => {
    const preferences = [
      { category: 'vibe', value: 'romantic', priority: 'must_have' },
    ];

    render(
      <TestWrapper>
        <PreferenceSeeder preferences={preferences} />
      </TestWrapper>
    );

    expect(screen.getByTestId('active-preferences')).toBeInTheDocument();
  });

  it('should display preference values', () => {
    const preferences = [
      { category: 'vibe', value: 'romantic', priority: 'must_have' },
      { category: 'geography', value: 'Europe', priority: 'nice_to_have' },
    ];

    render(
      <TestWrapper>
        <PreferenceSeeder preferences={preferences} />
      </TestWrapper>
    );

    expect(screen.getByText('romantic')).toBeInTheDocument();
    expect(screen.getByText('Europe')).toBeInTheDocument();
  });

  it('should show category icons', () => {
    const preferences = [
      { category: 'vibe', value: 'romantic', priority: 'must_have' },
    ];

    render(
      <TestWrapper>
        <PreferenceSeeder preferences={preferences} />
      </TestWrapper>
    );

    expect(screen.getByText('✨')).toBeInTheDocument();
  });

  it('should have remove buttons for each preference', () => {
    const preferences = [
      { category: 'vibe', value: 'romantic', priority: 'must_have' },
      { category: 'geography', value: 'Europe', priority: 'nice_to_have' },
    ];

    render(
      <TestWrapper>
        <PreferenceSeeder preferences={preferences} />
      </TestWrapper>
    );

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    expect(removeButtons).toHaveLength(2);
  });

  it('should have clear all button', () => {
    const preferences = [
      { category: 'vibe', value: 'romantic', priority: 'must_have' },
    ];

    render(
      <TestWrapper>
        <PreferenceSeeder preferences={preferences} />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
  });

  it('should remove preference when remove button is clicked', () => {
    const preferences = [
      { category: 'vibe', value: 'romantic', priority: 'must_have' },
      { category: 'geography', value: 'Europe', priority: 'nice_to_have' },
    ];

    render(
      <TestWrapper>
        <PreferenceSeeder preferences={preferences} />
      </TestWrapper>
    );

    expect(screen.getByText('romantic')).toBeInTheDocument();

    const removeButton = screen.getByRole('button', { name: /remove romantic/i });
    fireEvent.click(removeButton);

    expect(screen.queryByText('romantic')).not.toBeInTheDocument();
    expect(screen.getByText('Europe')).toBeInTheDocument();
  });

  it('should clear all preferences when clear all is clicked', () => {
    const preferences = [
      { category: 'vibe', value: 'romantic', priority: 'must_have' },
      { category: 'geography', value: 'Europe', priority: 'nice_to_have' },
    ];

    render(
      <TestWrapper>
        <PreferenceSeeder preferences={preferences} />
      </TestWrapper>
    );

    expect(screen.getByText('romantic')).toBeInTheDocument();
    expect(screen.getByText('Europe')).toBeInTheDocument();

    const clearAllButton = screen.getByRole('button', { name: /clear all/i });
    fireEvent.click(clearAllButton);

    expect(screen.queryByTestId('active-preferences')).not.toBeInTheDocument();
  });

  it('should display title "Active Filters"', () => {
    const preferences = [
      { category: 'vibe', value: 'romantic', priority: 'must_have' },
    ];

    render(
      <TestWrapper>
        <PreferenceSeeder preferences={preferences} />
      </TestWrapper>
    );

    expect(screen.getByText('Active Filters')).toBeInTheDocument();
  });

  it('should have accessible structure', () => {
    const preferences = [
      { category: 'vibe', value: 'romantic', priority: 'must_have' },
    ];

    render(
      <TestWrapper>
        <PreferenceSeeder preferences={preferences} />
      </TestWrapper>
    );

    const container = screen.getByTestId('active-preferences');
    expect(container).toHaveAttribute('role', 'region');
    expect(container).toHaveAttribute('aria-label', 'Active search filters');
  });
});
