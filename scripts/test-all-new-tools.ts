#!/usr/bin/env tsx
/**
 * Comprehensive test script for all new Boomi MCP tools (24 total)
 * Tests: Atoms, Environments, Deployments, Components, Executions
 */

import { config } from "dotenv";
import { getBoomiMCPTools } from "../lib/ai/mcp-client";

config({ path: ".env.local" });

interface TestResult {
  tool: string;
  status: "success" | "error" | "skipped";
  message: string;
  data?: unknown;
}

async function testAllNewTools() {
  console.log("🧪 Testing All New Boomi MCP Tools");
  console.log("=".repeat(70));
  console.log("");

  // Load MCP tools
  console.log("1️⃣ Loading MCP tools from MCP server...");
  const { clearMCPCache } = await import("../lib/ai/mcp-client");
  clearMCPCache();
  const tools = await getBoomiMCPTools();
  const toolNames = Object.keys(tools);
  console.log(`   ✅ Loaded ${toolNames.length} tools`);
  console.log(`   Available tools: ${toolNames.join(", ")}\n`);

  const profileName = process.env.BOOMI_PROFILE_NAME || "production";
  const results: TestResult[] = [];

  // Test profile management first
  console.log("2️⃣ Testing Profile Management...");
  console.log("-".repeat(70));
  
  if (tools.list_boomi_profiles) {
    try {
      const result = await tools.list_boomi_profiles.execute({});
      results.push({
        tool: "list_boomi_profiles",
        status: "success",
        message: "✅ Profile list retrieved",
        data: result,
      });
      console.log("   ✅ list_boomi_profiles: Success");
      if (result && typeof result === "object") {
        const profiles = Array.isArray(result) ? result : result.profiles || [];
        console.log(`      Found ${profiles.length} profile(s)`);
        profiles.forEach((p: any) => {
          console.log(`         - ${p.profile || p.name || "Unknown"}`);
        });
      }
    } catch (error) {
      results.push({
        tool: "list_boomi_profiles",
        status: "error",
        message: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
      });
      console.log("   ❌ list_boomi_profiles: Failed");
    }
  } else {
    results.push({
      tool: "list_boomi_profiles",
      status: "skipped",
      message: "⚠️  Tool not found",
    });
    console.log("   ⚠️  list_boomi_profiles: Not found");
  }
  console.log("");

  // Test Atom API Tools
  console.log("3️⃣ Testing Atom API Tools...");
  console.log("-".repeat(70));

  const atomTools = [
    "list_atoms",
    "get_atom",
    "query_atom_status",
  ];

  for (const toolName of atomTools) {
    if (!tools[toolName]) {
      results.push({
        tool: toolName,
        status: "skipped",
        message: "⚠️  Tool not found",
      });
      console.log(`   ⚠️  ${toolName}: Not found`);
      continue;
    }

    try {
      if (toolName === "list_atoms") {
        const result = await tools[toolName].execute({
          profile: profileName,
        });
        results.push({
          tool: toolName,
          status: "success",
          message: "✅ Success",
          data: result,
        });
        console.log(`   ✅ ${toolName}: Success`);
        const items = result?.result?.items || result?.items || result?.data || [];
        const count = Array.isArray(items) ? items.length : 0;
        console.log(`      Found ${count} atom(s)`);
      } else {
        // get_atom and query_atom_status need atom_id
        const atomId = process.env.BOOMI_TEST_ATOM_ID;
        if (!atomId) {
          results.push({
            tool: toolName,
            status: "skipped",
            message: "⚠️  BOOMI_TEST_ATOM_ID not set",
          });
          console.log(`   ⚠️  ${toolName}: Skipped (no atom ID)`);
        } else {
          const result = await tools[toolName].execute({
            profile: profileName,
            atom_id: atomId,
          });
          results.push({
            tool: toolName,
            status: "success",
            message: "✅ Success",
            data: result,
          });
          console.log(`   ✅ ${toolName}: Success`);
        }
      }
    } catch (error) {
      results.push({
        tool: toolName,
        status: "error",
        message: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
      });
      console.log(`   ❌ ${toolName}: Failed - ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  console.log("");

  // Test Environment Tools
  console.log("4️⃣ Testing Environment Tools...");
  console.log("-".repeat(70));

  const envTools = ["list_environments", "get_environment"];

  for (const toolName of envTools) {
    if (!tools[toolName]) {
      results.push({
        tool: toolName,
        status: "skipped",
        message: "⚠️  Tool not found",
      });
      console.log(`   ⚠️  ${toolName}: Not found`);
      continue;
    }

    try {
      if (toolName === "list_environments") {
        const result = await tools[toolName].execute({
          profile: profileName,
        });
        results.push({
          tool: toolName,
          status: "success",
          message: "✅ Success",
          data: result,
        });
        console.log(`   ✅ ${toolName}: Success`);
        const items = result?.result?.items || result?.items || result?.data || [];
        const count = Array.isArray(items) ? items.length : 0;
        console.log(`      Found ${count} environment(s)`);
      } else {
        // get_environment needs environment_id
        const envId = process.env.BOOMI_TEST_ENVIRONMENT_ID;
        if (!envId) {
          results.push({
            tool: toolName,
            status: "skipped",
            message: "⚠️  BOOMI_TEST_ENVIRONMENT_ID not set",
          });
          console.log(`   ⚠️  ${toolName}: Skipped (no environment ID)`);
        } else {
          const result = await tools[toolName].execute({
            profile: profileName,
            environment_id: envId,
          });
          results.push({
            tool: toolName,
            status: "success",
            message: "✅ Success",
            data: result,
          });
          console.log(`   ✅ ${toolName}: Success`);
        }
      }
    } catch (error) {
      results.push({
        tool: toolName,
        status: "error",
        message: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
      });
      console.log(`   ❌ ${toolName}: Failed - ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  console.log("");

  // Test Deployment Tools
  console.log("5️⃣ Testing Deployment Tools...");
  console.log("-".repeat(70));

  const deploymentTools = [
    "list_deployments",
    "get_deployment_status",
    "create_packaged_component",
    "deploy_packaged_component",
    "deploy_process",
  ];

  for (const toolName of deploymentTools) {
    if (!tools[toolName]) {
      results.push({
        tool: toolName,
        status: "skipped",
        message: "⚠️  Tool not found",
      });
      console.log(`   ⚠️  ${toolName}: Not found`);
      continue;
    }

    try {
      if (toolName === "list_deployments") {
        const result = await tools[toolName].execute({
          profile: profileName,
        });
        results.push({
          tool: toolName,
          status: "success",
          message: "✅ Success",
          data: result,
        });
        console.log(`   ✅ ${toolName}: Success`);
        const items = result?.result?.items || result?.items || result?.data || [];
        const count = Array.isArray(items) ? items.length : 0;
        console.log(`      Found ${count} deployment(s)`);
      } else if (toolName === "get_deployment_status") {
        const deploymentId = process.env.BOOMI_TEST_DEPLOYMENT_ID;
        if (!deploymentId) {
          results.push({
            tool: toolName,
            status: "skipped",
            message: "⚠️  BOOMI_TEST_DEPLOYMENT_ID not set",
          });
          console.log(`   ⚠️  ${toolName}: Skipped (no deployment ID)`);
        } else {
          const result = await tools[toolName].execute({
            profile: profileName,
            deployment_id: deploymentId,
          });
          results.push({
            tool: toolName,
            status: "success",
            message: "✅ Success",
            data: result,
          });
          console.log(`   ✅ ${toolName}: Success`);
        }
      } else {
        // create_packaged_component, deploy_packaged_component, deploy_process need IDs
        results.push({
          tool: toolName,
          status: "skipped",
          message: "⚠️  Requires test IDs (not set)",
        });
        console.log(`   ⚠️  ${toolName}: Skipped (requires test IDs)`);
      }
    } catch (error) {
      results.push({
        tool: toolName,
        status: "error",
        message: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
      });
      console.log(`   ❌ ${toolName}: Failed - ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  console.log("");

  // Test Component Query Tools
  console.log("6️⃣ Testing Component Query Tools...");
  console.log("-".repeat(70));

  const componentTools = [
    "query_component",
    "list_connections",
    "list_maps",
    "list_connector_operations",
    "list_profiles",
  ];

  for (const toolName of componentTools) {
    if (!tools[toolName]) {
      results.push({
        tool: toolName,
        status: "skipped",
        message: "⚠️  Tool not found",
      });
      console.log(`   ⚠️  ${toolName}: Not found`);
      continue;
    }

    try {
      if (toolName === "query_component") {
        // Test with a common object type
        const result = await tools[toolName].execute({
          profile: profileName,
          object_type: "Connection",
          limit: 10,
        });
        results.push({
          tool: toolName,
          status: "success",
          message: "✅ Success",
          data: result,
        });
        console.log(`   ✅ ${toolName}: Success (queried Connection)`);
      } else if (toolName === "list_profiles") {
        // This might be the same as list_boomi_profiles
        const result = await tools[toolName].execute({
          profile: profileName,
        });
        results.push({
          tool: toolName,
          status: "success",
          message: "✅ Success",
          data: result,
        });
        console.log(`   ✅ ${toolName}: Success`);
      } else {
        // list_connections, list_maps, list_connector_operations
        const result = await tools[toolName].execute({
          profile: profileName,
          limit: 10,
        });
        results.push({
          tool: toolName,
          status: "success",
          message: "✅ Success",
          data: result,
        });
        console.log(`   ✅ ${toolName}: Success`);
        const items = result?.result?.items || result?.items || result?.data || [];
        const count = Array.isArray(items) ? items.length : 0;
        console.log(`      Found ${count} item(s)`);
      }
    } catch (error) {
      results.push({
        tool: toolName,
        status: "error",
        message: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
      });
      console.log(`   ❌ ${toolName}: Failed - ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  console.log("");

  // Test Execution Tools
  console.log("7️⃣ Testing Execution Tools...");
  console.log("-".repeat(70));

  const executionTools = ["list_execution_records", "get_execution_record"];

  for (const toolName of executionTools) {
    if (!tools[toolName]) {
      results.push({
        tool: toolName,
        status: "skipped",
        message: "⚠️  Tool not found",
      });
      console.log(`   ⚠️  ${toolName}: Not found`);
      continue;
    }

    try {
      if (toolName === "list_execution_records") {
        const result = await tools[toolName].execute({
          profile: profileName,
          limit: 10,
        });
        results.push({
          tool: toolName,
          status: "success",
          message: "✅ Success",
          data: result,
        });
        console.log(`   ✅ ${toolName}: Success`);
        const items = result?.result?.items || result?.items || result?.data || [];
        const count = Array.isArray(items) ? items.length : 0;
        console.log(`      Found ${count} execution record(s)`);
      } else {
        // get_execution_record needs execution_id
        const executionId = process.env.BOOMI_TEST_EXECUTION_ID;
        if (!executionId) {
          results.push({
            tool: toolName,
            status: "skipped",
            message: "⚠️  BOOMI_TEST_EXECUTION_ID not set",
          });
          console.log(`   ⚠️  ${toolName}: Skipped (no execution ID)`);
        } else {
          const result = await tools[toolName].execute({
            profile: profileName,
            execution_id: executionId,
          });
          results.push({
            tool: toolName,
            status: "success",
            message: "✅ Success",
            data: result,
          });
          console.log(`   ✅ ${toolName}: Success`);
        }
      }
    } catch (error) {
      results.push({
        tool: toolName,
        status: "error",
        message: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
      });
      console.log(`   ❌ ${toolName}: Failed - ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  console.log("");

  // Summary
  console.log("=".repeat(70));
  console.log("📊 Test Summary");
  console.log("=".repeat(70));
  console.log("");

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;
  const skippedCount = results.filter((r) => r.status === "skipped").length;

  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   ⚠️  Skipped: ${skippedCount}`);
  console.log(`   📋 Total: ${results.length}`);
  console.log("");

  if (errorCount > 0) {
    console.log("❌ Tools with errors:");
    results
      .filter((r) => r.status === "error")
      .forEach((r) => {
        console.log(`   - ${r.tool}: ${r.message}`);
      });
    console.log("");
  }

  if (skippedCount > 0) {
    console.log("⚠️  Skipped tools (require test IDs or not found):");
    results
      .filter((r) => r.status === "skipped")
      .forEach((r) => {
        console.log(`   - ${r.tool}: ${r.message}`);
      });
    console.log("");
  }

  console.log("💡 To test tools that require IDs, set these environment variables:");
  console.log("   BOOMI_TEST_ATOM_ID=...");
  console.log("   BOOMI_TEST_ENVIRONMENT_ID=...");
  console.log("   BOOMI_TEST_DEPLOYMENT_ID=...");
  console.log("   BOOMI_TEST_EXECUTION_ID=...");
  console.log("   BOOMI_TEST_PROCESS_ID=...");
  console.log("");

  console.log("✅ Test completed!");
  console.log("");
}

testAllNewTools().catch(console.error);

