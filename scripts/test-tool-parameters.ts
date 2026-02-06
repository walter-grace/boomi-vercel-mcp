#!/usr/bin/env tsx
/**
 * Test script to verify tool parameters and find gaps in functionality
 * Tests edge cases, parameter validation, and error handling
 */

import { config } from "dotenv";
import { getBoomiMCPTools } from "../lib/ai/mcp-client";

config({ path: ".env.local" });

interface Gap {
  tool: string;
  issue: string;
  severity: "high" | "medium" | "low";
  details: string;
}

async function testToolParameters() {
  console.log("🔍 Testing Tool Parameters and Finding Gaps");
  console.log("=".repeat(70));
  console.log("");

  const { clearMCPCache } = await import("../lib/ai/mcp-client");
  clearMCPCache();
  const tools = await getBoomiMCPTools();
  const profileName = process.env.BOOMI_PROFILE_NAME || "production";
  const gaps: Gap[] = [];

  console.log("1️⃣ Testing Parameter Validation...");
  console.log("-".repeat(70));

  // Test 1: Missing required parameters
  console.log("\n📋 Test: Missing required parameters");
  
  const toolsWithRequiredParams = [
    { name: "get_atom", params: { profile: profileName } }, // missing atom_id
    { name: "get_environment", params: { profile: profileName } }, // missing environment_id
    { name: "query_atom_status", params: { profile: profileName } }, // missing atom_id
    { name: "get_deployment_status", params: { profile: profileName } }, // missing deployment_id
    { name: "get_execution_record", params: { profile: profileName } }, // missing execution_id
  ];

  for (const { name, params } of toolsWithRequiredParams) {
    if (tools[name]) {
      try {
        await tools[name].execute(params);
        gaps.push({
          tool: name,
          issue: "Missing parameter validation",
          severity: "high",
          details: `Tool accepted request without required parameter. Should return clear error.`,
        });
        console.log(`   ⚠️  ${name}: Accepted request without required parameter`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        if (!errorMsg.includes("required") && !errorMsg.includes("missing")) {
          gaps.push({
            tool: name,
            issue: "Unclear error message",
            severity: "medium",
            details: `Error message doesn't clearly indicate missing parameter: ${errorMsg}`,
          });
          console.log(`   ⚠️  ${name}: Error message unclear: ${errorMsg}`);
        } else {
          console.log(`   ✅ ${name}: Properly validates required parameters`);
        }
      }
    }
  }

  // Test 2: Invalid profile names
  console.log("\n📋 Test: Invalid profile names");
  
  const listTools = ["list_atoms", "list_environments", "list_connections", "list_maps"];
  
  for (const toolName of listTools) {
    if (tools[toolName]) {
      try {
        const result = await tools[toolName].execute({
          profile: "nonexistent_profile_12345",
        });
        
        // Check if result indicates profile not found
        const resultStr = JSON.stringify(result);
        if (!resultStr.includes("not found") && !resultStr.includes("error") && !resultStr.includes("Profile")) {
          gaps.push({
            tool: toolName,
            issue: "Invalid profile handling",
            severity: "high",
            details: `Tool should return clear error for nonexistent profile, but returned: ${resultStr.substring(0, 100)}`,
          });
          console.log(`   ⚠️  ${toolName}: No clear error for invalid profile`);
        } else {
          console.log(`   ✅ ${toolName}: Properly handles invalid profile`);
        }
      } catch (error) {
        console.log(`   ✅ ${toolName}: Throws error for invalid profile`);
      }
    }
  }

  // Test 3: Filter parameter parsing
  console.log("\n📋 Test: Filter parameter parsing");
  
  const filterTools = [
    { name: "list_atoms", filter: "type = 'Cloud'" },
    { name: "list_connections", filter: "type = 'Database'" },
    { name: "list_maps", filter: "sourceDocumentType = 'HL7'" },
  ];

  for (const { name, filter } of filterTools) {
    if (tools[name]) {
      try {
        const result = await tools[name].execute({
          profile: profileName,
          filter: filter,
        });
        console.log(`   ✅ ${name}: Accepts filter parameter`);
        
        // Check if filter was actually applied
        const resultStr = JSON.stringify(result);
        if (resultStr.includes("error") && !resultStr.includes("filter")) {
          gaps.push({
            tool: name,
            issue: "Filter parsing may be incorrect",
            severity: "medium",
            details: `Filter parameter accepted but may not be parsed correctly`,
          });
        }
      } catch (error) {
        gaps.push({
          tool: name,
          issue: "Filter parameter causes error",
          severity: "medium",
          details: `Error with filter: ${error instanceof Error ? error.message : String(error)}`,
        });
        console.log(`   ⚠️  ${name}: Error with filter parameter`);
      }
    }
  }

  // Test 4: Limit parameter
  console.log("\n📋 Test: Limit parameter");
  
  const limitTools = ["list_atoms", "list_connections", "list_maps", "list_environments"];
  
  for (const toolName of limitTools) {
    if (tools[toolName]) {
      try {
        const result = await tools[toolName].execute({
          profile: profileName,
          limit: 5,
        });
        console.log(`   ✅ ${toolName}: Accepts limit parameter`);
      } catch (error) {
        gaps.push({
          tool: toolName,
          issue: "Limit parameter causes error",
          severity: "low",
          details: `Error with limit: ${error instanceof Error ? error.message : String(error)}`,
        });
        console.log(`   ⚠️  ${toolName}: Error with limit parameter`);
      }
    }
  }

  // Test 5: query_component with different object types
  console.log("\n📋 Test: query_component with various object types");
  
  if (tools.query_component) {
    const objectTypes = ["Process", "Connection", "Map", "BusinessRule", "Certificate", "Atom", "Environment"];
    
    for (const objectType of objectTypes) {
      try {
        const result = await tools.query_component.execute({
          profile: profileName,
          object_type: objectType,
          limit: 5,
        });
        console.log(`   ✅ query_component: Works with ${objectType}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        if (errorMsg.includes("not found") || errorMsg.includes("invalid")) {
          console.log(`   ⚠️  query_component: ${objectType} - ${errorMsg}`);
        } else {
          gaps.push({
            tool: "query_component",
            issue: `Error querying ${objectType}`,
            severity: "medium",
            details: errorMsg,
          });
        }
      }
    }
  }

  // Test 6: Tool response format consistency
  console.log("\n📋 Test: Response format consistency");
  
  const listToolsToTest = ["list_atoms", "list_connections", "list_maps", "list_environments"];
  const responseFormats: Record<string, string[]> = {};
  
  for (const toolName of listToolsToTest) {
    if (tools[toolName]) {
      try {
        const result = await tools[toolName].execute({
          profile: profileName,
        });
        
        const resultStr = JSON.stringify(result);
        const keys = Object.keys(typeof result === "object" ? result : {});
        responseFormats[toolName] = keys;
        
        // Check for consistent structure
        const hasItems = resultStr.includes("items") || resultStr.includes("result") || resultStr.includes("data");
        const hasCount = resultStr.includes("count") || resultStr.includes("numberOfResults");
        
        if (!hasItems && !hasCount) {
          gaps.push({
            tool: toolName,
            issue: "Inconsistent response format",
            severity: "medium",
            details: `Response doesn't follow standard format (items/count): ${resultStr.substring(0, 200)}`,
          });
          console.log(`   ⚠️  ${toolName}: Response format may be inconsistent`);
        } else {
          console.log(`   ✅ ${toolName}: Response format looks consistent`);
        }
      } catch (error) {
        console.log(`   ⚠️  ${toolName}: Error testing response format`);
      }
    }
  }

  // Test 7: Deployment tools parameter requirements
  console.log("\n📋 Test: Deployment tools parameter requirements");
  
  if (tools.create_packaged_component) {
    try {
      // Test with minimal required params
      await tools.create_packaged_component.execute({
        profile: profileName,
        name: "Test Package",
        process_ids: [],
        environment_id: "test-env-id",
      });
      console.log(`   ✅ create_packaged_component: Accepts parameters`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg.includes("process") || errorMsg.includes("empty")) {
        console.log(`   ✅ create_packaged_component: Validates empty process_ids`);
      } else {
        gaps.push({
          tool: "create_packaged_component",
          issue: "Parameter validation unclear",
          severity: "medium",
          details: errorMsg,
        });
      }
    }
  }

  // Test 8: Execution records filtering
  console.log("\n📋 Test: Execution records filtering");
  
  if (tools.list_execution_records) {
    try {
      // Test with various parameters
      const testCases = [
        { profile: profileName, limit: 10 },
        { profile: profileName, limit: 5 },
        { profile: profileName }, // no limit
      ];
      
      for (const testCase of testCases) {
        const result = await tools.list_execution_records.execute(testCase);
        console.log(`   ✅ list_execution_records: Works with ${JSON.stringify(testCase)}`);
      }
    } catch (error) {
      gaps.push({
        tool: "list_execution_records",
        issue: "Parameter handling error",
        severity: "medium",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Summary
  console.log("\n");
  console.log("=".repeat(70));
  console.log("📊 Gap Analysis Summary");
  console.log("=".repeat(70));
  console.log("");

  const highGaps = gaps.filter((g) => g.severity === "high");
  const mediumGaps = gaps.filter((g) => g.severity === "medium");
  const lowGaps = gaps.filter((g) => g.severity === "low");

  console.log(`   🔴 High Priority: ${highGaps.length}`);
  console.log(`   🟡 Medium Priority: ${mediumGaps.length}`);
  console.log(`   🟢 Low Priority: ${lowGaps.length}`);
  console.log(`   📋 Total Gaps Found: ${gaps.length}`);
  console.log("");

  if (highGaps.length > 0) {
    console.log("🔴 High Priority Gaps:");
    highGaps.forEach((gap, index) => {
      console.log(`   ${index + 1}. ${gap.tool}: ${gap.issue}`);
      console.log(`      ${gap.details}`);
    });
    console.log("");
  }

  if (mediumGaps.length > 0) {
    console.log("🟡 Medium Priority Gaps:");
    mediumGaps.forEach((gap, index) => {
      console.log(`   ${index + 1}. ${gap.tool}: ${gap.issue}`);
      console.log(`      ${gap.details}`);
    });
    console.log("");
  }

  if (lowGaps.length > 0) {
    console.log("🟢 Low Priority Gaps:");
    lowGaps.forEach((gap, index) => {
      console.log(`   ${index + 1}. ${gap.tool}: ${gap.issue}`);
    });
    console.log("");
  }

  if (gaps.length === 0) {
    console.log("✅ No gaps found! All tools handle parameters correctly.");
  }

  return gaps;
}

testToolParameters()
  .then((gaps) => {
    if (gaps.length > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  })
  .catch(console.error);

