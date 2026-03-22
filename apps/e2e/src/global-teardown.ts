import { cleanupAllTestUsers } from "./utils/database";

/**
 * Global teardown function that runs after all tests complete
 * Cleans up any remaining test users from the database
 */
async function globalTeardown() {
  console.log("🧹 Running global teardown...");

  try {
    await cleanupAllTestUsers();
    console.log("✅ Global cleanup completed successfully");
  } catch (error) {
    console.error("❌ Global cleanup failed:", error);
    // Don't throw error to avoid failing the test run
    // Just log the error for debugging
  }
}

export default globalTeardown;
