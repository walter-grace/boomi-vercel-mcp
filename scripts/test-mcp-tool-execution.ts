#!/usr/bin/env tsx
/**
 * Test MCP tool execution directly
 * Verifies tools can be called and return results
 */

import { config } from "dotenv";
import { getBoomiMCPTools } from "../lib/ai/mcp-client";

config({ path: ".env.local" });

async function testMCPToolExecution() {
  console.log("🔧 Testing MCP Tool Execution");
  console.log("=".repeat(60));
  console.log("");

  // Load MCP tools
  console.log("1️⃣ Loading MCP tools...");
  const tools = await getBoomiMCPTools();
  const toolNames = Object.keys(tools);
  console.log(`   ✅ Loaded ${toolNames.length} tools\n`);

  // Test 1: list_boomi_profiles
  console.log("2️⃣ Testing list_boomi_profiles tool...");
  try {
    const listProfilesTool = tools.list_boomi_profiles;
    if (!listProfilesTool) {
      throw new Error("Tool not found");
    }

    console.log("   Calling tool...");
    // The tool is already a tool() result, so execute directly
    const result = await listProfilesTool.execute({});
    console.log("   ✅ Tool executed successfully");
    console.log("   Result:", JSON.stringify(result, null, 2));
    console.log("");
  } catch (error) {
    console.error("   ❌ Tool execution failed:", error);
    console.log("");
  }

  // Test 2: boomi_account_info (requires profile)
  console.log("3️⃣ Testing boomi_account_info tool...");
  try {
    const accountInfoTool = tools.boomi_account_info;
    if (!accountInfoTool) {
      throw new Error("Tool not found");
    }

    const profileName = process.env.BOOMI_PROFILE_NAME || "production";
    console.log(`   Calling with profile: ${profileName}...`);
    const result = await accountInfoTool.execute({ profile: profileName });
    console.log("   ✅ Tool executed successfully");
    console.log("   Result:", JSON.stringify(result, null, 2));
    console.log("");
  } catch (error) {
    console.error("   ❌ Tool execution failed:", error);
    console.log("   (This is expected if profile doesn't exist yet)");
    console.log("");
  }

  console.log("=".repeat(60));
  console.log("✅ MCP tool execution test completed!");
  console.log("");
  console.log("📋 Next: Test with LLM in browser");
  console.log("   Run: pnpm dev");
  console.log("   Visit: http://localhost:3000");
  console.log("");
}

testMCPToolExecution().catch(console.error);

