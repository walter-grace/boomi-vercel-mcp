#!/usr/bin/env tsx
/**
 * Test script to test the generic query_component MCP tool
 */

import { config } from "dotenv";
import { getBoomiMCPTools } from "../lib/ai/mcp-client";

config({ path: ".env.local" });

async function testQueryComponent() {
  console.log("🔧 Testing Generic Query Component Tool");
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

  // Check if query_component tool exists
  if (!tools.query_component) {
    console.log("   ⚠️  query_component tool not found");
    console.log("   This tool needs to be added to the MCP server first.");
    console.log("   See docs/MCP_SERVER_EXTENSION_SPEC.md for implementation details.\n");
    return;
  }

  const profileName = process.env.BOOMI_PROFILE_NAME || "production";

  // Test 1: Query Connections
  console.log("2️⃣ Testing query_component with object_type='Connection'...");
  try {
    const queryComponentTool = tools.query_component;
    
    console.log(`   Profile: ${profileName}`);
    console.log("   Object Type: Connection");
    console.log("   Calling tool...\n");

    const result = await queryComponentTool.execute({
      profile: profileName,
      object_type: "Connection",
    });

    if (result && typeof result === "object" && "error" in result) {
      console.log("   ⚠️  Tool returned an error:");
      console.log(`      ${result.error}`);
    } else {
      console.log("   ✅ Query executed successfully!");
      const items = result?.result?.items || result?.items || result?.data || [];
      const count = result?.result?.count || result?.count || items.length;
      console.log(`   📋 Found ${count} connection(s)\n`);
    }
  } catch (error) {
    console.error("   ❌ Query failed:");
    if (error instanceof Error) {
      console.error(`      Error: ${error.message}`);
    }
    console.log("");
  }

  // Test 2: Query Maps
  console.log("3️⃣ Testing query_component with object_type='Map'...");
  try {
    const queryComponentTool = tools.query_component;
    
    console.log(`   Profile: ${profileName}`);
    console.log("   Object Type: Map");
    console.log("   Calling tool...\n");

    const result = await queryComponentTool.execute({
      profile: profileName,
      object_type: "Map",
    });

    if (result && typeof result === "object" && "error" in result) {
      console.log("   ⚠️  Tool returned an error:");
      console.log(`      ${result.error}`);
    } else {
      console.log("   ✅ Query executed successfully!");
      const items = result?.result?.items || result?.items || result?.data || [];
      const count = result?.result?.count || result?.count || items.length;
      console.log(`   📋 Found ${count} map(s)\n`);
    }
  } catch (error) {
    console.error("   ❌ Query failed:");
    if (error instanceof Error) {
      console.error(`      Error: ${error.message}`);
    }
    console.log("");
  }

  // Test 3: Query BusinessRules
  console.log("4️⃣ Testing query_component with object_type='BusinessRule'...");
  try {
    const queryComponentTool = tools.query_component;
    
    console.log(`   Profile: ${profileName}`);
    console.log("   Object Type: BusinessRule");
    console.log("   Calling tool...\n");

    const result = await queryComponentTool.execute({
      profile: profileName,
      object_type: "BusinessRule",
    });

    if (result && typeof result === "object" && "error" in result) {
      console.log("   ⚠️  Tool returned an error:");
      console.log(`      ${result.error}`);
    } else {
      console.log("   ✅ Query executed successfully!");
      const items = result?.result?.items || result?.items || result?.data || [];
      const count = result?.result?.count || result?.count || items.length;
      console.log(`   📋 Found ${count} business rule(s)\n`);
    }
  } catch (error) {
    console.error("   ❌ Query failed:");
    if (error instanceof Error) {
      console.error(`      Error: ${error.message}`);
    }
    console.log("");
  }

  // Test 4: Query with filter
  console.log("5️⃣ Testing query_component with filter...");
  try {
    const queryComponentTool = tools.query_component;
    
    console.log(`   Profile: ${profileName}`);
    console.log("   Object Type: Certificate");
    console.log("   Filter: type = 'SSL'");
    console.log("   Calling tool...\n");

    const result = await queryComponentTool.execute({
      profile: profileName,
      object_type: "Certificate",
      filter: "type = 'SSL'",
    });

    if (result && typeof result === "object" && "error" in result) {
      console.log("   ⚠️  Tool returned an error:");
      console.log(`      ${result.error}`);
    } else {
      console.log("   ✅ Filtered query executed successfully!");
      const items = result?.result?.items || result?.items || result?.data || [];
      const count = result?.result?.count || result?.count || items.length;
      console.log(`   📋 Found ${count} SSL certificate(s)\n`);
    }
  } catch (error) {
    console.error("   ❌ Filtered query failed:");
    if (error instanceof Error) {
      console.error(`      Error: ${error.message}`);
    }
    console.log("");
  }

  // Test 5: Invalid object type
  console.log("6️⃣ Testing query_component with invalid object_type...");
  try {
    const queryComponentTool = tools.query_component;
    
    console.log(`   Profile: ${profileName}`);
    console.log("   Object Type: InvalidType");
    console.log("   Calling tool...\n");

    const result = await queryComponentTool.execute({
      profile: profileName,
      object_type: "InvalidType",
    });

    if (result && typeof result === "object" && "error" in result) {
      console.log("   ✅ Error handling works correctly:");
      console.log(`      ${result.error}`);
    } else {
      console.log("   ⚠️  Expected error for invalid object type, but got:");
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.log("   ✅ Error caught (expected for invalid type):");
    if (error instanceof Error) {
      console.log(`      ${error.message}`);
    }
  }
  console.log("");

  console.log("=".repeat(60));
  console.log("✅ Test completed!");
  console.log("");
  console.log("💡 To use this in chat, ask:");
  console.log('   "Query all connections"');
  console.log('   "List all maps using query_component"');
  console.log('   "Show me all business rules"');
  console.log('   "Query certificates with type SSL"');
  console.log("");
}

testQueryComponent().catch(console.error);

