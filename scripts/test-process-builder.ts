#!/usr/bin/env tsx
/**
 * Test script to test Process Builder tools: create_process_with_components,
 * add_process_step, build_process_workflow, get_process_structure
 */

import { config } from "dotenv";
import { getBoomiMCPTools } from "../lib/ai/mcp-client";

config({ path: ".env.local" });

async function testProcessBuilder() {
  console.log("🔧 Testing Boomi Process Builder Tools");
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

  // Test 1: Create process with components
  console.log("2️⃣ Testing create_process_with_components tool...");
  let createdProcessId: string | null = null;
  try {
    if (!tools.create_process_with_components) {
      console.log("   ⚠️  create_process_with_components tool not found");
      console.log("   This tool needs to be added to the MCP server first.");
      console.log("   See docs/PROCESS_BUILDER_GUIDE.md for implementation details.\n");
    } else {
      const createProcessTool = tools.create_process_with_components;
      console.log(`   Profile: ${profileName}`);
      console.log("   Process Name: Test Process Builder");
      console.log("   Description: Test process created by test script");
      console.log("   Calling tool...\n");

      const result = await createProcessTool.execute({
        profile: profileName,
        name: "Test Process Builder",
        description: "Test process created by test script",
      });

      if (result && typeof result === "object" && "error" in result) {
        console.log("   ⚠️  Tool returned an error:");
        console.log(`      ${result.error}`);
        console.log("");
      } else {
        console.log("   ✅ Tool executed successfully!");
        const process = result?.result || result?.data || result;
        if (process && typeof process === "object") {
          createdProcessId = process.id || process.component_id || null;
          console.log("   Process Created:");
          console.log(`      Name: ${process.name || process.componentName || "Unknown"}`);
          console.log(`      ID: ${createdProcessId || "Unknown"}`);
          if (process.version) {
            console.log(`      Version: ${process.version}`);
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

  // Test 2: Add process step
  console.log("3️⃣ Testing add_process_step tool...");
  try {
    if (!tools.add_process_step) {
      console.log("   ⚠️  add_process_step tool not found");
      console.log("   This tool needs to be added to the MCP server first.\n");
    } else if (!createdProcessId) {
      console.log("   ⚠️  No process ID available from previous test");
      console.log("   Skipping add_process_step test.\n");
    } else {
      const addStepTool = tools.add_process_step;
      console.log(`   Profile: ${profileName}`);
      console.log(`   Process ID: ${createdProcessId}`);
      console.log("   Step Type: CONNECTOR");
      console.log("   Calling tool...\n");

      const result = await addStepTool.execute({
        profile: profileName,
        process_id: createdProcessId,
        step_type: "CONNECTOR",
        step_config: {
          position: { x: 100, y: 100 },
          note: "Test connector step",
        },
      });

      if (result && typeof result === "object" && "error" in result) {
        console.log("   ⚠️  Tool returned an error:");
        console.log(`      ${result.error}`);
        console.log("");
      } else {
        console.log("   ✅ Tool executed successfully!");
        console.log("   Step added to process");
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

  // Test 3: Get process structure
  console.log("4️⃣ Testing get_process_structure tool...");
  try {
    if (!tools.get_process_structure) {
      console.log("   ⚠️  get_process_structure tool not found");
      console.log("   This tool needs to be added to the MCP server first.\n");
    } else {
      const processId = createdProcessId || process.env.BOOMI_TEST_PROCESS_ID;
      if (!processId) {
        console.log("   ⚠️  No process ID available");
        console.log("   Set BOOMI_TEST_PROCESS_ID to test this tool.\n");
      } else {
        const getStructureTool = tools.get_process_structure;
        console.log(`   Profile: ${profileName}`);
        console.log(`   Process ID: ${processId}`);
        console.log("   Calling tool...\n");

        const result = await getStructureTool.execute({
          profile: profileName,
          process_id: processId,
        });

        if (result && typeof result === "object" && "error" in result) {
          console.log("   ⚠️  Tool returned an error:");
          console.log(`      ${result.error}`);
          console.log("");
        } else {
          console.log("   ✅ Tool executed successfully!");
          const structure = result?.result || result?.data || result;
          if (structure && typeof structure === "object") {
            console.log("   Process Structure:");
            if (structure.shapes) {
              console.log(`      Shapes: ${Array.isArray(structure.shapes) ? structure.shapes.length : "N/A"}`);
            }
            if (structure.connectors) {
              console.log(`      Connectors: ${Array.isArray(structure.connectors) ? structure.connectors.length : "N/A"}`);
            }
            if (structure.steps) {
              console.log(`      Steps: ${Array.isArray(structure.steps) ? structure.steps.length : "N/A"}`);
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

  // Test 4: Build process workflow
  console.log("5️⃣ Testing build_process_workflow tool...");
  try {
    if (!tools.build_process_workflow) {
      console.log("   ⚠️  build_process_workflow tool not found");
      console.log("   This tool needs to be added to the MCP server first.\n");
    } else {
      const processId = createdProcessId || process.env.BOOMI_TEST_PROCESS_ID;
      if (!processId) {
        console.log("   ⚠️  No process ID available");
        console.log("   Skipping build_process_workflow test.\n");
      } else {
        const buildWorkflowTool = tools.build_process_workflow;
        console.log(`   Profile: ${profileName}`);
        console.log(`   Process ID: ${processId}`);
        console.log("   Workflow Description: Read from database, transform with map, write to HTTP");
        console.log("   Calling tool...\n");

        const result = await buildWorkflowTool.execute({
          profile: profileName,
          process_id: processId,
          workflow_description: "Read from database, transform with map, write to HTTP endpoint",
        });

        if (result && typeof result === "object" && "error" in result) {
          console.log("   ⚠️  Tool returned an error:");
          console.log(`      ${result.error}`);
          console.log("");
        } else {
          console.log("   ✅ Tool executed successfully!");
          console.log("   Workflow built for process");
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

  console.log("=".repeat(60));
  console.log("✅ Test completed!");
  console.log("");
  console.log("💡 To use these tools in chat, ask:");
  console.log('   "Create a new process called \'Order Processing\'"');
  console.log('   "Add a database connector step to my process"');
  console.log('   "Build a workflow that reads from database, transforms with map, and writes to HTTP endpoint"');
  console.log('   "Show me the complete structure of my process"');
  console.log("");
  console.log("📚 See docs/PROCESS_BUILDER_GUIDE.md for more information");
  console.log("");
}

testProcessBuilder().catch(console.error);

