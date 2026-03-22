# @foundation/e2e

End-to-end testing suite for the Task.Cloud application using Playwright. This package provides comprehensive testing of the entire application stack, from frontend to backend integration.

## 🚀 Features

- **Full Application Testing**: Tests the complete user journey
- **Cross-Browser Support**: Chrome, Firefox, Safari, and Edge
- **Visual Testing**: Screenshot and visual regression testing
- **Performance Testing**: Page load and interaction performance
- **Mobile Testing**: Responsive design testing
- **CI/CD Integration**: Optimized for continuous integration

## 🛠️ Setup

### Prerequisites

- Node.js
- pnpm package manager
- API server running
- Web application running

### Installation

```bash
# Install dependencies
pnpm install

# Install Playwright browsers
npx playwright install
```

### Environment Setup

Create a `.env` file with test-specific variables:

```env
# Test environment variables
TEST_API_URL=http://localhost:8081
TEST_WEB_URL=http://localhost:5173
TEST_DATABASE_URL=postgresql://username:password@localhost:5432/taskcloud_test
```

## 🧪 Running Tests

### Basic Test Execution

```bash
# Run all E2E tests
pnpm e2e

# Run tests with UI mode (interactive)
pnpm e2e:ui

# Run tests in headed mode (see browser)
pnpm e2e --headed

# Run specific test file
pnpm e2e home.spec.ts
```

### Test Modes

```bash
# Run tests in different browsers
pnpm e2e --project=chromium
pnpm e2e --project=firefox
pnpm e2e --project=safari

# Run tests in parallel
pnpm e2e --workers=4

# Run tests with specific timeout
pnpm e2e --timeout=30000
```

## 📁 Test Structure

```
src/
├── home.spec.ts       # Home page tests
├── auth.spec.ts       # Authentication tests
├── tasks.spec.ts      # Task management tests
├── api.spec.ts        # API integration tests
└── utils/
    ├── setup.ts       # Test setup utilities
    └── helpers.ts     # Common test helpers
```

### Example Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display welcome message', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('h1')).toContainText('Welcome Home!');
  });

  test('should load API data', async ({ page }) => {
    await page.goto('/');
    
    // Wait for API data to load
    await expect(page.locator('[data-testid="api-data"]')).toBeVisible();
    
    // Verify data structure
    const data = await page.locator('pre').textContent();
    const parsedData = JSON.parse(data);
    
    expect(parsedData).toHaveProperty('status');
    expect(parsedData.status).toBe('ok!');
  });
});
```

## 🎯 Test Categories

### UI/UX Tests

- **Navigation**: Test routing and page transitions
- **Responsive Design**: Test on different screen sizes
- **Accessibility**: Test keyboard navigation and screen readers
- **Visual Regression**: Compare screenshots across versions

### Functional Tests

- **User Flows**: Complete user journeys
- **Form Validation**: Input validation and error handling
- **Data Persistence**: CRUD operations
- **State Management**: Application state consistency

### Integration Tests

- **API Integration**: Frontend-backend communication
- **Database Operations**: Data persistence and retrieval
- **Authentication**: Login/logout flows
- **Real-time Features**: WebSocket connections

## 🔧 Configuration

### Playwright Configuration

The `playwright.config.ts` file contains:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Test Utilities

Common test utilities and helpers:

```typescript
// utils/helpers.ts
export async function loginUser(page: Page, credentials: LoginCredentials) {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', credentials.email);
  await page.fill('[data-testid="password"]', credentials.password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard');
}

export async function createTestTask(page: Page, taskData: TaskData) {
  await page.goto('/tasks/new');
  await page.fill('[data-testid="task-title"]', taskData.title);
  await page.fill('[data-testid="task-description"]', taskData.description);
  await page.click('[data-testid="create-task"]');
  await page.waitForURL('/tasks');
}
```

## 📊 Test Reporting

### HTML Report

```bash
# Generate HTML report
pnpm e2e --reporter=html

# Open report
npx playwright show-report
```

### JUnit Report

```bash
# Generate JUnit XML report for CI
pnpm e2e --reporter=junit
```

### Trace Viewer

```bash
# Open trace viewer for failed tests
npx playwright show-trace trace.zip
```

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## 🧹 Test Data Management

### Database Setup

```typescript
// utils/setup.ts
export async function setupTestDatabase() {
  // Reset database to known state
  // Create test users and data
  // Return cleanup function
}

export async function cleanupTestDatabase() {
  // Remove test data
  // Reset database state
}
```

### Test Isolation

Each test should be isolated and not depend on other tests:

```typescript
test.beforeEach(async ({ page }) => {
  // Setup test data
  await setupTestDatabase();
});

test.afterEach(async () => {
  // Cleanup test data
  await cleanupTestDatabase();
});
```

## 📦 Dependencies

### Core Dependencies

- `@playwright/test` - Playwright testing framework
- `@foundation/types` - Shared TypeScript types

### Development Dependencies

- `@types/node` - Node.js type definitions

## 🤝 Contributing

1. Write tests for new features
2. Ensure tests are isolated and reliable
3. Add appropriate test data setup
4. Update test documentation

## 📄 License

This package is part of the Task.Cloud project and is licensed under GPL-3.0-or-later. 