import type { Meta, StoryObj } from '@storybook/react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible card component with header, content, and footer sections. Supports multiple variants and sizes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outlined', 'elevated', 'flat'],
      description: 'Card style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Card size',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Card padding',
    },
    hover: {
      control: 'boolean',
      description: 'Enable hover effects',
    },
    interactive: {
      control: 'boolean',
      description: 'Make card interactive (clickable)',
    },
  },
  args: {
    variant: 'default',
    size: 'md',
    padding: 'md',
    hover: false,
    interactive: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>
          This is a card description that provides additional context.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          This is the main content area of the card. You can put any content here,
          including text, images, or other components.
        </p>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm bg-primary-600 text-white rounded">
            Action
          </button>
          <button className="px-3 py-1 text-sm border border-neutral-300 rounded">
            Cancel
          </button>
        </div>
      </CardFooter>
    </Card>
  ),
};

// Variants
export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <Card variant="default" className="w-64">
        <CardHeader>
          <CardTitle>Default</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Default card with subtle shadow and border.</p>
        </CardContent>
      </Card>
      
      <Card variant="outlined" className="w-64">
        <CardHeader>
          <CardTitle>Outlined</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Card with prominent border outline.</p>
        </CardContent>
      </Card>
      
      <Card variant="elevated" className="w-64">
        <CardHeader>
          <CardTitle>Elevated</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Card with strong elevation and shadow.</p>
        </CardContent>
      </Card>
      
      <Card variant="flat" className="w-64">
        <CardHeader>
          <CardTitle>Flat</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Flat card with no border or shadow.</p>
        </CardContent>
      </Card>
    </div>
  ),
};

// Sizes
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Card size="sm" className="w-80">
        <CardHeader>
          <CardTitle>Small Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Compact card with minimal padding.</p>
        </CardContent>
      </Card>
      
      <Card size="md" className="w-80">
        <CardHeader>
          <CardTitle>Medium Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Standard card with balanced spacing.</p>
        </CardContent>
      </Card>
      
      <Card size="lg" className="w-80">
        <CardHeader>
          <CardTitle>Large Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Spacious card with generous padding for complex content.</p>
        </CardContent>
      </Card>
    </div>
  ),
};

// Interactive Cards
export const Interactive: Story = {
  render: () => (
    <div className="space-y-4">
      <Card 
        interactive 
        className="w-80 cursor-pointer"
        onClick={() => console.log('Card clicked!')}
      >
        <CardHeader>
          <CardTitle>Clickable Card</CardTitle>
          <CardDescription>
            Click anywhere on this card to trigger an action.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This card has hover effects and click handlers.</p>
        </CardContent>
      </Card>
      
      <Card hover className="w-80">
        <CardHeader>
          <CardTitle>Hover Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This card has hover effects but is not clickable.</p>
        </CardContent>
      </Card>
    </div>
  ),
};

// Card Examples
export const ProductCard: Story = {
  render: () => (
    <Card className="w-80">
      <div className="aspect-video bg-neutral-100 rounded-t-lg"></div>
      <CardHeader>
        <CardTitle>Premium Widget</CardTitle>
        <CardDescription>
          High-quality widget with advanced features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">$99.99</span>
          <div className="flex gap-1">
            <span className="text-yellow-400">★</span>
            <span className="text-yellow-400">★</span>
            <span className="text-yellow-400">★</span>
            <span className="text-yellow-400">★</span>
            <span className="text-neutral-300">★</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <button className="flex-1 bg-primary-600 text-white py-2 rounded-lg">
          Add to Cart
        </button>
      </CardFooter>
    </Card>
  ),
};

export const StatsCard: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <Card className="text-center">
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-primary-600">1,234</div>
          <div className="text-sm text-neutral-600">Total Users</div>
        </CardContent>
      </Card>
      
      <Card className="text-center">
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-success-600">89%</div>
          <div className="text-sm text-neutral-600">Completion Rate</div>
        </CardContent>
      </Card>
      
      <Card className="text-center">
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-warning-600">4.8</div>
          <div className="text-sm text-neutral-600">Avg Rating</div>
        </CardContent>
      </Card>
    </div>
  ),
};

export const ProfileCard: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
            JD
          </div>
          <div>
            <CardTitle>John Doe</CardTitle>
            <CardDescription>Software Engineer</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Projects</span>
            <span className="font-medium">42</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Experience</span>
            <span className="font-medium">5 years</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Location</span>
            <span className="font-medium">San Francisco</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <button className="flex-1 bg-primary-600 text-white py-2 rounded-lg">
          View Profile
        </button>
      </CardFooter>
    </Card>
  ),
};
