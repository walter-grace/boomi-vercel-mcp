#!/usr/bin/env tsx
/**
 * Test script to list processes in the Process Library folder
 */

import { config } from "dotenv";
import { getBoomiMCPTools } from "../lib/ai/mcp-client";

config({ path: ".env.local" });

async function testProcessLibrary() {
  console.log("🔧 Testing List Processes in Process Library Folder");
  console.log("=".repeat(60));
  console.log("");

  // Load MCP tools
  console.log("1️⃣ Loading MCP tools...");
  const tools = await getBoomiMCPTools();
  const toolNames = Object.keys(tools);
  console.log(`   ✅ Loaded ${toolNames.length} tools\n`);

  // Test: List processes in Process Library folder
  console.log("2️⃣ Testing manage_process tool with folder_name...");
  try {
    const manageProcessTool = tools.manage_process;
    if (!manageProcessTool) {
      throw new Error("manage_process tool not found");
    }

    const profileName = process.env.BOOMI_PROFILE_NAME || "production";
    const folderName = "Process Library";
    
    console.log(`   Profile: ${profileName}`);
    console.log(`   Action: list`);
    console.log(`   Folder: ${folderName}`);
    console.log("   Calling tool...\n");

    const result = await manageProcessTool.execute({
      profile: profileName,
      action: "list",
      folder_name: folderName,
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

      // Pretty print the processes
      if (result && typeof result === "object") {
        let processes: any[] = [];
        
        // Handle nested result structure: result.result.processes
        if (result.result && result.result.processes && Array.isArray(result.result.processes)) {
          processes = result.result.processes;
        } else if (Array.isArray(result)) {
          processes = result;
        } else if (result.data && Array.isArray(result.data)) {
          processes = result.data;
        } else if (result.processes && Array.isArray(result.processes)) {
          processes = result.processes;
        }

        if (processes.length > 0) {
          console.log(`   📋 Found ${processes.length} processes in "${folderName}" folder:`);
          processes.slice(0, 10).forEach((process: any, index: number) => {
            const name = process.name || process.componentName || process.id || "Unknown";
            const id = process.id || process.componentId || "N/A";
            console.log(`      ${index + 1}. ${name} (ID: ${id})`);
          });
          if (processes.length > 10) {
            console.log(`      ... and ${processes.length - 10} more`);
          }
        } else {
          console.log("   📋 No processes found in this folder");
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
  console.log('   "Show me processes in the Process Library folder"');
  console.log("");
}

testProcessLibrary().catch(console.error);

