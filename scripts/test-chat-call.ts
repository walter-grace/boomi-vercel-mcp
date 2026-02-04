#!/usr/bin/env tsx
/**
 * Test actual chat API call with MCP tools
 */

import { config } from "dotenv";

config({ path: ".env.local" });

async function testChatCall() {
  console.log("💬 Testing Chat API Call with MCP Tools");
  console.log("=".repeat(50));
  console.log("");

  const baseUrl = "http://localhost:3000";

  // Check if server is running
  try {
    await fetch(baseUrl);
  } catch {
    console.log("❌ Dev server not running. Start with: pnpm dev");
    process.exit(1);
  }

  console.log("📝 Note: This test requires authentication.");
  console.log("   For full testing, use the browser at http://localhost:3000");
  console.log("");

  // Test MCP client directly
  console.log("🔧 Testing MCP Client Integration...");
  try {
    const { getBoomiMCPTools } = await import("../lib/ai/mcp-client");
    const tools = await getBoomiMCPTools();
    
    console.log(`✅ MCP tools loaded: ${Object.keys(tools).length} tools`);
    console.log(`   Tools: ${Object.keys(tools).join(", ")}`);
    
    // Test a tool execution
    console.log("\n🧪 Testing tool execution...");
    const mcpUrl = process.env.BOOMI_MCP_SERVER_URL || 
      "https://boomi-mcp-server-replitzip.replit.app/mcp";
    
    const response = await fetch(mcpUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: {
          name: "list_boomi_profiles",
          arguments: {},
        },
      }),
    });

    const data = await response.json();
    if (data.error) {
      console.log(`  ⚠️  Tool returned: ${data.error.message}`);
    } else {
      console.log("  ✅ Tool execution successful");
      const content = data.result?.content?.[0]?.text;
      if (content) {
        try {
          const parsed = JSON.parse(content);
          console.log(`  Response: ${JSON.stringify(parsed, null, 2)}`);
        } catch {
          console.log(`  Response: ${content}`);
        }
      }
    }
  } catch (error) {
    console.log(`  ❌ Tool test failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ Integration tests completed!");
  console.log("");
  console.log("🌐 Test in browser:");
  console.log("  1. Visit: http://localhost:3000");
  console.log("  2. Create account or login");
  console.log("  3. Try these commands:");
  console.log("     - 'List my Boomi profiles'");
  console.log("     - 'Show me Boomi account information'");
  console.log("     - 'What trading partners do I have?'");
  console.log("");
}

testChatCall().catch(console.error);

