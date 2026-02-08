import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TravelerStep } from '../steps/TravelerStep';

describe('TravelerStep', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render adult and children counters', () => {
      render(<TravelerStep onChange={mockOnChange} />);

      expect(screen.getByTestId('adults-count')).toBeInTheDocument();
      expect(screen.getByTestId('children-count')).toBeInTheDocument();
    });

    it('should display the step heading', () => {
      render(<TravelerStep onChange={mockOnChange} />);

      expect(screen.getByText(/who.*traveling/i)).toBeInTheDocument();
    });

    it('should show default values', () => {
      render(<TravelerStep onChange={mockOnChange} />);

      expect(screen.getByTestId('adults-count')).toHaveTextContent('2');
      expect(screen.getByTestId('children-count')).toHaveTextContent('0');
    });

    it('should show provided values', () => {
      render(
        <TravelerStep
          onChange={mockOnChange}
          value={{ adults: 4, children: 2 }}
        />
      );

      expect(screen.getByTestId('adults-count')).toHaveTextContent('4');
      expect(screen.getByTestId('children-count')).toHaveTextContent('2');
    });
  });

  describe('Adult Counter', () => {
    it('should increment adults when plus clicked', async () => {
      const user = userEvent.setup();
      render(
        <TravelerStep
          onChange={mockOnChange}
          value={{ adults: 2, children: 0 }}
        />
      );

      await user.click(screen.getByRole('button', { name: /increase adults/i }));

      expect(mockOnChange).toHaveBeenCalledWith({ adults: 3, children: 0 });
    });

    it('should decrement adults when minus clicked', async () => {
      const user = userEvent.setup();
      render(
        <TravelerStep
          onChange={mockOnChange}
          value={{ adults: 2, children: 0 }}
        />
      );

      await user.click(screen.getByRole('button', { name: /decrease adults/i }));

      expect(mockOnChange).toHaveBeenCalledWith({ adults: 1, children: 0 });
    });

    it('should not allow adults below 1', async () => {
      const user = userEvent.setup();
      render(
        <TravelerStep
          onChange={mockOnChange}
          value={{ adults: 1, children: 0 }}
        />
      );

      const decreaseBtn = screen.getByRole('button', { name: /decrease adults/i });
      expect(decreaseBtn).toBeDisabled();

      await user.click(decreaseBtn);
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should not allow adults above 10', async () => {
      const user = userEvent.setup();
      render(
        <TravelerStep
          onChange={mockOnChange}
          value={{ adults: 10, children: 0 }}
        />
      );

      const increaseBtn = screen.getByRole('button', { name: /increase adults/i });
      expect(increaseBtn).toBeDisabled();
    });
  });

  describe('Children Counter', () => {
    it('should increment children when plus clicked', async () => {
      const user = userEvent.setup();
      render(
        <TravelerStep
          onChange={mockOnChange}
          value={{ adults: 2, children: 0 }}
        />
      );

      await user.click(screen.getByRole('button', { name: /increase children/i }));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ adults: 2, children: 1 })
      );
    });

    it('should decrement children when minus clicked', async () => {
      const user = userEvent.setup();
      render(
        <TravelerStep
          onChange={mockOnChange}
          value={{ adults: 2, children: 2, childrenAges: [5, 8] }}
        />
      );

      await user.click(screen.getByRole('button', { name: /decrease children/i }));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ adults: 2, children: 1 })
      );
    });

    it('should not allow children below 0', () => {
      render(
        <TravelerStep
          onChange={mockOnChange}
          value={{ adults: 2, children: 0 }}
        />
      );

      const decreaseBtn = screen.getByRole('button', { name: /decrease children/i });
      expect(decreaseBtn).toBeDisabled();
    });

    it('should not allow children above 6', async () => {
      const user = userEvent.setup();
      render(
        <TravelerStep
          onChange={mockOnChange}
          value={{ adults: 2, children: 6 }}
        />
      );

      const increaseBtn = screen.getByRole('button', { name: /increase children/i });
      expect(increaseBtn).toBeDisabled();
    });
  });

  describe('Children Ages', () => {
    it('should show age inputs when children > 0', () => {
      render(
        <TravelerStep
          onChange={mockOnChange}
          value={{ adults: 2, children: 2 }}
        />
      );

      expect(screen.getByText(/child 1 age/i)).toBeInTheDocument();
      expect(screen.getByText(/child 2 age/i)).toBeInTheDocument();
    });

    it('should not show age inputs when children = 0', () => {
      render(
        <TravelerStep
          onChange={mockOnChange}
          value={{ adults: 2, children: 0 }}
        />
      );

      expect(screen.queryByText(/child.*age/i)).not.toBeInTheDocument();
    });

    it('should call onChange with childrenAges when age selected', async () => {
      const user = userEvent.setup();
      render(
        <TravelerStep
          onChange={mockOnChange}
          value={{ adults: 2, children: 1, childrenAges: [] }}
        />
      );

      const ageSelect = screen.getByLabelText(/child 1 age/i);
      await user.selectOptions(ageSelect, '5');

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          childrenAges: [5],
        })
      );
    });

    it('should show age options from 0 to 17', () => {
      render(
        <TravelerStep
          onChange={mockOnChange}
          value={{ adults: 2, children: 1 }}
        />
      );

      const ageSelect = screen.getByLabelText(/child 1 age/i);
      const options = ageSelect.querySelectorAll('option');

      expect(options.length).toBeGreaterThanOrEqual(18);
    });
  });

  describe('Total Travelers Display', () => {
    it('should show total traveler count', () => {
      render(
        <TravelerStep
          onChange={mockOnChange}
          value={{ adults: 3, children: 2 }}
        />
      );

      expect(screen.getByText(/5 travelers/i)).toBeInTheDocument();
    });

    it('should show singular for 1 traveler', () => {
      render(
        <TravelerStep
          onChange={mockOnChange}
          value={{ adults: 1, children: 0 }}
        />
      );

      expect(screen.getByText(/1 traveler$/i)).toBeInTheDocument();
    });
  });

  describe('Quick Presets', () => {
    it('should show preset buttons', () => {
      render(<TravelerStep onChange={mockOnChange} />);

      expect(screen.getByRole('button', { name: /solo/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /couple/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /family/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /group/i })).toBeInTheDocument();
    });

    it('should set solo preset when clicked', async () => {
      const user = userEvent.setup();
      render(<TravelerStep onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /solo/i }));

      expect(mockOnChange).toHaveBeenCalledWith({ adults: 1, children: 0 });
    });

    it('should set couple preset when clicked', async () => {
      const user = userEvent.setup();
      render(<TravelerStep onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /couple/i }));

      expect(mockOnChange).toHaveBeenCalledWith({ adults: 2, children: 0 });
    });

    it('should set family preset when clicked', async () => {
      const user = userEvent.setup();
      render(<TravelerStep onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /family/i }));

      expect(mockOnChange).toHaveBeenCalledWith({ adults: 2, children: 2 });
    });
  });

  describe('Accessibility', () => {
    it('should have proper fieldset grouping', () => {
      render(<TravelerStep onChange={mockOnChange} />);

      expect(screen.getByRole('group', { name: /travelers/i })).toBeInTheDocument();
    });

    it('should have accessible counter buttons', () => {
      render(<TravelerStep onChange={mockOnChange} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((btn) => {
        expect(btn).toHaveAccessibleName();
      });
    });
  });
});
