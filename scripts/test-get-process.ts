#!/usr/bin/env tsx
/**
 * Test script to get process details using the manage_process MCP tool
 */

import { config } from "dotenv";
import { getBoomiMCPTools } from "../lib/ai/mcp-client";

config({ path: ".env.local" });

async function testGetProcess() {
  console.log("🔧 Testing Get Process Details");
  console.log("=".repeat(60));
  console.log("");

  // Load MCP tools
  console.log("1️⃣ Loading MCP tools...");
  const tools = await getBoomiMCPTools();
  const toolNames = Object.keys(tools);
  console.log(`   ✅ Loaded ${toolNames.length} tools\n`);

  // Test: Get process details
  console.log("2️⃣ Testing manage_process tool (get action)...");
  try {
    const manageProcessTool = tools.manage_process;
    if (!manageProcessTool) {
      throw new Error("manage_process tool not found");
    }

    const profileName = process.env.BOOMI_PROFILE_NAME || "production";
    const processId = "1e5efba1-d398-4420-97e2-29da11685980"; // Demo_Training_MLLP_HL7_Example

    console.log(`   Profile: ${profileName}`);
    console.log("   Action: get");
    console.log(`   Process ID: ${processId}`);
    console.log("   Calling tool...\n");

    const result = await manageProcessTool.execute({
      profile: profileName,
      action: "get",
      process_id: processId,
    });

    // Check for errors
    if (result && typeof result === "object" && "error" in result) {
      console.log("   ⚠️  Tool returned an error:");
      console.log(`      ${result.error}`);
      console.log("");

      // Check if it's the same server-side bug
      if (
        typeof result.error === "string" &&
        result.error.includes("missing 1 required positional argument")
      ) {
        console.log(
          "   🔍 This is the same server-side bug as the 'list' action."
        );
        console.log(
          "   The server is not receiving the 'action' parameter correctly."
        );
      }
    } else {
      console.log("   ✅ Tool executed successfully!");
      console.log("   Result:");
      console.log(JSON.stringify(result, null, 2));
      console.log("");

      // Pretty print process details
      if (result && typeof result === "object") {
        const processData = result.result || result.data || result;
        if (processData && typeof processData === "object") {
          console.log("   📋 Process Details:");
          if (processData.name || processData.componentName) {
            console.log(
              `      Name: ${processData.name || processData.componentName}`
            );
          }
          if (processData.component_id || processData.id) {
            console.log(
              `      ID: ${processData.component_id || processData.id}`
            );
          }
          if (processData.folder_name || processData.folderName) {
            console.log(
              `      Folder: ${processData.folder_name || processData.folderName}`
            );
          }
          if (processData.version) {
            console.log(`      Version: ${processData.version}`);
          }
          if (processData.created_date || processData.createdDate) {
            console.log(
              `      Created: ${processData.created_date || processData.createdDate}`
            );
          }
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
}

testGetProcess().catch(console.error);
