#!/usr/bin/env tsx
/**
 * Test script to list all Boomi connections using the list_connections MCP tool
 */

import { config } from "dotenv";
import { getBoomiMCPTools } from "../lib/ai/mcp-client";

config({ path: ".env.local" });

async function testListConnections() {
  console.log("🔧 Testing List All Boomi Connections");
  console.log("=".repeat(60));
  console.log("");

  // Load MCP tools
  console.log("1️⃣ Loading MCP tools...");
  const { clearMCPCache } = await import("../lib/ai/mcp-client");
  clearMCPCache();
  const tools = await getBoomiMCPTools();
  const toolNames = Object.keys(tools);
  console.log(`   ✅ Loaded ${toolNames.length} tools`);
  console.log(`   Available tools: ${toolNames.join(", ")}\n`);

  // Check if list_connections tool exists
  if (!tools.list_connections) {
    console.log("   ⚠️  list_connections tool not found");
    console.log("   This tool needs to be added to the MCP server first.");
    console.log("   See docs/MCP_SERVER_EXTENSION_SPEC.md for implementation details.\n");
    return;
  }

  // Test: List all connections
  console.log("2️⃣ Testing list_connections tool...");
  try {
    const listConnectionsTool = tools.list_connections;
    const profileName = process.env.BOOMI_PROFILE_NAME || "production";
    
    console.log(`   Profile: ${profileName}`);
    console.log("   Calling tool...\n");

    const result = await listConnectionsTool.execute({
      profile: profileName,
    });

    // Check for errors
    if (result && typeof result === "object" && "error" in result) {
      console.log("   ⚠️  Tool returned an error:");
      console.log(`      ${result.error}`);
      console.log("");
    } else {
      console.log("   ✅ Tool executed successfully!");
      console.log("   Result:");
      console.log(JSON.stringify(result, null, 2));
      console.log("");

      // Pretty print if it's a list
      if (result && typeof result === "object") {
        const items = result.result?.items || result.items || result.data || [];
        if (Array.isArray(items) && items.length > 0) {
          const count = result.result?.count || result.count || items.length;
          console.log(`   📋 Found ${count} connection(s):`);
          items.forEach((connection: any, index: number) => {
            const name = connection.name || connection.componentName || "Unknown";
            const id = connection.id || connection.component_id || "Unknown";
            const type = connection.type || connection.connectorType || "Unknown";
            console.log(`      ${index + 1}. ${name} (${type})`);
            console.log(`         ID: ${id}`);
          });
        } else {
          console.log("   📋 No connections found");
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

  // Test with filter
  console.log("3️⃣ Testing list_connections with filter...");
  try {
    const listConnectionsTool = tools.list_connections;
    const profileName = process.env.BOOMI_PROFILE_NAME || "production";
    
    console.log(`   Profile: ${profileName}`);
    console.log("   Filter: type = 'Database'");
    console.log("   Calling tool...\n");

    const result = await listConnectionsTool.execute({
      profile: profileName,
      filter: "type = 'Database'",
    });

    if (result && typeof result === "object" && "error" in result) {
      console.log("   ⚠️  Tool returned an error:");
      console.log(`      ${result.error}`);
    } else {
      console.log("   ✅ Filtered query executed successfully!");
      const items = result?.result?.items || result?.items || result?.data || [];
      const count = result?.result?.count || result?.count || items.length;
      console.log(`   📋 Found ${count} database connection(s)\n`);
    }
  } catch (error) {
    console.error("   ❌ Filtered query failed:");
    if (error instanceof Error) {
      console.error(`      Error: ${error.message}`);
    }
    console.log("");
  }

  console.log("=".repeat(60));
  console.log("✅ Test completed!");
  console.log("");
  console.log("💡 To use this in chat, ask:");
  console.log('   "List all my Boomi connections"');
  console.log('   "Show me all database connections"');
  console.log('   "What connections are available in production?"');
  console.log("");
}

testListConnections().catch(console.error);

