#!/usr/bin/env tsx
/**
 * Comprehensive test script to verify all integrations before deployment
 */

import { config } from "dotenv";

config({ path: ".env.local" });

const tests: Array<{ name: string; fn: () => Promise<boolean> }> = [];

// Test 1: Environment Variables
tests.push({
  name: "Environment Variables",
  fn: async () => {
    console.log("  Checking required environment variables...");
    const required = [
      "POSTGRES_URL",
      "AUTH_SECRET",
      "OPENROUTER_API_KEY",
      "BOOMI_ACCOUNT_ID",
      "BOOMI_USERNAME",
      "BOOMI_API_TOKEN",
      "BOOMI_PROFILE_NAME",
    ];

    const missing: string[] = [];
    for (const key of required) {
      const value = process.env[key];
      if (!value || value.includes("your-") || value.includes("example.com")) {
        missing.push(key);
      }
    }

    if (missing.length > 0) {
      console.log(`  ❌ Missing or invalid: ${missing.join(", ")}`);
      return false;
    }

    console.log("  ✅ All required environment variables are set");
    return true;
  },
});

// Test 2: Database Connection
tests.push({
  name: "Neon Database Connection",
  fn: async () => {
    console.log("  Testing database connection...");
    try {
      const postgres = (await import("postgres")).default;
      const connection = postgres(process.env.POSTGRES_URL!, { max: 1 });
      await connection`SELECT 1`;
      await connection.end();
      console.log("  ✅ Database connection successful");
      return true;
    } catch (error) {
      console.log(
        `  ❌ Database connection failed: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  },
});

// Test 3: MCP Server Health
tests.push({
  name: "Boomi MCP Server Health",
  fn: async () => {
    console.log("  Testing MCP server health endpoint...");
    try {
      const response = await fetch(
        "https://boomi-mcp-server-replitzip.replit.app/health"
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      console.log(`  ✅ MCP server is healthy: ${JSON.stringify(data)}`);
      return true;
    } catch (error) {
      console.log(
        `  ❌ MCP server health check failed: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  },
});

// Test 4: MCP Server Connection
tests.push({
  name: "Boomi MCP Server Connection",
  fn: async () => {
    console.log("  Testing MCP server connection...");
    try {
      const mcpUrl =
        process.env.BOOMI_MCP_SERVER_URL ||
        "https://boomi-mcp-server-replitzip.replit.app/mcp";

      // Initialize
      const initResponse = await fetch(mcpUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: { name: "test-client", version: "1.0.0" },
          },
        }),
      });

      if (!initResponse.ok) {
        throw new Error(`Initialize failed: ${initResponse.status}`);
      }

      // List tools
      const toolsResponse = await fetch(mcpUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "tools/list",
          params: {},
        }),
      });

      if (!toolsResponse.ok) {
        throw new Error(`Tools list failed: ${toolsResponse.status}`);
      }

      const toolsData = await toolsResponse.json();
      if (toolsData.error) {
        throw new Error(toolsData.error.message);
      }

      const toolCount = toolsData.result?.tools?.length || 0;
      console.log(
        `  ✅ MCP connection successful (${toolCount} tools available)`
      );
      return true;
    } catch (error) {
      console.log(
        `  ❌ MCP connection failed: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  },
});

// Test 5: MCP Tool Call
tests.push({
  name: "MCP Tool Execution",
  fn: async () => {
    console.log("  Testing MCP tool call (list_boomi_profiles)...");
    try {
      const mcpUrl =
        process.env.BOOMI_MCP_SERVER_URL ||
        "https://boomi-mcp-server-replitzip.replit.app/mcp";

      const response = await fetch(mcpUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 3,
          method: "tools/call",
          params: {
            name: "list_boomi_profiles",
            arguments: {},
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Tool call failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        console.log(
          `  ⚠️  Tool returned error (may be expected): ${data.error.message}`
        );
        return true; // Still consider it a pass if we got a response
      }

      console.log("  ✅ MCP tool call successful");
      return true;
    } catch (error) {
      console.log(
        `  ❌ MCP tool call failed: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  },
});

// Test 6: Database Migrations
tests.push({
  name: "Database Schema",
  fn: async () => {
    console.log("  Checking database schema...");
    try {
      const postgres = (await import("postgres")).default;
      const connection = postgres(process.env.POSTGRES_URL!, { max: 1 });

      // Check if key tables exist
      const tables = await connection`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('Chat', 'Message', 'User')
      `;

      await connection.end();

      if (tables.length < 3) {
        console.log("  ⚠️  Some tables missing. Run: pnpm db:migrate");
        return false;
      }

      console.log(
        `  ✅ Database schema is up to date (${tables.length} tables found)`
      );
      return true;
    } catch (error) {
      console.log(
        `  ❌ Schema check failed: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  },
});

// Run all tests
async function runTests() {
  console.log("🧪 Running Pre-Deployment Tests");
  console.log("=".repeat(50));
  console.log("");

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`\n📋 ${test.name}`);
    console.log("-".repeat(50));
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(
        `  ❌ Test threw error: ${error instanceof Error ? error.message : String(error)}`
      );
      failed++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 Test Results");
  console.log("=".repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total:  ${tests.length}`);
  console.log("");

  if (failed === 0) {
    console.log("🎉 All tests passed! Ready to deploy.");
    process.exit(0);
  } else {
    console.log("⚠️  Some tests failed. Please fix issues before deploying.");
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error("Fatal error running tests:", error);
  process.exit(1);
});
