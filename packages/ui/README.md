# @foundation/ui

Shared UI component library for Task.Cloud applications. This package provides reusable React components, styling utilities, and design system foundations.

## 🚀 Features

- **Reusable Components**: Consistent UI components across applications
- **Type Safety**: Full TypeScript support for all components
- **Testing Ready**: Components include testing utilities
- **Design System**: Consistent styling and theming
- **Accessibility**: WCAG compliant components
- **Responsive**: Mobile-first responsive design

## 🛠️ Setup

### Installation

```bash
# Install the package
pnpm add @foundation/ui

# Install peer dependencies
pnpm add react react-dom @tanstack/react-query
```

### Basic Usage

```typescript
import { Button } from "@foundation/ui/components/Button";
import { Card } from "@foundation/ui/components/Card";
import { useApiClient } from "@foundation/ui/lib/api-client";

function MyComponent() {
  const apiClient = useApiClient();
  
  return (
    <Card>
      <h2>Welcome to Task.Cloud</h2>
      <Button onClick={() => apiClient.health()}>
        Check Health
      </Button>
    </Card>
  );
}
```

## 📦 Available Components

### Core Components

#### Button

```typescript
import { Button } from "@foundation/ui/components/Button";

// Basic button
<Button>Click me</Button>

// Button with variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Delete</Button>

// Button with sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Disabled state
<Button disabled>Disabled</Button>
```

#### Card

```typescript
import { Card } from "@foundation/ui/components/Card";

<Card>
  <Card.Header>
    <Card.Title>Card Title</Card.Title>
    <Card.Description>Card description</Card.Description>
  </Card.Header>
  <Card.Content>
    <p>Card content goes here</p>
  </Card.Content>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

#### Provider

```typescript
import { Provider } from "@foundation/ui/components/provider";

function App() {
  return (
    <Provider>
      <YourApp />
    </Provider>
  );
}
```

## 🔧 Utilities and Hooks

### API Client

```typescript
import { useApiClient } from "@foundation/ui/lib/api-client";

function MyComponent() {
  const apiClient = useApiClient();
  
  const handleHealthCheck = async () => {
    try {
      const health = await apiClient.health();
      console.log('Health status:', health);
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };
  
  return <Button onClick={handleHealthCheck}>Check Health</Button>;
}
```

### React Query Integration

```typescript
import { useReactQuery } from "@foundation/ui/lib/react-query";

function MyComponent() {
  const queryClient = useReactQuery();
  
  // Use TanStack Query hooks
  const { data, isLoading, error } = useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.health(),
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Status: {data.status}</div>;
}
```

## 🎨 Styling and Theming

### CSS Classes

Components use utility classes for styling:

```typescript
// Button with custom classes
<Button className="bg-blue-500 hover:bg-blue-600">
  Custom Styled Button
</Button>

// Card with custom styling
<Card className="border-2 border-gray-200 shadow-lg">
  Custom Card
</Card>
```

### Responsive Design

All components are mobile-first and responsive:

```typescript
// Responsive button
<Button className="w-full md:w-auto">
  Responsive Button
</Button>

// Responsive card
<Card className="p-4 md:p-6 lg:p-8">
  Responsive Card
</Card>
```

## 🧪 Testing

### Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@foundation/ui/components/Button';

describe('Button', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Test Utilities

```typescript
import { renderWithProviders } from '@foundation/ui/test/test-utils';

describe('Component with Providers', () => {
  test('renders with providers', () => {
    renderWithProviders(<MyComponent />);
    // Test component with all necessary providers
  });
});
```

## 📦 Package Exports

### Component Exports

```typescript
// Individual components
import { Button } from "@foundation/ui/components/Button";
import { Card } from "@foundation/ui/components/Card";
import { Provider } from "@foundation/ui/components/provider";

// Library utilities
import { useApiClient } from "@foundation/ui/lib/api-client";
import { useReactQuery } from "@foundation/ui/lib/react-query";
```

### Type Exports

```typescript
// Component prop types
import type { ButtonProps } from "@foundation/ui/components/Button";
import type { CardProps } from "@foundation/ui/components/Card";
```

## 🔧 Configuration

### Provider Setup

The `Provider` component sets up all necessary contexts:

```typescript
import { Provider } from "@foundation/ui/components/provider";

function App() {
  return (
    <Provider
      apiUrl="http://localhost:8081"
      queryClientConfig={{
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
          },
        },
      }}
    >
      <YourApp />
    </Provider>
  );
}
```

### API Client Configuration

```typescript
import { createApiClient } from "@foundation/ui/lib/api-client";

const apiClient = createApiClient({
  baseUrl: process.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## 🚀 Development

### Local Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

### Building

```bash
# Build the package
pnpm build

# Type checking
pnpm type-check
```

## 📋 Component Guidelines

### Creating New Components

1. **File Structure**: Place components in `src/components/`
2. **Naming**: Use PascalCase for component names
3. **Types**: Export prop types for each component
4. **Testing**: Include comprehensive tests
5. **Documentation**: Add JSDoc comments

### Example Component

```typescript
// src/components/Example.tsx
import { type ReactNode } from 'react';

export interface ExampleProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

/**
 * Example component for demonstration
 * @param props - Component props
 * @returns Rendered component
 */
export function Example({ children, variant = 'primary', className }: ExampleProps) {
  return (
    <div className={`example example--${variant} ${className || ''}`}>
      {children}
    </div>
  );
}
```

## 🎯 Best Practices

### Component Design

- **Composition over inheritance**: Use composition patterns
- **Single responsibility**: Each component has one clear purpose
- **Accessibility**: Include ARIA attributes and keyboard navigation
- **Performance**: Use React.memo for expensive components
- **Type safety**: Provide comprehensive TypeScript types

### Styling

- **Utility classes**: Use Tailwind CSS utilities
- **Consistent spacing**: Follow design system spacing scale
- **Responsive design**: Mobile-first approach
- **Dark mode**: Support dark mode variants

## 📦 Dependencies

### Core Dependencies

- `react` - React library
- `react-dom` - React DOM rendering
- `@tanstack/react-query` - Server state management

### Development Dependencies

- `@testing-library/react` - React testing utilities
- `@testing-library/jest-dom` - Jest DOM matchers
- `vitest` - Testing framework
- `@foundation/tsconfig` - TypeScript configuration

## 🤝 Contributing

1. Follow the component design guidelines
2. Add comprehensive tests for new components
3. Update documentation and examples
4. Ensure accessibility compliance
5. Test across different screen sizes

## 📄 License

This package is part of the Task.Cloud project and is licensed under GPL-3.0-or-later.