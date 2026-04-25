# CurrentDao Component Library

A comprehensive, accessible, and performant component library built for CurrentDao's decentralized energy marketplace. This library provides 50+ reusable UI components with consistent API design, comprehensive design system tokens, Storybook integration, and full WCAG 2.1 AA compliance.

## 🚀 Features

### Core Components
- **Button** - 6 variants, 3 sizes, loading states, icons support
- **Card** - 4 variants, responsive layouts, subcomponents
- **Form** - Complete form system with validation
- **Navigation** - Multi-purpose navigation components
- **50+ additional components** for comprehensive UI coverage

### Design System
- **Comprehensive tokens** for colors, spacing, typography
- **Dark mode support** with automatic theme switching
- **Responsive design** with mobile-first approach
- **Consistent API** across all components

### Accessibility
- **WCAG 2.1 AA compliant** with automated testing
- **Keyboard navigation** support for all interactive elements
- **Screen reader** optimized with proper ARIA attributes
- **Focus management** utilities and visual indicators

### Developer Experience
- **TypeScript** with 100% type coverage
- **Storybook** integration with live examples
- **Automated testing** with 90%+ coverage
- **Visual regression** testing
- **Bundle optimization** under 200KB gzipped

## 📦 Installation

```bash
npm install @currentdao/component-library
# or
yarn add @currentdao/component-library
# or
pnpm add @currentdao/component-library
```

## 🎯 Quick Start

```tsx
import { Button, Card, Form } from '@currentdao/component-library';

function App() {
  return (
    <Card>
      <Form onSubmit={handleSubmit}>
        <Button variant="primary" size="md">
          Get Started
        </Button>
      </Form>
    </Card>
  );
}
```

## 🧩 Components

### Button
Versatile button component with multiple variants and states.

```tsx
import { Button } from '@currentdao/component-library';

<Button variant="primary" size="lg" loading={false}>
  Click me
</Button>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success'`
- `size`: `'sm' | 'md' | 'lg'`
- `loading`: `boolean`
- `disabled`: `boolean`
- `fullWidth`: `boolean`
- `leftIcon`: `ReactNode`
- `rightIcon`: `ReactNode`

### Card
Flexible card component with header, content, and footer sections.

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@currentdao/component-library';

<Card variant="elevated" hover>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

**Props:**
- `variant`: `'default' | 'outlined' | 'elevated' | 'flat'`
- `size`: `'sm' | 'md' | 'lg'`
- `padding`: `'none' | 'sm' | 'md' | 'lg'`
- `hover`: `boolean`
- `interactive`: `boolean`

### Form
Complete form system with validation and accessibility.

```tsx
import { Form, FormField, Input, Button } from '@currentdao/component-library';

<Form onSubmit={handleSubmit}>
  <FormField label="Email" required>
    <Input type="email" placeholder="Enter your email" />
  </FormField>
  <Button type="submit">Submit</Button>
</Form>
```

**Components:**
- `Form` - Form wrapper with context
- `FormField` - Field container with label and error handling
- `Input` - Text input with variants
- `Textarea` - Multi-line text input
- `Select` - Dropdown selection
- `Checkbox` - Checkbox input
- `Radio` - Radio button input

### Navigation
Comprehensive navigation components for different use cases.

```tsx
import { Navigation, NavigationList, NavigationItem, NavigationLink } from '@currentdao/component-library';

<Navigation orientation="horizontal" variant="pills">
  <NavigationList>
    <NavigationItem>
      <NavigationLink href="/home" active>Home</NavigationLink>
    </NavigationItem>
    <NavigationItem>
      <NavigationLink href="/about">About</NavigationLink>
    </NavigationItem>
  </NavigationList>
</Navigation>
```

**Components:**
- `Navigation` - Main navigation container
- `NavigationList` - List wrapper
- `NavigationItem` - Individual navigation item
- `NavigationLink` - Link component
- `NavigationButton` - Button-style navigation
- `Breadcrumb` - Breadcrumb navigation
- `Tab` & `TabPanel` - Tab navigation

## 🎨 Design System

### Colors
```tsx
import { designTokens } from '@currentdao/component-library';

// Primary color palette
designTokens.colors.primary[500] // '#0ea5e9'

// Semantic colors
designTokens.colors.success[600] // '#16a34a'
designTokens.colors.error[600]   // '#dc2626'
```

### Spacing
```tsx
designTokens.spacing[4] // '1rem' (16px)
designTokens.spacing[8] // '2rem' (32px)
```

### Typography
```tsx
designTokens.typography.fontSize.lg    // ['1.125rem', { lineHeight: '1.75rem' }]
designTokens.typography.fontWeight.bold // '700'
```

