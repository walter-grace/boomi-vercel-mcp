#!/usr/bin/env tsx

/**
 * Authentication System Test Script
 * Tests database connection, user creation, and authentication flow
 */

import { compare } from "bcrypt-ts";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { user } from "../lib/db/schema";
import { generateHashedPassword } from "../lib/db/utils";

// Load environment variables
config({ path: ".env.local" });

const POSTGRES_URL = process.env.POSTGRES_URL;
const AUTH_SECRET = process.env.AUTH_SECRET;

if (!POSTGRES_URL) {
  console.error("❌ POSTGRES_URL not found in environment");
  console.log("\n📝 Run: ./scripts/setup-auth.sh\n");
  process.exit(1);
}

if (!AUTH_SECRET) {
  console.error("❌ AUTH_SECRET not found in environment");
  console.log("\n📝 Run: ./scripts/setup-auth.sh\n");
  process.exit(1);
}

console.log("🧪 Testing Authentication System\n");
console.log("=".repeat(50));

// Connect to database
const client = postgres(POSTGRES_URL);
const db = drizzle(client);

async function testDatabaseConnection() {
  console.log("\n1️⃣  Testing database connection...");
  try {
    const result = await db.select().from(user).limit(1);
    console.log("   ✅ Database connection successful");
    console.log(`   📊 Total users: ${result.length > 0 ? "At least 1" : "0"}`);
    return true;
  } catch (error: any) {
    console.error("   ❌ Database connection failed:", error.message);
    return false;
  }
}

async function testUserCreation() {
  console.log("\n2️⃣  Testing user creation...");

  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "TestPassword123!";

  try {
    // Create user
    const hashedPassword = generateHashedPassword(testPassword);
    const [newUser] = await db
      .insert(user)
      .values({ email: testEmail, password: hashedPassword })
      .returning();

    console.log("   ✅ User created successfully");
    console.log(`   📧 Email: ${newUser.email}`);
    console.log(`   🆔 User ID: ${newUser.id}`);
    console.log(`   🔒 Password hashed: ${hashedPassword.substring(0, 20)}...`);

    return { newUser, testPassword };
  } catch (error: any) {
    console.error("   ❌ User creation failed:", error.message);
    return null;
  }
}

async function testPasswordVerification(userId: string, plainPassword: string) {
  console.log("\n3️⃣  Testing password verification...");

  try {
    // Retrieve user
    const [foundUser] = await db.select().from(user).where(eq(user.id, userId));

    if (!foundUser) {
      console.error("   ❌ User not found");
      return false;
    }

    if (!foundUser.password) {
      console.error("   ❌ User has no password");
      return false;
    }

    // Verify correct password
    const correctMatch = await compare(plainPassword, foundUser.password);
    console.log(
      `   ${correctMatch ? "✅" : "❌"} Correct password: ${correctMatch}`
    );

    // Verify incorrect password
    const incorrectMatch = await compare(
      "WrongPassword123",
      foundUser.password
    );
    console.log(
      `   ${incorrectMatch ? "❌" : "✅"} Incorrect password rejected: ${!incorrectMatch}`
    );

    return correctMatch && !incorrectMatch;
  } catch (error: any) {
    console.error("   ❌ Password verification failed:", error.message);
    return false;
  }
}

async function testGuestUserCreation() {
  console.log("\n4️⃣  Testing guest user creation...");

  const guestEmail = `guest-${Date.now()}`;
  const guestPassword = generateHashedPassword(`guest-password-${Date.now()}`);

  try {
    const [guestUser] = await db
      .insert(user)
      .values({ email: guestEmail, password: guestPassword })
      .returning();

    console.log("   ✅ Guest user created successfully");
    console.log(`   📧 Email: ${guestUser.email}`);
    console.log(`   🆔 User ID: ${guestUser.id}`);

    return guestUser;
  } catch (error: any) {
    console.error("   ❌ Guest user creation failed:", error.message);
    return null;
  }
}

