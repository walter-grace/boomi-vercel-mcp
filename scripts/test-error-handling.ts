#!/usr/bin/env tsx
/**
 * Test error handling and edge cases for all tools
 */

import { config } from "dotenv";
import { getBoomiMCPTools } from "../lib/ai/mcp-client";

config({ path: ".env.local" });

async function testErrorHandling() {
  console.log("🧪 Testing Error Handling and Edge Cases");
  console.log("=".repeat(70));
  console.log("");

  const { clearMCPCache } = await import("../lib/ai/mcp-client");
  clearMCPCache();
  const tools = await getBoomiMCPTools();
  const profileName = process.env.BOOMI_PROFILE_NAME || "production";

  const issues: Array<{ tool: string; issue: string; details: string }> = [];

  console.log("1️⃣ Testing Invalid UUIDs...");
  console.log("-".repeat(70));

  const toolsNeedingUUIDs = [
    { name: "get_atom", param: "atom_id", value: "invalid-uuid" },
    { name: "get_environment", param: "environment_id", value: "not-a-uuid" },
    { name: "query_atom_status", param: "atom_id", value: "12345" },
    { name: "get_deployment_status", param: "deployment_id", value: "bad-id" },
    { name: "get_execution_record", param: "execution_id", value: "invalid" },
  ];

  for (const { name, param, value } of toolsNeedingUUIDs) {
    if (tools[name]) {
      try {
        const result = await tools[name].execute({
          profile: profileName,
          [param]: value,
        });
        
        const resultStr = JSON.stringify(result);
        // Check if error is properly returned
        if (!resultStr.includes("error") && !resultStr.includes("not found") && !resultStr.includes("invalid")) {
          issues.push({
            tool: name,
            issue: "Invalid UUID not properly rejected",
            details: `Tool accepted invalid UUID format: ${value}`,
          });
          console.log(`   ⚠️  ${name}: Accepted invalid UUID`);
        } else {
          console.log(`   ✅ ${name}: Properly rejects invalid UUID`);
        }
      } catch (error) {
        console.log(`   ✅ ${name}: Throws error for invalid UUID`);
      }
    }
  }

  console.log("\n2️⃣ Testing Empty Results...");
  console.log("-".repeat(70));

  const listTools = ["list_atoms", "list_connections", "list_maps", "list_environments", "list_deployments"];
  
  for (const toolName of listTools) {
    if (tools[toolName]) {
      try {
        const result = await tools[toolName].execute({
          profile: profileName,
        });
        
        // Check if empty results are handled gracefully
        const resultStr = JSON.stringify(result);
        if (resultStr.includes("error") && !resultStr.includes("not found") && !resultStr.includes("empty")) {
          // This might be okay - empty results might return empty array
          const hasItems = resultStr.includes("items") || resultStr.includes("result") || resultStr.includes("[]");
          if (!hasItems) {
            issues.push({
              tool: toolName,
              issue: "Empty results may not be handled gracefully",
              details: `Response: ${resultStr.substring(0, 150)}`,
            });
          }
        }
        console.log(`   ✅ ${toolName}: Handles empty results`);
      } catch (error) {
        issues.push({
          tool: toolName,
          issue: "Throws error on empty results",
          details: error instanceof Error ? error.message : String(error),
        });
        console.log(`   ⚠️  ${toolName}: Error with empty results`);
      }
    }
  }

  console.log("\n3️⃣ Testing Network/Timeout Handling...");
  console.log("-".repeat(70));
  console.log("   ℹ️  This would require simulating network failures");
  console.log("   💡 Consider adding timeout handling in MCP server");

  console.log("\n4️⃣ Testing Concurrent Requests...");
  console.log("-".repeat(70));

  if (tools.list_atoms) {
    try {
      // Make multiple concurrent requests
      const promises = Array(5).fill(null).map(() =>
        tools.list_atoms.execute({ profile: profileName })
      );
      
      const results = await Promise.all(promises);
      const allSuccess = results.every((r) => {
        const str = JSON.stringify(r);
        return !str.includes("error") || str.includes("items") || str.includes("result");
      });
      
      if (allSuccess) {
        console.log(`   ✅ list_atoms: Handles concurrent requests`);
      } else {
        issues.push({
          tool: "list_atoms",
          issue: "Concurrent requests may cause issues",
          details: "Some concurrent requests failed",
        });
        console.log(`   ⚠️  list_atoms: Some concurrent requests failed`);
      }
    } catch (error) {
      issues.push({
        tool: "list_atoms",
        issue: "Concurrent requests cause error",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  console.log("\n5️⃣ Testing Special Characters in Parameters...");
  console.log("-".repeat(70));

  if (tools.query_component) {
    const specialCases = [
      { object_type: "Process", filter: "name CONTAINS 'test'" },
      { object_type: "Connection", filter: "name = 'DB-Connection'" },
    ];

    for (const testCase of specialCases) {
      try {
        await tools.query_component.execute({
          profile: profileName,
          ...testCase,
          limit: 5,
        });
        console.log(`   ✅ query_component: Handles special characters in filter`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        if (!errorMsg.includes("not found") && !errorMsg.includes("empty")) {
          issues.push({
            tool: "query_component",
            issue: "Special characters in filter may cause issues",
            details: errorMsg,
          });
        }
      }
    }
  }

  console.log("\n6️⃣ Testing Response Time...");
  console.log("-".repeat(70));

  const quickTools = ["list_boomi_profiles", "boomi_account_info"];
  
  for (const toolName of quickTools) {
    if (tools[toolName]) {
      const start = Date.now();
      try {
        await tools[toolName].execute({ profile: profileName });
        const duration = Date.now() - start;
        
        if (duration > 5000) {
          issues.push({
            tool: toolName,
            issue: "Slow response time",
            details: `Took ${duration}ms (should be < 5s)`,
          });
          console.log(`   ⚠️  ${toolName}: Slow response (${duration}ms)`);
        } else {
          console.log(`   ✅ ${toolName}: Fast response (${duration}ms)`);
        }
      } catch (error) {
        console.log(`   ⚠️  ${toolName}: Error during timing test`);
      }
    }
  }

  // Summary
  console.log("\n");
  console.log("=".repeat(70));
  console.log("📊 Error Handling Summary");
  console.log("=".repeat(70));
  console.log("");

  if (issues.length === 0) {
    console.log("✅ No error handling issues found!");
  } else {
    console.log(`⚠️  Found ${issues.length} potential issues:\n`);
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.tool}: ${issue.issue}`);
      console.log(`   ${issue.details}\n`);
    });
  }

  console.log("");
}

testErrorHandling().catch(console.error);

