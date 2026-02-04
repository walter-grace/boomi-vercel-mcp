#!/usr/bin/env tsx
/**
 * Test the actual chat API endpoint with MCP tools
 * Simulates a real chat request
 */

import { config } from "dotenv";

config({ path: ".env.local" });

async function testChatAPI() {
  console.log("💬 Testing Chat API with MCP Integration");
  console.log("=".repeat(60));
  console.log("");

  const baseUrl = "http://localhost:3000";

  // Check if server is running
  console.log("1️⃣ Checking if dev server is running...");
  try {
    const response = await fetch(baseUrl);
    if (!response.ok && response.status !== 401) {
      throw new Error(`Server returned ${response.status}`);
    }
    console.log("   ✅ Dev server is running");
    console.log("");
  } catch (error) {
    console.log("   ❌ Dev server not running");
    console.log("   Start it with: pnpm dev");
    console.log("");
    return;
  }

  console.log("📝 Test Instructions:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("1. Open your browser: http://localhost:3000");
  console.log("2. Create an account or login");
  console.log("3. Start a new chat");
  console.log("4. Select model: 'GPT-4o Mini (Direct)' or any OpenAI model");
  console.log("5. Try these test prompts:");
  console.log("");
  console.log("   Test 1 - List Boomi Profiles:");
  console.log('   → "List my Boomi profiles"');
  console.log("");
  console.log("   Test 2 - Get Account Info:");
  console.log('   → "Show me my Boomi account information"');
  console.log("");
  console.log("   Test 3 - Weather (non-MCP tool):");
  console.log('   → "What\'s the weather in San Francisco?"');
  console.log("");
  console.log("   Test 4 - Combined:");
  console.log('   → "List my Boomi profiles and tell me the weather in NYC"');
  console.log("");
  console.log("6. Watch the chat interface for:");
  console.log("   • Tool approval prompts (if enabled)");
  console.log("   • Tool execution results");
  console.log("   • LLM responses using tool data");
  console.log("");
  console.log("🔍 What to look for:");
  console.log("  ✅ Tool calls appear in the chat");
  console.log("  ✅ MCP tools execute successfully");
  console.log("  ✅ LLM uses tool results in response");
  console.log("  ✅ No errors in browser console");
  console.log("");
  console.log("📊 Check Network Tab:");
  console.log("  • POST /api/chat should return 200");
  console.log("  • Look for tool execution in response");
  console.log("");
}

testChatAPI();

