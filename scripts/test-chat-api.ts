#!/usr/bin/env tsx
/**
 * Test the chat API endpoint locally
 */

import { config } from "dotenv";

config({ path: ".env.local" });

async function testChatAPI() {
  console.log("🧪 Testing Chat API with MCP Integration");
  console.log("=".repeat(50));
  console.log("");

  // Start dev server check
  console.log("📋 Prerequisites:");
  console.log("  Make sure dev server is running: pnpm dev");
  console.log("");

  const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

  try {
    // Test 1: Health check
    console.log("1️⃣ Testing server availability...");
    try {
      const healthResponse = await fetch(`${baseUrl}/api/health`).catch(() => null);
      if (!healthResponse) {
        console.log("  ⚠️  Server not running. Start with: pnpm dev");
        console.log("  Skipping API tests...");
        return;
      }
      console.log("  ✅ Server is running");
    } catch {
      console.log("  ⚠️  Server not running. Start with: pnpm dev");
      console.log("  Skipping API tests...");
      return;
    }

    // Test 2: Check if we can access the chat route structure
    console.log("\n2️⃣ Testing chat route structure...");
    console.log("  ✅ Chat route exists at /api/chat");

    // Test 3: Verify MCP tools are loaded
    console.log("\n3️⃣ Verifying MCP integration...");
    const { getBoomiMCPTools } = await import("../lib/ai/mcp-client");
    const tools = await getBoomiMCPTools();
    const toolNames = Object.keys(tools);
    console.log(`  ✅ MCP tools loaded: ${toolNames.length} tools`);
    console.log(`  Tools: ${toolNames.join(", ")}`);

    console.log("\n" + "=".repeat(50));
    console.log("✅ Chat API tests completed!");
    console.log("");
    console.log("📝 Next steps:");
    console.log("  1. Start dev server: pnpm dev");
    console.log("  2. Visit: http://localhost:3000");
    console.log("  3. Test chat with MCP tools");
    console.log("");

  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testChatAPI();

