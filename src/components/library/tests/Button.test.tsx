import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Button from '../Button';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock console methods to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

describe('Button Component', () => {
  const user = userEvent.setup();

  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary-600', 'text-white');
  });

  it('renders with different variants', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'success'] as const;
    
    variants.forEach(variant => {
      const { unmount } = render(<Button variant={variant}>{variant}</Button>);
      const button = screen.getByRole('button', { name: variant });
      expect(button).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with different sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    
    sizes.forEach(size => {
      const { unmount } = render(<Button size={size}>{size}</Button>);
      const button = screen.getByRole('button', { name: size });
      expect(button).toBeInTheDocument();
      unmount();
    });
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled button</Button>);
    
    const button = screen.getByRole('button', { name: 'Disabled button' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('shows loading state when loading prop is true', () => {
    render(<Button loading>Loading button</Button>);
    
    const button = screen.getByRole('button', { name: 'Loading button' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    
    // Check for loading spinner
    const spinner = button.querySelector('svg');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('renders with left and right icons', () => {
    render(
      <Button leftIcon={<span data-testid="left-icon">←</span>} rightIcon={<span data-testid="right-icon">→</span>}>
        With icons
      </Button>
    );
    
    const button = screen.getByRole('button', { name: 'With icons' });
    const leftIcon = screen.getByTestId('left-icon');
    const rightIcon = screen.getByTestId('right-icon');
    
    expect(button).toBeInTheDocument();
    expect(leftIcon).toBeInTheDocument();
    expect(rightIcon).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom button</Button>);
    
    const button = screen.getByRole('button', { name: 'Custom button' });
    expect(button).toHaveClass('custom-class');
  });

  it('renders full width when fullWidth prop is true', () => {
    render(<Button fullWidth>Full width button</Button>);
    
    const button = screen.getByRole('button', { name: 'Full width button' });
    expect(button).toHaveClass('w-full');
  });

  it('passes through additional HTML attributes', () => {
    render(
      <Button data-testid="test-button" data-custom="custom-value" title="Button title">
        Test button
      </Button>
    );
    
    const button = screen.getByTestId('test-button');
    expect(button).toHaveAttribute('data-custom', 'custom-value');
    expect(button).toHaveAttribute('title', 'Button title');
  });

  it('supports asChild prop for custom rendering', () => {
    render(
      <Button asChild>
        <span data-testid="custom-element">Custom element</span>
      </Button>
    );
    
    const customElement = screen.getByTestId('custom-element');
    expect(customElement).toBeInTheDocument();
    expect(customElement).toHaveTextContent('Custom element');
  });

  // Accessibility tests
  it('should not have accessibility violations', async () => {
    const { container } = render(<Button>Accessible button</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper ARIA attributes when disabled', () => {
    render(<Button disabled>Disabled button</Button>);
    
    const button = screen.getByRole('button', { name: 'Disabled button' });
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('has proper ARIA attributes when loading', () => {
    render(<Button loading>Loading button</Button>);
    
    const button = screen.getByRole('button', { name: 'Loading button' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  // Keyboard navigation tests
  it('can be activated with Enter key', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Button</Button>);
    
    const button = screen.getByRole('button', { name: 'Button' });
    button.focus();
    await user.keyboard('{Enter}');
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be activated with Space key', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Button</Button>);
    
    const button = screen.getByRole('button', { name: 'Button' });
    button.focus();
    await user.keyboard(' ');
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Focus management tests
  it('receives focus when tabbed to', async () => {
    render(<Button>Button</Button>);
    
    const button = screen.getByRole('button', { name: 'Button' });
    await user.tab();
    
    expect(button).toHaveFocus();
  });

  it('shows focus styles when focused', () => {
    render(<Button>Button</Button>);
    
    const button = screen.getByRole('button', { name: 'Button' });
    button.focus();
    
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
  });

  // Form integration tests
  it('submits form when type is submit', async () => {
    const handleSubmit = jest.fn();
    render(
      <form onSubmit={handleSubmit}>
        <Button type="submit">Submit</Button>
      </form>
    );
    
    const button = screen.getByRole('button', { name: 'Submit' });
    await user.click(button);
    
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('resets form when type is reset', async () => {
    const handleReset = jest.fn();
    render(
      <form onReset={handleReset}>
        <input type="text" defaultValue="test" />
        <Button type="reset">Reset</Button>
      </form>
    );
    
    const button = screen.getByRole('button', { name: 'Reset' });
    await user.click(button);
    
    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  // Performance tests
  it('renders efficiently with many buttons', () => {
    const startTime = performance.now();
    
    const { unmount } = render(
      <div>
        {Array.from({ length: 1000 }, (_, i) => (
          <Button key={i}>Button {i}</Button>
        ))}
      </div>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render 1000 buttons in under 100ms
    expect(renderTime).toBeLessThan(100);
    
    unmount();
  });

  // Error boundary tests
  it('handles errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const ThrowError = () => {
      throw new Error('Test error');
    };
    
    expect(() => {
      render(
        <Button>
          <ThrowError />
        </Button>
      );
    }).toThrow('Test error');
    
    consoleSpy.mockRestore();
  });

  // Visual regression tests (mock for Storybook)
  it('matches visual snapshot', () => {
    const { asFragment } = render(<Button variant="primary" size="md">Test button</Button>);
    expect(asFragment()).toMatchSnapshot();
  });

  // Integration tests with other components
  it('works within form context', async () => {
    const handleSubmit = jest.fn();
    render(
      <form onSubmit={handleSubmit}>
        <Button type="submit">Submit Form</Button>
      </form>
    );
    
    const button = screen.getByRole('button', { name: 'Submit Form' });
    await user.click(button);
    
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('works with disabled form context', () => {
    render(
      <fieldset disabled>
        <Button>Disabled by fieldset</Button>
      </fieldset>
    );
    
    const button = screen.getByRole('button', { name: 'Disabled by fieldset' });
    expect(button).toBeDisabled();
  });

  // Edge cases
  it('handles empty children gracefully', () => {
    render(<Button></Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('');
  });

  it('handles null children gracefully', () => {
    render(<Button>{null}</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('');
  });

  it('handles complex children (React elements)', () => {
    render(
      <Button>
        <div>
          <span>Complex content</span>
          <strong>Bold text</strong>
        </div>
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(screen.getByText('Complex content')).toBeInTheDocument();
    expect(screen.getByText('Bold text')).toBeInTheDocument();
  });
});