## ♿ Accessibility

All components are built with accessibility in mind:

### Keyboard Navigation
- Tab order follows logical flow
- Enter/Space activate interactive elements
- Arrow keys for navigation components
- Escape for closing modals/dropdowns

### Screen Reader Support
- Proper ARIA labels and descriptions
- Semantic HTML elements
- Live regions for dynamic content
- Focus management for complex interactions

### Testing
```tsx
import { AccessibilityTester } from '@currentdao/component-library';

// Run accessibility audit
const audit = AccessibilityTester.audit();
console.log(`Accessibility score: ${audit.score}%`);
```

## 🪝 Hooks

### useComponentLibrary
Main hook for accessing library utilities:

```tsx
import { useComponentLibrary } from '@currentdao/component-library';

function MyComponent() {
  const { theme, breakpoint, accessibility } = useComponentLibrary();
  
  const isMobile = breakpoint.isMobile;
  const announceMessage = accessibility.announceMessage;
  
  return <div>{/* component content */}</div>;
}
```

### useTheme
Theme management hook:

```tsx
import { useTheme } from '@currentdao/component-library';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button onClick={toggleTheme}>
      Current theme: {theme}
    </Button>
  );
}
```

### useFormValidation
Form validation hook:

```tsx
import { useFormValidation } from '@currentdao/component-library';

function MyForm() {
  const { values, errors, setValue, validateForm } = useFormValidation(
    { email: '', password: '' },
    {
      email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      password: { required: true, minLength: 8 }
    }
  );
  
  return (
    <form onSubmit={() => validateForm() && handleSubmit(values)}>
      <Input
        value={values.email}
        onChange={(e) => setValue('email', e.target.value)}
        error={!!errors.email}
      />
    </form>
  );
}
```

## 📚 Storybook

Explore all components interactively:

```bash
npm run storybook
```

Visit `http://localhost:6006` to see:
- Live component examples
- Interactive prop controls
- Accessibility testing
- Design token documentation
- Usage guidelines

## 🧪 Testing

### Unit Tests
```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

### Accessibility Tests
```bash
npm run test:a11y         # Accessibility-specific tests
```

### Visual Regression Tests
Visual regression tests are integrated with Storybook to catch UI changes automatically.

## 📊 Performance

### Bundle Size
- **Total library**: < 200KB gzipped
- **Individual components**: < 10KB gzipped
- **Tree-shaking supported**: Import only what you need

### Performance Monitoring
```tsx
import { usePerformanceMonitoring } from '@currentdao/component-library';

function MyComponent() {
  const metrics = usePerformanceMonitoring('MyComponent');
  
  console.log(`Render time: ${metrics.lastRenderTime}ms`);
  console.log(`Average render time: ${metrics.averageRenderTime}ms`);
  
  return <div>{/* component content */}</div>;
}
```

## 🔧 Development

### Setup
```bash
# Clone the repository
git clone https://github.com/CurrentDao-org/frontend.git
cd frontend/src/components/library

# Install dependencies
npm install

# Start development
npm run storybook
```

### Building
```bash
npm run build              # Build library
npm run build:watch        # Build with watch mode
npm run size-check         # Check bundle size
```

### Testing
```bash
npm run test              # Run tests
npm run test:coverage     # Coverage report
npm run type-check        # TypeScript checking
npm run lint              # ESLint
```

## 📝 API Reference

### Component Props
All components extend `BaseComponentProps`:

```tsx
interface BaseComponentProps {
  className?: string;
  id?: string;
  'data-testid'?: string;
  ref?: React.Ref<any>;
}
```

### TypeScript Support
Full TypeScript definitions included:

```tsx
import { ButtonProps, CardProps } from '@currentdao/component-library';

const buttonProps: ButtonProps = {
  variant: 'primary',
  size: 'md',
  children: 'Click me'
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Guidelines
- Follow existing code style
- Add TypeScript definitions
- Include accessibility tests
- Update Storybook documentation
- Maintain 90%+ test coverage

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Component Library Docs](https://currentdao.org/docs/components)
- **Issues**: [GitHub Issues](https://github.com/CurrentDao-org/frontend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/CurrentDao-org/frontend/discussions)

## 🗺️ Roadmap

### v1.1
- [ ] Additional 25+ components
- [ ] Advanced theming system
- [ ] Animation utilities
- [ ] Internationalization support

### v1.2
- [ ] Component composition tools
- [ ] Advanced form validation
- [ ] Data visualization components
- [ ] Mobile-specific components

### v2.0
- [ ] Design system generator
- [ ] Component marketplace
- [ ] Advanced testing tools
- [ ] Performance monitoring dashboard

---

Built with ❤️ for the CurrentDao community
