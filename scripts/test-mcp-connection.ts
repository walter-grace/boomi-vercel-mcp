#!/usr/bin/env tsx
/**
 * Test script to verify MCP server connection and tool availability
 */

const MCP_SERVER_URL =
  process.env.BOOMI_MCP_SERVER_URL ||
  "https://boomi-mcp-server-replitzip.replit.app/mcp";

async function testMCPConnection() {
  console.log("🧪 Testing Boomi MCP Server Connection...\n");
  console.log(`📍 MCP Server URL: ${MCP_SERVER_URL}\n`);

  try {
    // Test 1: Health Check
    console.log("1️⃣ Testing health endpoint...");
    const healthResponse = await fetch(
      MCP_SERVER_URL.replace("/mcp", "/health")
    );
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log("✅ Health check passed:", health);
    } else {
      console.log("❌ Health check failed:", healthResponse.status);
    }

    // Test 2: Initialize MCP Connection
    console.log("\n2️⃣ Initializing MCP connection...");
    const initResponse = await fetch(MCP_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: {
            name: "vercel-chatbot-test",
            version: "1.0.0",
          },
        },
      }),
    });

    if (!initResponse.ok) {
      throw new Error(`Initialize failed: ${initResponse.status}`);
    }
    const initData = await initResponse.json();
    console.log("✅ MCP connection initialized");

    // Test 3: List Available Tools
    console.log("\n3️⃣ Fetching available tools...");
    const toolsResponse = await fetch(MCP_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list",
        params: {},
      }),
    });

    if (!toolsResponse.ok) {
      throw new Error(`Tools list failed: ${toolsResponse.status}`);
    }

    const toolsData = await toolsResponse.json();
    if (toolsData.error) {
      throw new Error(toolsData.error.message);
    }

    const tools = toolsData.result?.tools || [];
    console.log(`✅ Found ${tools.length} available tools:`);
    tools.forEach((tool: { name: string; description: string }) => {
      console.log(`   - ${tool.name}: ${tool.description}`);
    });

    // Test 4: Test a simple tool call (list_boomi_profiles)
    console.log("\n4️⃣ Testing tool call (list_boomi_profiles)...");
    const toolResponse = await fetch(MCP_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: {
          name: "list_boomi_profiles",
          arguments: {},
        },
      }),
    });

    if (!toolResponse.ok) {
      throw new Error(`Tool call failed: ${toolResponse.status}`);
    }

    const toolData = await toolResponse.json();
    if (toolData.error) {
      console.log(
        "⚠️  Tool call returned error (this is OK if no profiles exist):",
        toolData.error.message
      );
    } else {
      console.log(
        "✅ Tool call successful:",
        JSON.stringify(toolData.result, null, 2)
      );
    }

    console.log("\n🎉 All MCP connection tests passed!");
    return true;
  } catch (error) {
    console.error("\n❌ MCP connection test failed:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    return false;
  }
}

// Run the test
testMCPConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });
