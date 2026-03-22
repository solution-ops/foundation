# E2E Test Utilities

Complete setup with fixtures for seed users and authentication workflows in e2e tests.

## Quick Start with Fixtures

```typescript
import { test, expect } from "./config/setup";

// Automatically get a seed user that's cleaned up after the test
test("my test", async ({ testUser, authPage }) => {
  await authPage.signIn({
    email: testUser.email,
    password: testUser.password
  });
  await authPage.waitForAuthSuccess();
});

// Or get a pre-authenticated page
test("authenticated test", async ({ authenticatedPage }) => {
  // User is already signed in!
  await authenticatedPage.goto("/dashboard");
  await expect(authenticatedPage).toHaveURL(/.*dashboard/);
});
```

## Available Fixtures

When you import from `"./config/setup"`, you get these fixtures:

- **`testUser`** - Automatically creates and cleans up a seed user
- **`authPage`** - Provides an AuthPage instance for the current page  
- **`authenticatedPage`** - Pre-authenticated page (user already signed in)

```typescript
import { test, expect } from "./config/setup";

test("fixture examples", async ({ 
  testUser,           // TestUser object with id, email, password
  authPage,           // AuthPage instance
  authenticatedPage   // Page that's already authenticated
}) => {
  // All fixtures are automatically managed for you!
});
```

## Seed User Database Utilities

```typescript
import { createSeedUser, cleanupSeedUser, cleanupAllTestUsers } from "./utils/database";

// Create a seed user
const testUser = await createSeedUser({
  name: "Test User",
  email: "test@example.com", 
  password: "TestPassword123!"
});

// Use the user in your tests...
// testUser.id, testUser.email, testUser.password

// Clean up when done
await cleanupSeedUser(testUser.id);

// Or clean up all test users at once
await cleanupAllTestUsers();
```

### Database Functions

- `createSeedUser(userData?)` - Creates a user directly in the database
- `cleanupSeedUser(userId)` - Removes a specific test user and associated data
- `cleanupAllTestUsers()` - Removes all users with emails starting with "test-"
- `getUserByEmail(email)` - Retrieves a user by email

## Authentication Page Object

```typescript
import { AuthPage } from "./utils/auth-page";

test("sign up workflow", async ({ page }) => {
  const auth = new AuthPage(page);
  
  // Complete sign-up
  await auth.signUp({
    name: "Test User",
    email: "test@example.com",
    password: "TestPassword123!"
  });
  
  // Wait for successful redirect
  await auth.waitForAuthSuccess();
});

test("sign in workflow", async ({ page }) => {
  const auth = new AuthPage(page);
  
  // Complete sign-in
  await auth.signIn({
    email: "test@example.com",
    password: "TestPassword123!"
  });
  
  await auth.waitForAuthSuccess();
});
```

### Auth Page Methods

**Navigation:**
- `goToSignUp()` - Navigate to sign-up page
- `goToSignIn()` - Navigate to sign-in page

**Form Filling:**
- `fillSignUpForm({ name, email, password })` - Fill sign-up form
- `fillSignInForm({ email, password })` - Fill sign-in form

**Form Submission:**
- `submitSignUp()` - Submit sign-up form
- `submitSignIn()` - Submit sign-in form

**Complete Workflows:**
- `signUp({ name, email, password })` - Complete sign-up workflow
- `signIn({ email, password })` - Complete sign-in workflow

**Waiting & Validation:**
- `waitForAuthSuccess(timeout?)` - Wait for successful auth redirect
- `waitForAuthRedirect(timeout?)` - Wait for redirect to sign-up
- `getValidationErrors()` - Get form validation errors

**Navigation Helpers:**
- `switchToSignIn()` - Click link to switch to sign-in
- `switchToSignUp()` - Click link to switch to sign-up
- `isOnSignUp()` - Check if on sign-up page
- `isOnSignIn()` - Check if on sign-in page

## Combined Usage Example

```typescript
import { test, expect } from "@playwright/test";
import { createSeedUser, cleanupSeedUser } from "./utils/database";
import { AuthPage } from "./utils/auth-page";

test("authenticated user flow", async ({ page }) => {
  // Create seed user
  const testUser = await createSeedUser();
  const auth = new AuthPage(page);
  
  try {
    // Sign in with seed user
    await auth.signIn({
      email: testUser.email,
      password: testUser.password
    });
    
    await auth.waitForAuthSuccess();
    
    // Now test authenticated functionality...
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*dashboard/);
    
  } finally {
    // Clean up
    await cleanupSeedUser(testUser.id);
  }
});
```

## Notes

- Seed users are created with `emailVerified: true` to skip verification
- Test user emails default to `test-${timestamp}@example.com` format
- All associated sessions and accounts are cleaned up with the user
- Auth page uses flexible selectors that work with your current form structure