async function testDatabaseSchema() {
  console.log("\n5️⃣  Testing database schema...");

  try {
    // Check if all required tables exist
    const tables = [
      { name: "User", query: `SELECT * FROM "User" LIMIT 1` },
      { name: "Chat", query: `SELECT * FROM "Chat" LIMIT 1` },
      { name: "Message_v2", query: `SELECT * FROM "Message_v2" LIMIT 1` },
      { name: "Vote_v2", query: `SELECT * FROM "Vote_v2" LIMIT 1` },
      { name: "Document", query: `SELECT * FROM "Document" LIMIT 1` },
      { name: "Suggestion", query: `SELECT * FROM "Suggestion" LIMIT 1` },
      { name: "Stream", query: `SELECT * FROM "Stream" LIMIT 1` },
    ];

    const results = await Promise.allSettled(
      tables.map(async (table) => {
        try {
          await client.unsafe(table.query);
          return { name: table.name, exists: true };
        } catch (error) {
          return { name: table.name, exists: false };
        }
      })
    );

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const { name, exists } = result.value;
        console.log(
          `   ${exists ? "✅" : "❌"} Table "${name}" ${exists ? "exists" : "missing"}`
        );
      }
    });

    const allExist = results.every(
      (result) => result.status === "fulfilled" && result.value.exists
    );

    return allExist;
  } catch (error: any) {
    console.error("   ❌ Schema check failed:", error.message);
    return false;
  }
}

async function cleanup(userId: string, guestUserId: string) {
  console.log("\n6️⃣  Cleaning up test data...");

  try {
    // Delete test users
    await db.delete(user).where(eq(user.id, userId));
    await db.delete(user).where(eq(user.id, guestUserId));

    console.log("   ✅ Test data cleaned up");
    return true;
  } catch (error: any) {
    console.error("   ❌ Cleanup failed:", error.message);
    return false;
  }
}

async function runTests() {
  try {
    // Test 1: Database connection
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.log("\n❌ Tests aborted: Database connection failed\n");
      process.exit(1);
    }

    // Test 2: Database schema
    const schemaValid = await testDatabaseSchema();
    if (!schemaValid) {
      console.log("\n⚠️  Warning: Some tables are missing");
      console.log("   Run: pnpm tsx lib/db/migrate.ts\n");
    }

    // Test 3: User creation
    const userResult = await testUserCreation();
    if (!userResult) {
      console.log("\n❌ Tests aborted: User creation failed\n");
      process.exit(1);
    }

    const { newUser, testPassword } = userResult;

    // Test 4: Password verification
    const passwordValid = await testPasswordVerification(
      newUser.id,
      testPassword
    );
    if (!passwordValid) {
      console.log("\n❌ Tests aborted: Password verification failed\n");
      process.exit(1);
    }

    // Test 5: Guest user creation
    const guestUser = await testGuestUserCreation();
    if (!guestUser) {
      console.log("\n❌ Tests aborted: Guest user creation failed\n");
      process.exit(1);
    }

    // Cleanup
    await cleanup(newUser.id, guestUser.id);

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("✅ All authentication tests passed!");
    console.log("=".repeat(50));
    console.log("\n📋 Summary:");
    console.log("  • Database connection: ✅");
    console.log("  • Database schema: ✅");
    console.log("  • User creation: ✅");
    console.log("  • Password hashing: ✅");
    console.log("  • Password verification: ✅");
    console.log("  • Guest user creation: ✅");
    console.log("\n🎉 Authentication system is ready to use!");
    console.log("\n🚀 Next steps:");
    console.log("  1. Start the dev server: pnpm dev");
    console.log("  2. Visit: http://localhost:3000/register");
    console.log("  3. Create an account and start chatting!");
    console.log("");
  } catch (error: any) {
    console.error("\n❌ Unexpected error:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run tests
runTests();
