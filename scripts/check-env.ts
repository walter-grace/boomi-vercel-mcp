#!/usr/bin/env tsx
/**
 * Check if required environment variables are set
 */

import { config } from "dotenv";

config({ path: ".env.local" });

const requiredVars = ["POSTGRES_URL", "AUTH_SECRET"];

const optionalVars = [
  "OPENROUTER_API_KEY",
  "BOOMI_ACCOUNT_ID",
  "BOOMI_USERNAME",
  "BOOMI_API_TOKEN",
  "BOOMI_PROFILE_NAME",
  "BOOMI_MCP_SERVER_URL",
  "AI_GATEWAY_API_KEY",
  "REDIS_URL",
];

console.log("🔍 Checking environment variables...\n");

let allRequired = true;

console.log("Required variables:");
for (const varName of requiredVars) {
  const value = process.env[varName];
  if (
    value &&
    value !== "" &&
    !value.includes("your-") &&
    !value.includes("example.com")
  ) {
    console.log(`  ✅ ${varName}: Set`);
  } else {
    console.log(`  ❌ ${varName}: Not set or using placeholder`);
    allRequired = false;
  }
}

console.log("\nOptional variables:");
for (const varName of optionalVars) {
  const value = process.env[varName];
  if (
    value &&
    value !== "" &&
    !value.includes("your-") &&
    !value.includes("example.com")
  ) {
    console.log(`  ✅ ${varName}: Set`);
  } else {
    console.log(`  ⚠️  ${varName}: Not set (optional)`);
  }
}

if (allRequired) {
  console.log("\n✅ All required environment variables are set!");
  process.exit(0);
} else {
  console.log("\n❌ Some required environment variables are missing!");
  console.log("Please update .env.local with your actual credentials.");
  process.exit(1);
}
