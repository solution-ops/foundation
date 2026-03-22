# @foundation/types

Shared TypeScript type definitions for the Task.Cloud project. This package provides centralized type definitions used across all applications and packages.

## 🚀 Features

- **Centralized Types**: Single source of truth for type definitions
- **Type Safety**: Comprehensive TypeScript types for all data structures
- **API Types**: Type definitions for API requests and responses
- **Database Types**: Types derived from database schemas
- **Utility Types**: Common utility types and helpers
- **Export Organization**: Clean export structure for easy importing

## 🛠️ Setup

### Installation

```bash
# Install the package
pnpm add @foundation/types

# For development
pnpm add -D @foundation/types
```

### Basic Usage

```typescript
import type { HealthResponse } from "@foundation/types/health.type";
import type { User, Profile } from "@foundation/types/schemas";

// Use types in your code
const healthCheck = async (): Promise<HealthResponse> => {
  const response = await fetch('/api/health');
  return response.json();
};

const createUser = (userData: Omit<User, 'id' | 'dateCreated' | 'dateUpdated'>) => {
  // Implementation
};
```

## 📦 Available Types

### API Response Types

#### Health Response

```typescript
import type { HealthResponse } from "@foundation/types/health.type";

// Health check response structure
interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version?: string;
  uptime?: number;
}
```

### Database Schema Types

#### User Types

```typescript
import type { User } from "@foundation/types/schemas";

// User entity type
interface User {
  id: string;
  username: string;
  email: string;
  dateCreated: Date;
  dateUpdated: Date;
}

// User creation type (omitting auto-generated fields)
type CreateUser = Omit<User, 'id' | 'dateCreated' | 'dateUpdated'>;

// User update type (partial with required fields)
type UpdateUser = Partial<Pick<User, 'username' | 'email'>> & {
  id: string;
};
```

#### Profile Types

```typescript
import type { Profile } from "@foundation/types/schemas";

// Profile entity type
interface Profile {
  id: string;
  userId: string;
  bio?: string;
  dateCreated: Date;
  dateUpdated: Date;
}

// Profile creation type
type CreateProfile = Omit<Profile, 'id' | 'dateCreated' | 'dateUpdated'>;

// Profile update type
type UpdateProfile = Partial<Pick<Profile, 'bio'>> & {
  id: string;
};
```

### Utility Types

#### Common Utilities

```typescript
// API response wrapper
type ApiResponse<T> = {
  data: T;
  status: 'success' | 'error';
  message?: string;
};

// Pagination types
type PaginationParams = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// Error types
type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};
```

## 📁 Type Organization

### File Structure

```
src/
├── health.type.ts      # Health check related types
├── index.ts           # Main export file
└── schemas/           # Database schema types
    ├── users.ts       # User-related types
    └── profiles.ts    # Profile-related types
```

### Export Structure

```typescript
// src/index.ts - Main exports
export * from './health.type';
export * from './schemas/users';
export * from './schemas/profiles';

// Individual file exports
export type { HealthResponse } from './health.type';
export type { User, CreateUser, UpdateUser } from './schemas/users';
export type { Profile, CreateProfile, UpdateProfile } from './schemas/profiles';
```

## 🔧 Type Usage Examples

### API Integration

```typescript
import type { HealthResponse, ApiResponse } from "@foundation/types";

// API client with typed responses
class ApiClient {
  async getHealth(): Promise<HealthResponse> {
    const response = await fetch('/api/health');
    return response.json();
  }

  async getUsers(): Promise<ApiResponse<User[]>> {
    const response = await fetch('/api/users');
    return response.json();
  }
}
```

### Database Operations

```typescript
import type { User, CreateUser, UpdateUser } from "@foundation/types";

// Database service with typed operations
class UserService {
  async createUser(userData: CreateUser): Promise<User> {
    // Implementation
  }

  async updateUser(userId: string, updates: UpdateUser): Promise<User> {
    // Implementation
  }

  async getUserById(id: string): Promise<User | null> {
    // Implementation
  }
}
```

### React Components

```typescript
import type { User, Profile } from "@foundation/types";

interface UserProfileProps {
  user: User;
  profile?: Profile;
  onUpdate: (updates: Partial<Profile>) => void;
}

function UserProfile({ user, profile, onUpdate }: UserProfileProps) {
  return (
    <div>
      <h2>{user.username}</h2>
      <p>{user.email}</p>
      {profile && <p>{profile.bio}</p>}
    </div>
  );
}
```

## 🧪 Type Testing

### Type Assertions

```typescript
import type { HealthResponse } from "@foundation/types";

// Test type compatibility
const mockHealthResponse: HealthResponse = {
  status: 'ok',
  timestamp: new Date().toISOString(),
  version: '1.0.0',
  uptime: 12345,
};

// Type guard function
function isHealthResponse(obj: unknown): obj is HealthResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'status' in obj &&
    'timestamp' in obj
  );
}
```

### Type Validation

```typescript
import type { User } from "@foundation/types";

// Runtime validation with type checking
function validateUser(user: unknown): user is User {
  return (
    typeof user === 'object' &&
    user !== null &&
    typeof (user as User).id === 'string' &&
    typeof (user as User).username === 'string' &&
    typeof (user as User).email === 'string'
  );
}
```

## 🔄 Type Evolution

### Adding New Types

1. **Create the type file**: Add new type definitions in appropriate files
2. **Export the types**: Add exports to `src/index.ts`
3. **Update documentation**: Document new types in this README
4. **Version bump**: Increment package version when adding breaking changes

### Example: Adding Task Types

```typescript
// src/schemas/tasks.ts
export interface Task {
  id: string;
  title: string;
  description?: string;
  userId: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dateCreated: Date;
  dateUpdated: Date;
}

export type CreateTask = Omit<Task, 'id' | 'dateCreated' | 'dateUpdated'>;
export type UpdateTask = Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority'>> & {
  id: string;
};
```

## 📦 Package Exports

### Main Exports

```typescript
// All types
import * as Types from "@foundation/types";

// Specific type categories
import type { HealthResponse } from "@foundation/types/health.type";
import type { User, Profile } from "@foundation/types/schemas";
```

### Conditional Exports

```typescript
// Schema types
import type { User } from "@foundation/types/schemas/users";
import type { Profile } from "@foundation/types/schemas/profiles";

// API types
import type { HealthResponse } from "@foundation/types/health.type";
```

## 🚀 Development

### Local Development

```bash
# Install dependencies
pnpm install

# Type checking
pnpm type-check

# Build types
pnpm build
```

### Type Generation

```bash
# Generate types from database schema
pnpm generate-types

# Validate type consistency
pnpm validate-types
```

## 🎯 Best Practices

### Type Design

- **Descriptive names**: Use clear, descriptive type names
- **Consistent patterns**: Follow established naming conventions
- **Documentation**: Add JSDoc comments for complex types
- **Composability**: Create reusable type utilities
- **Validation**: Include runtime validation where appropriate

### Type Organization

- **Logical grouping**: Group related types together
- **Clear exports**: Export only what's needed
- **Version compatibility**: Maintain backward compatibility
- **Breaking changes**: Document breaking changes clearly

## 📦 Dependencies

### Development Dependencies

- `@foundation/tsconfig` - TypeScript configuration

### Peer Dependencies

- `typescript` - TypeScript compiler (peer dependency)

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add comprehensive JSDoc documentation
3. Include type tests where appropriate
4. Update this README when adding new types
5. Ensure backward compatibility

## 📄 License

This package is part of the Task.Cloud project and is licensed under GPL-3.0-or-later. 