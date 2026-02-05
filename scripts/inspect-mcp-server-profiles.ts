#!/usr/bin/env tsx

import { config } from "dotenv";

config({ path: ".env.local" });

const MCP_SERVER_URL =
  process.env.BOOMI_MCP_SERVER_URL ||
  "https://boomi-mcp-server-replitzip.replit.app/mcp";

async function callMCP(method: string, params: any) {
  const response = await fetch(MCP_SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || "MCP error");
  }

  return data.result;
}

async function inspectServer() {
  console.log("🔍 Inspecting Replit MCP Server Profile Handling\n");
  console.log("=".repeat(70));
  console.log(`Server URL: ${MCP_SERVER_URL}\n`);

  try {
    // 1. Initialize connection
    console.log("1️⃣ Initializing MCP connection...");
    await callMCP("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "inspection-tool", version: "1.0.0" },
    });
    console.log("   ✅ Connection initialized\n");

    // 2. List current profiles
    console.log("2️⃣ Listing current profiles...");
    try {
      const profilesResult = await callMCP("tools/call", {
        name: "list_boomi_profiles",
        arguments: {},
      });
      const profilesText = profilesResult?.content?.[0]?.text;
      if (profilesText) {
        const profiles = JSON.parse(profilesText);
        console.log("   Current profiles:", profiles);
        console.log(`   ✅ Found ${profiles.profiles?.length || 0} profile(s)\n`);
      }
    } catch (error) {
      console.log("   ⚠️  Could not list profiles:", error);
      console.log("   (This is OK if server structure is different)\n");
    }

    // 3. Test setting multiple profiles
    console.log("3️⃣ Testing profile isolation...");
    console.log("   Setting profile 'test-user-1'...");
    try {
      await callMCP("tools/call", {
        name: "set_boomi_credentials",
        arguments: {
          profile: "test-user-1",
          account_id: "test-account-1",
          username: "test1@example.com",
          password: "test-token-1",
        },
      });
      console.log("   ✅ Profile 'test-user-1' set\n");
    } catch (error) {
      console.log("   ❌ Failed:", error);
    }

    console.log("   Setting profile 'test-user-2'...");
    try {
      await callMCP("tools/call", {
        name: "set_boomi_credentials",
        arguments: {
          profile: "test-user-2",
          account_id: "test-account-2",
          username: "test2@example.com",
          password: "test-token-2",
        },
      });
      console.log("   ✅ Profile 'test-user-2' set\n");
    } catch (error) {
      console.log("   ❌ Failed:", error);
    }

    // 4. List profiles again to see if both exist
    console.log("4️⃣ Verifying both profiles exist...");
    try {
      const profilesResult = await callMCP("tools/call", {
        name: "list_boomi_profiles",
        arguments: {},
      });
      const profilesText = profilesResult?.content?.[0]?.text;
      if (profilesText) {
        const profiles = JSON.parse(profilesText);
        console.log("   Profiles after setting:", profiles);
        const hasTest1 = profiles.profiles?.includes("test-user-1");
        const hasTest2 = profiles.profiles?.includes("test-user-2");
        console.log(`   ✅ test-user-1 exists: ${hasTest1}`);
        console.log(`   ✅ test-user-2 exists: ${hasTest2}\n`);
      }
    } catch (error) {
      console.log("   ⚠️  Could not verify:", error);
    }

    // 5. Test tool calls with specific profiles
    console.log("5️⃣ Testing tool calls with profile parameter...");
    console.log("   Testing boomi_account_info with 'test-user-1'...");
    try {
      const result1 = await callMCP("tools/call", {
        name: "boomi_account_info",
        arguments: {
          profile: "test-user-1",
        },
      });
      console.log("   ✅ Tool call succeeded (may fail if credentials are invalid)");
      const resultText = JSON.stringify(result1, null, 2);
      console.log("   Result:", resultText.substring(0, 300));
    } catch (error) {
      console.log("   ⚠️  Tool call failed (expected if test credentials are invalid):", error);
    }

    // 6. Test error handling for non-existent profile
    console.log("\n6️⃣ Testing error handling for non-existent profile...");
    try {
      await callMCP("tools/call", {
        name: "boomi_account_info",
        arguments: {
          profile: "non-existent-profile-xyz",
        },
      });
      console.log("   ⚠️  Tool call succeeded (unexpected - should have failed)");
    } catch (error) {
      console.log("   ✅ Tool call failed as expected (profile doesn't exist)");
      console.log(`   Error: ${error}`);
    }

    // 7. Get tool definitions to see profile requirements
    console.log("\n7️⃣ Inspecting tool definitions...");
    try {
      const toolsResult = await callMCP("tools/list", {});
      const tools = toolsResult?.tools || [];
      console.log(`   Found ${tools.length} tools:\n`);
      
      tools.forEach((tool: any) => {
        console.log(`   📋 ${tool.name}`);
        console.log(`      Description: ${tool.description}`);
        if (tool.inputSchema?.properties) {
          const props = tool.inputSchema.properties;
          const hasProfile = "profile" in props;
          const profileRequired = tool.inputSchema.required?.includes("profile");
          console.log(`      Has 'profile' parameter: ${hasProfile}`);
          console.log(`      'profile' is required: ${profileRequired}`);
        }
        console.log("");
      });
    } catch (error) {
      console.log("   ❌ Failed to get tools:", error);
    }

    // 8. Test manage_process with profile
    console.log("8️⃣ Testing manage_process with profile parameter...");
    try {
      const result = await callMCP("tools/call", {
        name: "manage_process",
        arguments: {
          profile: "test-user-1",
          action: "list",
        },
      });
      console.log("   ✅ Tool call structure is correct");
      console.log("   (May fail if credentials are invalid, but structure is OK)");
    } catch (error) {
      const errorMsg = String(error);
      if (errorMsg.includes("profile") || errorMsg.includes("not found")) {
        console.log("   ✅ Server correctly validates profile parameter");
      } else {
        console.log("   ⚠️  Error (may be expected):", error);
      }
    }

    console.log("\n" + "=".repeat(70));
    console.log("✅ Server inspection complete!");
    console.log("\n📋 Summary:");
    console.log("   • Check if profiles are isolated (test-user-1 vs test-user-2)");
    console.log("   • Verify all tools accept 'profile' parameter");
    console.log("   • Confirm error handling for missing profiles");
    console.log("   • Review tool definitions for profile requirements");

  } catch (error) {
    console.error("\n❌ Inspection failed:", error);
    process.exit(1);
  }
}

inspectServer();

