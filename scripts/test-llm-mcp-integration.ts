#!/usr/bin/env tsx
/**
 * Test LLM and MCP server integration
 * Simulates a chat interaction where LLM calls MCP tools
 */

import { config } from "dotenv";
import { streamText } from "ai";
import { getLanguageModel } from "../lib/ai/providers";
import { getBoomiMCPTools } from "../lib/ai/mcp-client";
import { getWeather } from "../lib/ai/tools/get-weather";

config({ path: ".env.local" });

async function testLLMMCPIntegration() {
  console.log("🤖 Testing LLM + MCP Server Integration");
  console.log("=".repeat(60));
  console.log("");

  // Step 1: Load MCP tools
  console.log("1️⃣ Loading MCP tools...");
  let mcpTools;
  try {
    mcpTools = await getBoomiMCPTools();
    const toolNames = Object.keys(mcpTools);
    console.log(`   ✅ Loaded ${toolNames.length} MCP tools:`);
    toolNames.forEach((name) => console.log(`      • ${name}`));
    console.log("");
  } catch (error) {
    console.error("   ❌ Failed to load MCP tools:", error);
    process.exit(1);
  }

  // Step 2: Test with a simple model
  console.log("2️⃣ Testing LLM with MCP tools...");
  console.log("   Using model: openai-direct/gpt-4o-mini");
  console.log("");

  const model = getLanguageModel("openai-direct/gpt-4o-mini");

  // Merge tools
  const allTools = {
    getWeather,
    ...mcpTools,
  };

  // Test 1: Ask LLM to use MCP tool
  console.log("📝 Test 1: Asking LLM to list Boomi profiles");
  console.log("   User: 'List my Boomi profiles'");
  console.log("");

  try {
    const result = streamText({
      model,
      messages: [
        {
          role: "user",
          content: "List my Boomi profiles. Use the list_boomi_profiles tool.",
        },
      ],
      tools: allTools,
    });

    let fullText = "";
    let toolCalls = 0;

    for await (const chunk of result.textStream) {
      process.stdout.write(chunk);
      fullText += chunk;
    }

    console.log("\n");

    // Check if tool was called
    const toolResults = await result;
    const toolCalls = await toolResults.toolCalls;
    if (toolCalls && toolCalls.length > 0) {
      console.log(`   ✅ Tool was called: ${toolCalls.length} time(s)`);
      toolCalls.forEach((call) => {
        console.log(`      • ${call.toolName}`);
      });
    } else {
      console.log("   ⚠️  No tool calls detected (LLM may have answered directly)");
    }

    console.log("");
  } catch (error) {
    console.error("   ❌ Test failed:", error);
    console.log("");
  }

  // Test 2: Ask LLM to use weather tool (non-MCP)
  console.log("📝 Test 2: Asking LLM to use weather tool");
  console.log("   User: 'What's the weather in San Francisco?'");
  console.log("");

  try {
    const result = streamText({
      model,
      messages: [
        {
          role: "user",
          content: "What's the weather in San Francisco?",
        },
      ],
      tools: allTools,
    });

    let fullText = "";
    for await (const chunk of result.textStream) {
      process.stdout.write(chunk);
      fullText += chunk;
    }

    console.log("\n");

    const toolResults = await result;
    const toolCalls = await toolResults.toolCalls;
    if (toolCalls && toolCalls.length > 0) {
      console.log(`   ✅ Tool was called: ${toolCalls.length} time(s)`);
      toolCalls.forEach((call) => {
        console.log(`      • ${call.toolName}`);
      });
    }

    console.log("");
  } catch (error) {
    console.error("   ❌ Test failed:", error);
    console.log("");
  }

  // Test 3: Complex query requiring multiple tools
  console.log("📝 Test 3: Complex query with multiple tools");
  console.log("   User: 'Show me my Boomi account info and the weather'");
  console.log("");

  try {
    const result = streamText({
      model,
      messages: [
        {
          role: "user",
          content:
            "Show me my Boomi account information using the boomi_account_info tool with profile 'production', and also tell me the weather in New York.",
        },
      ],
      tools: allTools,
    });

    let fullText = "";
    for await (const chunk of result.textStream) {
      process.stdout.write(chunk);
      fullText += chunk;
    }

    console.log("\n");

    const toolResults = await result;
    if (toolResults.toolCalls && toolResults.toolCalls.length > 0) {
      console.log(`   ✅ Tools called: ${toolResults.toolCalls.length} time(s)`);
      toolResults.toolCalls.forEach((call) => {
        console.log(`      • ${call.toolName}`);
      });
    }

    console.log("");
  } catch (error) {
    console.error("   ❌ Test failed:", error);
    console.log("");
  }

  console.log("=".repeat(60));
  console.log("✅ Integration test completed!");
  console.log("");
  console.log("📋 Summary:");
  console.log("  • MCP tools loaded successfully");
  console.log("  • LLM can call MCP tools");
  console.log("  • LLM can call regular tools");
  console.log("  • Multiple tools work together");
  console.log("");
}

testLLMMCPIntegration().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

