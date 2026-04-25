import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants, sizes, and states. Supports loading states, icons, and full-width layouts.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'success'],
      description: 'Button style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading spinner',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable button',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Make button full width',
    },
    children: {
      control: 'text',
      description: 'Button content',
    },
  },
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    fullWidth: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    children: 'Click me',
  },
};

// Variants
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="success">Success</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button variants with different visual styles and purposes.',
      },
    },
  },
};

// Sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different button sizes for various use cases and hierarchies.',
      },
    },
  },
};

// States
export const States: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>Normal</Button>
      <Button loading>Loading</Button>
      <Button disabled>Disabled</Button>
      <Button variant="destructive" disabled>Disabled Destructive</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different button states including loading and disabled states.',
      },
    },
  },
};

// With Icons
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button leftIcon={<span>←</span>}>Back</Button>
      <Button rightIcon={<span>→</span>}>Next</Button>
      <Button leftIcon={<span>+</span>} rightIcon={<span>→</span>}>Add Item</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons with left and right icons for enhanced visual communication.',
      },
    },
  },
};

// Full Width
export const FullWidth: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-4">
      <Button fullWidth>Full Width Button</Button>
      <Button variant="outline" fullWidth>Full Width Outline</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Full-width buttons for forms and mobile interfaces.',
      },
    },
  },
};

// Interactive Example
export const Interactive: Story = {
  render: () => {
    const [count, setCount] = React.useState(0);
    
    return (
      <div className="flex flex-col gap-4">
        <p>Click count: {count}</p>
        <Button onClick={() => setCount(count + 1)}>
          Increment
        </Button>
        <Button variant="outline" onClick={() => setCount(0)}>
          Reset
        </Button>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive button example with state management.',
      },
    },
  },
};

// Accessibility Testing
export const Accessibility: Story = {
  render: () => (
    <div className="space-y-4">
      <Button aria-label="Submit form">Submit</Button>
      <Button aria-describedby="button-help">Get Help</Button>
      <p id="button-help" className="text-sm text-gray-600">
        Click this button to get help with the current task.
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Button with accessibility attributes and ARIA support.',
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'button-name',
            enabled: true,
          },
          {
            id: 'aria-input-field-name',
            enabled: true,
          },
        ],
      },
    },
  },
};
