#!/usr/bin/env tsx
/**
 * Test script to list all Boomi processes using the manage_process MCP tool
 */

import { config } from "dotenv";
import { getBoomiMCPTools } from "../lib/ai/mcp-client";

config({ path: ".env.local" });

async function testListProcesses() {
  console.log("🔧 Testing List All Boomi Processes");
  console.log("=".repeat(60));
  console.log("");

  // Load MCP tools
  console.log("1️⃣ Loading MCP tools...");
  // Clear cache first to ensure fresh tools
  const { clearMCPCache } = await import("../lib/ai/mcp-client");
  clearMCPCache();
  const tools = await getBoomiMCPTools();
  const toolNames = Object.keys(tools);
  console.log(`   ✅ Loaded ${toolNames.length} tools`);
  console.log(`   Available tools: ${toolNames.join(", ")}\n`);

  // Test: List all processes
  console.log("2️⃣ Testing manage_process tool (list action)...");
  try {
    const manageProcessTool = tools.manage_process;
    if (!manageProcessTool) {
      throw new Error("manage_process tool not found");
    }

    const profileName = process.env.BOOMI_PROFILE_NAME || "production";
    console.log(`   Profile: ${profileName}`);
    console.log(`   Action: list`);
    console.log("   Calling tool...\n");

    const result = await manageProcessTool.execute({
      profile: profileName,
      action: "list",
    });

    // Check for errors
    if (result && typeof result === "object" && "error" in result) {
      console.log("   ⚠️  Tool returned an error:");
      console.log(`      ${result.error}`);
      console.log("");
      console.log("   🔍 This appears to be a server-side issue.");
      console.log("   The MCP server is not receiving the 'action' parameter correctly.");
      console.log("");
      console.log("   💡 Possible solutions:");
      console.log("      1. Check if the MCP server needs to be updated");
      console.log("      2. Try using the chat interface - the AI might handle it differently");
      console.log("      3. Contact the MCP server maintainer about this bug");
      console.log("");
    } else {
      console.log("   ✅ Tool executed successfully!");
      console.log("   Result:");
      console.log(JSON.stringify(result, null, 2));
      console.log("");

      // Pretty print if it's a list
      if (result && typeof result === "object") {
        if (Array.isArray(result)) {
          console.log(`   📋 Found ${result.length} processes:`);
          result.forEach((process: any, index: number) => {
            console.log(`      ${index + 1}. ${JSON.stringify(process)}`);
          });
        } else if (result.processes && Array.isArray(result.processes)) {
          console.log(`   📋 Found ${result.processes.length} processes:`);
          result.processes.forEach((process: any, index: number) => {
            console.log(`      ${index + 1}. ${JSON.stringify(process)}`);
          });
        } else if (result.data && Array.isArray(result.data)) {
          console.log(`   📋 Found ${result.data.length} processes:`);
          result.data.forEach((process: any, index: number) => {
            console.log(`      ${index + 1}. ${JSON.stringify(process)}`);
          });
        }
      }
    }
  } catch (error) {
    console.error("   ❌ Tool execution failed:");
    if (error instanceof Error) {
      console.error(`      Error: ${error.message}`);
      if (error.stack) {
        console.error(`      Stack: ${error.stack}`);
      }
    } else {
      console.error("      Unknown error:", error);
    }
    console.log("");
  }

  console.log("=".repeat(60));
  console.log("✅ Test completed!");
  console.log("");
  console.log("💡 To use this in chat, ask:");
  console.log('   "Show me all my Boomi processes"');
  console.log('   "List all processes in production"');
  console.log("");
}

testListProcesses().catch(console.error);

