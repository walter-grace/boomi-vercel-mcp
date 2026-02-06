#!/usr/bin/env tsx
/**
 * Test script to test component discovery tools: discover_process_components,
 * validate_process_structure
 */

import { config } from "dotenv";
import { getBoomiMCPTools } from "../lib/ai/mcp-client";

config({ path: ".env.local" });

async function testComponentDiscovery() {
  console.log("🔧 Testing Component Discovery Tools");
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

  const profileName = process.env.BOOMI_PROFILE_NAME || "production";

  // Test 1: Discover process components
  console.log("2️⃣ Testing discover_process_components tool...");
  try {
    if (!tools.discover_process_components) {
      console.log("   ⚠️  discover_process_components tool not found");
      console.log("   This tool needs to be added to the MCP server first.");
      console.log("   See docs/PROCESS_BUILDER_GUIDE.md for implementation details.\n");
    } else {
      const discoverTool = tools.discover_process_components;
      console.log(`   Profile: ${profileName}`);
      console.log("   Process Type: EDI");
      console.log("   Source Type: Database");
      console.log("   Target Type: HTTP");
      console.log("   Calling tool...\n");

      const result = await discoverTool.execute({
        profile: profileName,
        process_type: "EDI",
        source_type: "Database",
        target_type: "HTTP",
      });

      if (result && typeof result === "object" && "error" in result) {
        console.log("   ⚠️  Tool returned an error:");
        console.log(`      ${result.error}`);
        console.log("");
      } else {
        console.log("   ✅ Tool executed successfully!");
        const components = result?.result || result?.data || result;
        if (components && typeof components === "object") {
          console.log("   Discovered Components:");
          if (components.connections) {
            const conns = Array.isArray(components.connections) ? components.connections : [];
            console.log(`      Connections: ${conns.length}`);
            conns.slice(0, 3).forEach((conn: any, index: number) => {
              const name = conn.name || conn.componentName || "Unknown";
              console.log(`         ${index + 1}. ${name}`);
            });
          }
          if (components.maps) {
            const maps = Array.isArray(components.maps) ? components.maps : [];
            console.log(`      Maps: ${maps.length}`);
            maps.slice(0, 3).forEach((map: any, index: number) => {
              const name = map.name || map.componentName || "Unknown";
              console.log(`         ${index + 1}. ${name}`);
            });
          }
          if (components.rules) {
            const rules = Array.isArray(components.rules) ? components.rules : [];
            console.log(`      Business Rules: ${rules.length}`);
            rules.slice(0, 3).forEach((rule: any, index: number) => {
              const name = rule.name || rule.componentName || "Unknown";
              console.log(`         ${index + 1}. ${name}`);
            });
          }
          if (components.operations) {
            const ops = Array.isArray(components.operations) ? components.operations : [];
            console.log(`      Connector Operations: ${ops.length}`);
          }
        }
        console.log("");
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

  // Test 2: Discover components without filters
  console.log("3️⃣ Testing discover_process_components without filters...");
  try {
    if (tools.discover_process_components) {
      const discoverTool = tools.discover_process_components;
      console.log(`   Profile: ${profileName}`);
      console.log("   No filters (discover all components)");
      console.log("   Calling tool...\n");

      const result = await discoverTool.execute({
        profile: profileName,
      });

      if (result && typeof result === "object" && "error" in result) {
        console.log("   ⚠️  Tool returned an error:");
        console.log(`      ${result.error}`);
      } else {
        console.log("   ✅ Tool executed successfully!");
        const components = result?.result || result?.data || result;
        if (components && typeof components === "object") {
          const conns = Array.isArray(components.connections) ? components.connections : [];
          const maps = Array.isArray(components.maps) ? components.maps : [];
          const rules = Array.isArray(components.rules) ? components.rules : [];
          console.log(`   📋 Found ${conns.length} connections, ${maps.length} maps, ${rules.length} rules\n`);
        }
      }
    }
  } catch (error) {
    console.error("   ❌ Tool execution failed:");
    if (error instanceof Error) {
      console.error(`      Error: ${error.message}`);
    }
    console.log("");
  }

  // Test 3: Validate process structure
  console.log("4️⃣ Testing validate_process_structure tool...");
  try {
    if (!tools.validate_process_structure) {
      console.log("   ⚠️  validate_process_structure tool not found");
      console.log("   This tool needs to be added to the MCP server first.\n");
    } else {
      const validateTool = tools.validate_process_structure;
      console.log(`   Profile: ${profileName}`);
      console.log("   Process Structure: Test structure");
      console.log("   Calling tool...\n");

      // Create a sample process structure for validation
      const testStructure = {
        name: "Test Process",
        description: "Test process for validation",
        shapes: [
          {
            id: "shape-1",
            type: "START",
            position: { x: 100, y: 100 },
          },
          {
            id: "shape-2",
            type: "CONNECTOR",
            position: { x: 200, y: 100 },
          },
          {
            id: "shape-3",
            type: "END",
            position: { x: 300, y: 100 },
          },
        ],
        connectors: [
          { from: "shape-1", to: "shape-2" },
          { from: "shape-2", to: "shape-3" },
        ],
      };

      const result = await validateTool.execute({
        profile: profileName,
        process_structure: testStructure,
      });

      if (result && typeof result === "object" && "error" in result) {
        console.log("   ⚠️  Tool returned an error:");
        console.log(`      ${result.error}`);
        console.log("");
      } else {
        console.log("   ✅ Tool executed successfully!");
        const validation = result?.result || result?.data || result;
        if (validation && typeof validation === "object") {
          console.log("   Validation Results:");
          console.log(`      Valid: ${validation.valid !== false ? "Yes" : "No"}`);
          if (validation.errors && Array.isArray(validation.errors)) {
            console.log(`      Errors: ${validation.errors.length}`);
            validation.errors.slice(0, 3).forEach((err: any, index: number) => {
              console.log(`         ${index + 1}. ${err}`);
            });
          }
          if (validation.warnings && Array.isArray(validation.warnings)) {
            console.log(`      Warnings: ${validation.warnings.length}`);
            validation.warnings.slice(0, 3).forEach((warn: any, index: number) => {
              console.log(`         ${index + 1}. ${warn}`);
            });
          }
          if (validation.suggestions && Array.isArray(validation.suggestions)) {
            console.log(`      Suggestions: ${validation.suggestions.length}`);
          }
        }
        console.log("");
      }
    }
  } catch (error) {
    console.error("   ❌ Tool execution failed:");
    if (error instanceof Error) {
      console.error(`      Error: ${error.message}`);
    }
    console.log("");
  }

  console.log("=".repeat(60));
  console.log("✅ Test completed!");
  console.log("");
  console.log("💡 To use these tools in chat, ask:");
  console.log('   "What components are available for building an EDI process?"');
  console.log('   "Show me all database connections and maps for order processing"');
  console.log('   "Validate this process structure before creating it"');
  console.log('   "Check if my workflow configuration is valid"');
  console.log("");
  console.log("📚 See docs/PROCESS_BUILDER_GUIDE.md for more information");
  console.log("");
}

testComponentDiscovery().catch(console.error);

