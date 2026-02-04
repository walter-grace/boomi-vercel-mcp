#!/usr/bin/env tsx
/**
 * Test Kimi K2.5 reasoning model via OpenRouter
 */

import { config } from "dotenv";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

config({ path: ".env.local" });

async function testKimiReasoning() {
  console.log("🧠 Testing Kimi K2.5 Reasoning Model");
  console.log("=".repeat(60));
  console.log("");

  // Check if OpenRouter API key is set
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.log("❌ OPENROUTER_API_KEY not set in .env.local");
    console.log("");
    console.log("To use OpenRouter:");
    console.log("  1. Get API key from https://openrouter.ai/keys");
    console.log("  2. Add to .env.local: OPENROUTER_API_KEY=sk-or-...");
    console.log("");
    return;
  }

  console.log("✅ OPENROUTER_API_KEY is set");
  console.log("");

  // Initialize OpenRouter provider
  const openrouter = createOpenRouter({
    apiKey,
    headers: {
      "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER || "https://your-app.com",
      "X-Title": process.env.OPENROUTER_APP_NAME || "Boomi Chatbot",
    },
  });

  const modelId = "moonshotai/kimi-k2.5";
  console.log(`📦 Model: ${modelId}`);
  console.log("💡 This is a reasoning model with extended thinking capabilities");
  console.log("");

  // Test 1: Simple reasoning question
  console.log("1️⃣ Testing simple reasoning...");
  console.log('   Prompt: "How many r\'s are in the word \'strawberry\'?"');
  console.log("");

  try {
    const startTime = Date.now();
    const result = await generateText({
      model: openrouter(modelId),
      prompt: "How many r's are in the word 'strawberry'? Think step by step.",
    });
    const duration = Date.now() - startTime;

    console.log("   ✅ Success!");
    console.log(`   Response: ${result.text.trim()}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Tokens: ${result.usage?.totalTokens || "N/A"}`);
    console.log("");
  } catch (error) {
    console.error("   ❌ Failed!");
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
      if (error.message.includes("User not found")) {
        console.error("   💡 This usually means:");
        console.error("      • API key needs credits added");
        console.error("      • API key needs verification");
        console.error("      • Check: https://openrouter.ai/keys");
      } else if (error.message.includes("model not found")) {
        console.error("   💡 Model might not be available or ID is incorrect");
        console.error(`      Check: https://openrouter.ai/models`);
      }
    } else {
      console.error(`   Unknown error: ${error}`);
    }
    console.log("");
  }

  // Test 2: Math reasoning
  console.log("2️⃣ Testing math reasoning...");
  console.log('   Prompt: "If a train travels 60 mph for 2.5 hours, how far does it go?"');
  console.log("");

  try {
    const startTime = Date.now();
    const result = await generateText({
      model: openrouter(modelId),
      prompt: "If a train travels 60 mph for 2.5 hours, how far does it go? Show your reasoning.",
    });
    const duration = Date.now() - startTime;

    console.log("   ✅ Success!");
    console.log(`   Response: ${result.text.trim()}`);
    console.log(`   Duration: ${duration}ms`);
    console.log("");
  } catch (error) {
    console.error("   ❌ Failed!");
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
    } else {
      console.error(`   Unknown error: ${error}`);
    }
    console.log("");
  }

  console.log("=".repeat(60));
  console.log("✅ Testing completed!");
  console.log("");
  console.log("💡 Kimi K2.5 is a reasoning model that shows extended thinking.");
  console.log("   It's great for complex problems that require step-by-step reasoning.");
  console.log("");
  console.log("📝 Available in chat as: 'Kimi K2.5 (OpenRouter)'");
  console.log("");
}

testKimiReasoning().catch(console.error);

