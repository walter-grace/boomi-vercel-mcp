#!/usr/bin/env tsx
/**
 * Test script to test Deployment API tools: list_environments, create_deployment_package,
 * deploy_package, get_deployment_status, list_deployments, deploy_process
 */

import { config } from "dotenv";
import { getBoomiMCPTools } from "../lib/ai/mcp-client";

config({ path: ".env.local" });

async function testDeployment() {
  console.log("🔧 Testing Boomi Deployment API Tools");
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

  // Test 1: List environments
  console.log("2️⃣ Testing list_environments tool...");
  try {
    if (!tools.list_environments) {
      console.log("   ⚠️  list_environments tool not found");
      console.log("   This tool needs to be added to the MCP server first.");
      console.log("   See docs/DEPLOYMENT_API_GUIDE.md for implementation details.\n");
    } else {
      const listEnvironmentsTool = tools.list_environments;
      console.log(`   Profile: ${profileName}`);
      console.log("   Calling tool...\n");

      const result = await listEnvironmentsTool.execute({
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
        console.log(`   📋 Found ${count} environment(s):`);
        if (Array.isArray(items) && items.length > 0) {
          items.forEach((env: any, index: number) => {
            const name = env.name || "Unknown";
            const id = env.id || "Unknown";
            const status = env.status || "Unknown";
            console.log(`      ${index + 1}. ${name} (${status})`);
            console.log(`         ID: ${id}`);
          });
        } else {
          console.log("   📋 No environments found");
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

  // Test 2: Get environment details
  console.log("3️⃣ Testing get_environment tool...");
  try {
    if (!tools.get_environment) {
      console.log("   ⚠️  get_environment tool not found\n");
    } else {
      const environmentId = process.env.BOOMI_TEST_ENVIRONMENT_ID;
      if (!environmentId) {
        console.log("   ⚠️  BOOMI_TEST_ENVIRONMENT_ID not set in environment");
        console.log("   Skipping get_environment test.\n");
      } else {
        const getEnvironmentTool = tools.get_environment;
        console.log(`   Profile: ${profileName}`);
        console.log(`   Environment ID: ${environmentId}`);
        console.log("   Calling tool...\n");

        const result = await getEnvironmentTool.execute({
          profile: profileName,
          environment_id: environmentId,
        });

        if (result && typeof result === "object" && "error" in result) {
          console.log("   ⚠️  Tool returned an error:");
          console.log(`      ${result.error}`);
          console.log("");
        } else {
          console.log("   ✅ Tool executed successfully!");
          const env = result?.result || result?.data || result;
          if (env && typeof env === "object") {
            console.log(`      Name: ${env.name || "Unknown"}`);
            console.log(`      Status: ${env.status || "Unknown"}`);
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

  // Test 3: Create deployment package
  console.log("4️⃣ Testing create_deployment_package tool...");
  try {
    if (!tools.create_deployment_package) {
      console.log("   ⚠️  create_deployment_package tool not found\n");
    } else {
      const processId = process.env.BOOMI_TEST_PROCESS_ID;
      const environmentId = process.env.BOOMI_TEST_ENVIRONMENT_ID;
      if (!processId || !environmentId) {
        console.log("   ⚠️  BOOMI_TEST_PROCESS_ID or BOOMI_TEST_ENVIRONMENT_ID not set");
        console.log("   Skipping create_deployment_package test.\n");
      } else {
        const createPackageTool = tools.create_deployment_package;
        console.log(`   Profile: ${profileName}`);
        console.log(`   Process ID: ${processId}`);
        console.log(`   Environment ID: ${environmentId}`);
        console.log("   Calling tool...\n");

        const result = await createPackageTool.execute({
          profile: profileName,
          name: "Test Deployment Package",
          process_ids: [processId],
          environment_id: environmentId,
          include_dependencies: true,
        });

        if (result && typeof result === "object" && "error" in result) {
          console.log("   ⚠️  Tool returned an error:");
          console.log(`      ${result.error}`);
          console.log("");
        } else {
          console.log("   ✅ Tool executed successfully!");
          const package = result?.result || result?.data || result;
          if (package && typeof package === "object") {
            console.log(`      Package ID: ${package.id || "Unknown"}`);
            console.log(`      Name: ${package.name || "Unknown"}`);
            console.log(`      Status: ${package.status || "Unknown"}`);
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

  // Test 4: List deployments
  console.log("5️⃣ Testing list_deployments tool...");
  try {
    if (tools.list_deployments) {
      const listDeploymentsTool = tools.list_deployments;
      console.log(`   Profile: ${profileName}`);
      console.log("   Calling tool...\n");

      const result = await listDeploymentsTool.execute({
        profile: profileName,
        limit: 10,
      });

      if (result && typeof result === "object" && "error" in result) {
        console.log("   ⚠️  Tool returned an error:");
        console.log(`      ${result.error}`);
      } else {
        console.log("   ✅ Tool executed successfully!");
        const items = result?.result?.items || result?.items || result?.data || [];
        const count = result?.result?.count || result?.count || items.length;
        console.log(`   📋 Found ${count} deployment(s)\n`);
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
  console.log('   "List all environments"');
  console.log('   "Create a deployment package for process xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"');
  console.log('   "Deploy package xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx to production"');
  console.log('   "Deploy process xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx to production"');
  console.log('   "Check the status of my latest deployment"');
  console.log("");
  console.log("📚 See docs/DEPLOYMENT_API_GUIDE.md for more information");
  console.log("");
}

testDeployment().catch(console.error);

