#!/usr/bin/env tsx
/**
 * Test script to list all Boomi maps using the list_maps MCP tool
 */

import { config } from "dotenv";
import { getBoomiMCPTools } from "../lib/ai/mcp-client";

config({ path: ".env.local" });

async function testListMaps() {
  console.log("🔧 Testing List All Boomi Maps");
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

  // Check if list_maps tool exists
  if (!tools.list_maps) {
    console.log("   ⚠️  list_maps tool not found");
    console.log("   This tool needs to be added to the MCP server first.");
    console.log("   See docs/MCP_SERVER_EXTENSION_SPEC.md for implementation details.\n");
    return;
  }

  // Test: List all maps
  console.log("2️⃣ Testing list_maps tool...");
  try {
    const listMapsTool = tools.list_maps;
    const profileName = process.env.BOOMI_PROFILE_NAME || "production";
    
    console.log(`   Profile: ${profileName}`);
    console.log("   Calling tool...\n");

    const result = await listMapsTool.execute({
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
          console.log(`   📋 Found ${count} map(s):`);
          items.forEach((map: any, index: number) => {
            const name = map.name || map.componentName || "Unknown";
            const id = map.id || map.component_id || "Unknown";
            const sourceType = map.sourceDocumentType || map.sourceType || "Unknown";
            const targetType = map.targetDocumentType || map.targetType || "Unknown";
            console.log(`      ${index + 1}. ${name}`);
            console.log(`         ID: ${id}`);
            console.log(`         Transformation: ${sourceType} → ${targetType}`);
          });
        } else {
          console.log("   📋 No maps found");
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
  console.log("3️⃣ Testing list_maps with filter...");
  try {
    const listMapsTool = tools.list_maps;
    const profileName = process.env.BOOMI_PROFILE_NAME || "production";
    
    console.log(`   Profile: ${profileName}`);
    console.log("   Filter: sourceDocumentType = 'HL7'");
    console.log("   Calling tool...\n");

    const result = await listMapsTool.execute({
      profile: profileName,
      filter: "sourceDocumentType = 'HL7'",
    });

    if (result && typeof result === "object" && "error" in result) {
      console.log("   ⚠️  Tool returned an error:");
      console.log(`      ${result.error}`);
    } else {
      console.log("   ✅ Filtered query executed successfully!");
      const items = result?.result?.items || result?.items || result?.data || [];
      const count = result?.result?.count || result?.count || items.length;
      console.log(`   📋 Found ${count} HL7 map(s)\n`);
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
  console.log('   "List all my Boomi maps"');
  console.log('   "Show me all HL7 transformation maps"');
  console.log('   "What maps are available in production?"');
  console.log("");
}

testListMaps().catch(console.error);

