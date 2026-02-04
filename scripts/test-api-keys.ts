#!/usr/bin/env tsx
/**
 * Test API keys are working correctly
 */

import { config } from "dotenv";

config({ path: ".env.local" });

async function testAPIKeys() {
  console.log("🔐 Testing API Keys");
  console.log("=".repeat(50));
  console.log("");

  const results: Array<{ name: string; status: boolean; message: string }> = [];

  // Test 1: OpenAI API Key
  console.log("1️⃣ Testing OpenAI API Key...");
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    results.push({
      name: "OpenAI API Key",
      status: false,
      message: "Not set in .env.local",
    });
    console.log("  ❌ OPENAI_API_KEY not found");
  } else {
    // Test actual API call
    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: {
          Authorization: `Bearer ${openaiKey}`,
        },
      });

      if (response.ok) {
        results.push({
          name: "OpenAI API Key",
          status: true,
          message: "Valid and working",
        });
        console.log("  ✅ OpenAI API key is valid and working");
      } else if (response.status === 401) {
        results.push({
          name: "OpenAI API Key",
          status: false,
          message: "Invalid API key (401 Unauthorized)",
        });
        console.log("  ❌ OpenAI API key is invalid (401)");
      } else {
        results.push({
          name: "OpenAI API Key",
          status: false,
          message: `API error: ${response.status}`,
        });
        console.log(`  ⚠️  OpenAI API returned: ${response.status}`);
      }
    } catch (error) {
      results.push({
        name: "OpenAI API Key",
        status: false,
        message: `Connection error: ${error instanceof Error ? error.message : String(error)}`,
      });
      console.log(`  ❌ Error testing OpenAI: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Test 2: Boomi Credentials
  console.log("\n2️⃣ Testing Boomi Credentials...");
  const boomiAccountId = process.env.BOOMI_ACCOUNT_ID;
  const boomiUsername = process.env.BOOMI_USERNAME;
  const boomiToken = process.env.BOOMI_API_TOKEN;

  if (!boomiAccountId || !boomiUsername || !boomiToken) {
    results.push({
      name: "Boomi Credentials",
      status: false,
      message: "Missing credentials",
    });
    console.log("  ⚠️  Some Boomi credentials missing");
  } else {
    results.push({
      name: "Boomi Credentials",
      status: true,
      message: "All credentials set",
    });
    console.log("  ✅ All Boomi credentials are set");
  }

  // Test 3: Database Connection
  console.log("\n3️⃣ Testing Database Connection...");
  const postgresUrl = process.env.POSTGRES_URL;
  if (!postgresUrl) {
    results.push({
      name: "Database Connection",
      status: false,
      message: "POSTGRES_URL not set",
    });
    console.log("  ❌ POSTGRES_URL not found");
  } else {
    try {
      const postgres = (await import("postgres")).default;
      const connection = postgres(postgresUrl, { max: 1 });
      await connection`SELECT 1`;
      await connection.end();
      results.push({
        name: "Database Connection",
        status: true,
        message: "Connected successfully",
      });
      console.log("  ✅ Database connection successful");
    } catch (error) {
      results.push({
        name: "Database Connection",
        status: false,
        message: `Connection failed: ${error instanceof Error ? error.message : String(error)}`,
      });
      console.log(`  ❌ Database connection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Test 4: MCP Server
  console.log("\n4️⃣ Testing MCP Server...");
  try {
    const response = await fetch(
      "https://boomi-mcp-server-replitzip.replit.app/health"
    );
    if (response.ok) {
      results.push({
        name: "MCP Server",
        status: true,
        message: "Server is healthy",
      });
      console.log("  ✅ MCP server is accessible");
    } else {
      results.push({
        name: "MCP Server",
        status: false,
        message: `Server returned: ${response.status}`,
      });
      console.log(`  ⚠️  MCP server returned: ${response.status}`);
    }
  } catch (error) {
    results.push({
      name: "MCP Server",
      status: false,
      message: `Connection error: ${error instanceof Error ? error.message : String(error)}`,
    });
    console.log(`  ❌ MCP server connection failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 Test Results Summary");
  console.log("=".repeat(50));
  
  const passed = results.filter((r) => r.status).length;
  const failed = results.filter((r) => !r.status).length;

  for (const result of results) {
    const icon = result.status ? "✅" : "❌";
    console.log(`${icon} ${result.name}: ${result.message}`);
  }

  console.log("\n" + "=".repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log("=".repeat(50));

  if (failed === 0) {
    console.log("\n🎉 All API keys and connections are working!");
    process.exit(0);
  } else {
    console.log("\n⚠️  Some tests failed. Please check the errors above.");
    process.exit(1);
  }
}

testAPIKeys().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

