# @foundation/web

The React frontend application for Task.Cloud. Built with modern React patterns, TanStack Router for routing, and Vite for fast development and building.

## 🚀 Features

- **Modern React**: Built with React 19 and TypeScript
- **TanStack Router**: Type-safe routing with file-based routing
- **Vite**: Fast development server and optimized builds
- **TanStack Query**: Server state management and caching
- **Type Safety**: Full TypeScript support throughout
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🛠️ Development

### Prerequisites

- Node.js
- pnpm package manager
- API server running (for full functionality)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables (if needed)
cp .env.example .env
```

### Running the Application

```bash
# Development mode
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Environment Variables

Create a `.env` file with the following variables:

```env
VITE_API_URL=http://localhost:8081
VITE_APP_NAME=Task.Cloud
```

## 📁 Project Structure

```
src/
├── api/              # API client and data fetching
├── assets/           # Static assets (images, icons)
├── components/       # Reusable UI components
├── routes/           # Route components (file-based routing)
├── lib/              # Utility functions and configurations
├── main.tsx          # Application entry point
└── routeTree.gen.ts  # Auto-generated route tree
```

## 🛣️ Routing

The application uses TanStack Router with file-based routing:

- `src/routes/__root.tsx` - Root layout component
- `src/routes/index.tsx` - Home page
- `src/routes/about.tsx` - About page
- `src/routes/loader-data.tsx` - Data loading example

### Route Structure

```typescript
// Example route component
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div>
      <h1>Welcome to Task.Cloud</h1>
    </div>
  );
}
```

## 🔌 API Integration

The frontend integrates with the API server using TanStack Query:

### API Client Setup

```typescript
// src/api/root.ts
import { createQuery } from "@tanstack/react-query";

export const useRoot = createQuery({
  queryKey: ["root"],
  queryFn: async () => {
    const response = await fetch("/api");
    return response.json();
  },
});
```

### Using API Data

```typescript
import { useRoot } from "../api/root";

function HomePage() {
  const { data, isLoading, error } = useRoot();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Welcome!</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

## 🎨 UI Components

The application uses shared UI components from `@foundation/ui`:

```typescript
import { Button } from "@foundation/ui/components/Button";
import { Card } from "@foundation/ui/components/Card";

function TaskCard({ task }) {
  return (
    <Card>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <Button>View Details</Button>
    </Card>
  );
}
```

## 🧪 Testing

The application includes testing setup with Vitest and React Testing Library:

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

### Test Structure

- `test/` - Test utilities and setup
- Component tests alongside components
- Integration tests for API interactions

## 🔧 Configuration

### Vite Configuration

The application uses Vite for development and building. Key configurations in `vite.config.ts`:

- React plugin configuration
- TanStack Router plugin
- Build optimizations
- Development server settings

### TypeScript Configuration

- `tsconfig.json` - Base TypeScript configuration
- `tsconfig.app.json` - Application-specific configuration
- `tsconfig.node.json` - Node.js configuration for build tools

## 🚀 Building and Deployment

### Development Build

```bash
# Development build with hot reload
pnpm dev
```

### Production Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Build Output

The build process generates optimized static files in the `dist/` directory:

- HTML files
- JavaScript bundles
- CSS files
- Static assets

## 📦 Dependencies

### Core Dependencies

- `react` - React library
- `react-dom` - React DOM rendering
- `@tanstack/react-router` - Type-safe routing
- `@tanstack/react-query` - Server state management
- `@foundation/ui` - Shared UI components
- `@foundation/types` - Shared TypeScript types

### Development Dependencies

- `@vitejs/plugin-react` - Vite React plugin
- `@tanstack/router-plugin` - TanStack Router Vite plugin
- `typescript` - TypeScript compiler
- `vite` - Build tool and dev server

## 🎯 Key Features

### Type Safety

- Full TypeScript support
- Type-safe routing with TanStack Router
- Type-safe API calls with TanStack Query

### Performance

- Fast development with Vite
- Optimized production builds
- Code splitting and lazy loading
- Efficient re-rendering with React 19

### Developer Experience

- Hot module replacement
- TypeScript error checking
- File-based routing
- Auto-generated route types

## 🤝 Contributing

1. Follow the project's coding standards
2. Add tests for new components
3. Ensure TypeScript types are correct
4. Test on different screen sizes

## 📄 License

This package is part of the Task.Cloud project and is licensed under GPL-3.0-or-later.
