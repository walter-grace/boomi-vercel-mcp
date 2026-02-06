#!/usr/bin/env tsx
/**
 * Test script to test Atom API tools: list_atoms, get_atom, query_atom_status
 */

import { config } from "dotenv";
import { getBoomiMCPTools } from "../lib/ai/mcp-client";

config({ path: ".env.local" });

async function testAtomAPI() {
  console.log("🔧 Testing Boomi Atom API Tools");
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

  // Test 1: List atoms
  console.log("2️⃣ Testing list_atoms tool...");
  try {
    if (!tools.list_atoms) {
      console.log("   ⚠️  list_atoms tool not found");
      console.log("   This tool needs to be added to the MCP server first.");
      console.log("   See docs/ATOM_API_GUIDE.md for implementation details.\n");
    } else {
      const listAtomsTool = tools.list_atoms;
      console.log(`   Profile: ${profileName}`);
      console.log("   Calling tool...\n");

      const result = await listAtomsTool.execute({
        profile: profileName,
      });

      if (result && typeof result === "object" && "error" in result) {
        console.log("   ⚠️  Tool returned an error:");
        console.log(`      ${result.error}`);
        console.log("");
      } else {
        console.log("   ✅ Tool executed successfully!");
        const items = result?.result?.items || result?.items || result?.data || [];
        const count = result?.result?.count || result?.count || items.length;
        console.log(`   📋 Found ${count} atom(s):`);
        if (Array.isArray(items) && items.length > 0) {
          items.forEach((atom: any, index: number) => {
            const name = atom.name || "Unknown";
            const id = atom.id || "Unknown";
            const type = atom.type || "Unknown";
            const status = atom.status || "Unknown";
            const version = atom.currentVersion || "Unknown";
            console.log(`      ${index + 1}. ${name} (${type})`);
            console.log(`         ID: ${id}`);
            console.log(`         Status: ${status}`);
            console.log(`         Version: ${version}`);
          });
        } else {
          console.log("   📋 No atoms found");
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

  // Test 2: Get atom details (if we have an atom ID)
  console.log("3️⃣ Testing get_atom tool...");
  try {
    if (!tools.get_atom) {
      console.log("   ⚠️  get_atom tool not found");
      console.log("   This tool needs to be added to the MCP server first.\n");
    } else {
      const atomId = process.env.BOOMI_TEST_ATOM_ID;
      if (!atomId) {
        console.log("   ⚠️  BOOMI_TEST_ATOM_ID not set in environment");
        console.log("   Skipping get_atom test. Set BOOMI_TEST_ATOM_ID to test this tool.\n");
      } else {
        const getAtomTool = tools.get_atom;
        console.log(`   Profile: ${profileName}`);
        console.log(`   Atom ID: ${atomId}`);
        console.log("   Calling tool...\n");

        const result = await getAtomTool.execute({
          profile: profileName,
          atom_id: atomId,
        });

        if (result && typeof result === "object" && "error" in result) {
          console.log("   ⚠️  Tool returned an error:");
          console.log(`      ${result.error}`);
          console.log("");
        } else {
          console.log("   ✅ Tool executed successfully!");
          console.log("   Atom Details:");
          const atom = result?.result || result?.data || result;
          if (atom && typeof atom === "object") {
            console.log(`      Name: ${atom.name || "Unknown"}`);
            console.log(`      Type: ${atom.type || "Unknown"}`);
            console.log(`      Status: ${atom.status || "Unknown"}`);
            console.log(`      Version: ${atom.currentVersion || "Unknown"}`);
            console.log(`      Installed: ${atom.dateInstalled || "Unknown"}`);
            if (atom.capabilities) {
              console.log(`      Capabilities: ${atom.capabilities.join(", ")}`);
            }
            if (atom.cloudId) {
              console.log(`      Cloud ID: ${atom.cloudId}`);
            }
          }
          console.log("");
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

  // Test 3: Query atom status
  console.log("4️⃣ Testing query_atom_status tool...");
  try {
    if (!tools.query_atom_status) {
      console.log("   ⚠️  query_atom_status tool not found");
      console.log("   This tool needs to be added to the MCP server first.\n");
    } else {
      const atomId = process.env.BOOMI_TEST_ATOM_ID;
      if (!atomId) {
        console.log("   ⚠️  BOOMI_TEST_ATOM_ID not set in environment");
        console.log("   Skipping query_atom_status test.\n");
      } else {
        const queryAtomStatusTool = tools.query_atom_status;
        console.log(`   Profile: ${profileName}`);
        console.log(`   Atom ID: ${atomId}`);
        console.log("   Calling tool...\n");

        const result = await queryAtomStatusTool.execute({
          profile: profileName,
          atom_id: atomId,
        });

        if (result && typeof result === "object" && "error" in result) {
          console.log("   ⚠️  Tool returned an error:");
          console.log(`      ${result.error}`);
          console.log("");
        } else {
          console.log("   ✅ Tool executed successfully!");
          console.log("   Atom Status:");
          const status = result?.result || result?.data || result;
          if (status && typeof status === "object") {
            console.log(`      Status: ${status.status || "Unknown"}`);
            console.log(`      Version: ${status.currentVersion || "Unknown"}`);
            if (status.capabilities) {
              console.log(`      Capabilities: ${status.capabilities.join(", ")}`);
            }
            if (status.health) {
              console.log(`      Health: ${status.health}`);
            }
          }
          console.log("");
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

  // Test 4: List atoms with filter
  console.log("5️⃣ Testing list_atoms with filter...");
  try {
    if (tools.list_atoms) {
      const listAtomsTool = tools.list_atoms;
      console.log(`   Profile: ${profileName}`);
      console.log("   Filter: type = 'Cloud'");
      console.log("   Calling tool...\n");

      const result = await listAtomsTool.execute({
        profile: profileName,
        filter: "type = 'Cloud'",
      });

      if (result && typeof result === "object" && "error" in result) {
        console.log("   ⚠️  Tool returned an error:");
        console.log(`      ${result.error}`);
      } else {
        console.log("   ✅ Filtered query executed successfully!");
        const items = result?.result?.items || result?.items || result?.data || [];
        const count = result?.result?.count || result?.count || items.length;
        console.log(`   📋 Found ${count} cloud atom(s)\n`);
      }
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
  console.log("💡 To use these tools in chat, ask:");
  console.log('   "List all my atoms"');
  console.log('   "Show me all cloud runtimes"');
  console.log('   "Get details for atom xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"');
  console.log('   "Check the status of my production atom"');
  console.log("");
  console.log("📚 See docs/ATOM_API_GUIDE.md for more information");
  console.log("");
}

testAtomAPI().catch(console.error);

