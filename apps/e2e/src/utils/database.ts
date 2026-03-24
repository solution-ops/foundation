import { resolve } from "node:path";
import { createDb } from "@foundation/db/core";
import { accounts } from "@foundation/db/schemas/accounts";
import { categories } from "@foundation/db/schemas/categories";
import { items } from "@foundation/db/schemas/items";
import { sessions } from "@foundation/db/schemas/sessions";
import { type User, users } from "@foundation/db/schemas/users";
import { createId } from "@paralleldrive/cuid2";
import { hashPassword } from "better-auth/crypto";
import { config } from "dotenv";
import { eq, sql } from "drizzle-orm";

// Load environment variables from e2e app .env file
config({ path: resolve("../.env") });

const db = createDb();

export type TestUser = User & {
  password: string; // Add password to the type since we need it for testing
};

/**
 * Creates a seed user directly in the database.
 *
 * Inserts into `users` and `accounts` tables using the Neon HTTP driver
 * (bypasses Hyperdrive) so the row is visible immediately — regardless
 * of Hyperdrive's 60 s query-result cache.
 *
 * Passwords are hashed with the same scrypt algorithm Better Auth uses
 * (`better-auth/crypto`) so sign-in through the API works correctly.
 */
export async function createSeedUser(userData?: Partial<TestUser>): Promise<TestUser> {
  const seedEmail = userData?.email || process.env.SEED_USER_EMAIL || `test-${Date.now()}@example.com`;
  const seedPassword = userData?.password || process.env.SEED_USER_PASSWORD || "TestPassword123!";
  const testUser = {
    name: userData?.name || "Test User",
    email: seedEmail,
    password: seedPassword,
  };

  try {
    // If a stable email is configured, reuse the user if it already exists
    if (process.env.SEED_USER_EMAIL) {
      const existing = await getUserByEmail(testUser.email);
      if (existing) {
        const existingUser: TestUser = {
          ...existing,
          password: testUser.password,
        } as TestUser;
        console.log(`Reusing existing seed user: ${existing.email} (ID: ${existing.id})`);
        return existingUser;
      }
    }

    const now = new Date();
    const userId = createId();
    const accountId = createId();
    const hashedPassword = await hashPassword(testUser.password);

    // Insert user
    const [createdUser] = await db
      .insert(users)
      .values({
        id: userId,
        name: testUser.name,
        email: testUser.email,
        emailVerified: true,
        image: `https://api.dicebear.com/8.x/notionists/svg?seed=${encodeURIComponent(testUser.name.trim().toLowerCase())}`,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Insert credential account (mirrors what Better Auth sign-up creates)
    await db.insert(accounts).values({
      id: accountId,
      accountId: userId,
      providerId: "credential",
      userId,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    });

    const result: TestUser = {
      ...createdUser,
      password: testUser.password,
    };

    console.log(`Created seed user directly in DB: ${result.email} (ID: ${result.id})`);
    return result;
  } catch (error) {
    console.error("Failed to create seed user:", error);
    throw error;
  }
}

/**
 * Cleans up a test user and all associated data
 * @param userId - The ID of the user to clean up
 */
export async function cleanupSeedUser(userId: string): Promise<void> {
  try {
    // Clean up in order: tasks, categories, sessions, accounts, then user
    await db.delete(items).where(eq(items.userId, userId));
    await db.delete(categories).where(eq(categories.userId, userId));
    await db.delete(sessions).where(eq(sessions.userId, userId));
    await db.delete(accounts).where(eq(accounts.userId, userId));
    await db.delete(users).where(eq(users.id, userId));

    console.log(`Cleaned up seed user: ${userId}`);
  } catch (error) {
    console.error(`Failed to cleanup seed user ${userId}:`, error);
    throw error;
  }
}

/**
 * Cleans up all test users (users with email starting with "test-")
 */
export async function cleanupAllTestUsers(): Promise<void> {
  try {
    // If a specific seed email is configured, only remove that user
    const seedEmail = process.env.SEED_USER_EMAIL;
    let testUsers: Array<{ id: string }> = [];
    if (seedEmail) {
      const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, seedEmail)).limit(1);
      testUsers = existing || [];
    } else {
      // Otherwise, clean up users created by tests
      testUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(sql`${users.email} LIKE 'test-%' OR ${users.email} LIKE 'e2e-%'`);
    }

    // Clean up each test user
    for (const user of testUsers) {
      await cleanupSeedUser(user.id);
    }

    console.log(`Cleaned up ${testUsers.length} test users`);
  } catch (error) {
    console.error("Failed to cleanup test users:", error);
    throw error;
  }
}

/**
 * Deletes all tasks for a given user — used to ensure clean state before tests
 */
export async function cleanupUserTasks(userId: string): Promise<void> {
  await db.delete(items).where(eq(items.userId, userId));
}

/**
 * Deletes all categories for a given user — used to ensure clean state before tests
 */
export async function cleanupUserCategories(userId: string): Promise<void> {
  await db.delete(categories).where(eq(categories.userId, userId));
}

/**
 * Gets a user by email
 * @param email - The email to search for
 * @returns The user if found, null otherwise
 */
export async function getUserByEmail(email: string) {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    return user || null;
  } catch (error) {
    console.error(`Failed to get user by email ${email}:`, error);
    throw error;
  }
}
