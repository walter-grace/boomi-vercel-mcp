#!/usr/bin/env tsx

/**
 * Test GPT-5 Nano via OpenRouter
 */

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { config } from "dotenv";

config({ path: ".env.local" });

async function testGPT5Nano() {
  console.log("🚀 Testing GPT-5 Nano via OpenRouter");
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
      "HTTP-Referer":
        process.env.OPENROUTER_HTTP_REFERER || "https://your-app.com",
      "X-Title": process.env.OPENROUTER_APP_NAME || "Boomi Chatbot",
    },
  });

  const modelId = "openai/gpt-5-nano";
  console.log(`📦 Model: ${modelId}`);
  console.log("💡 GPT-5 Nano is an ultra-fast and efficient model");
  console.log("");

  // Test 1: Simple question
  console.log("1️⃣ Testing simple question...");
  console.log('   Prompt: "What is 2+2? Answer in one word."');
  console.log("");

  try {
    const startTime = Date.now();
    const result = await generateText({
      model: openrouter(modelId),
      prompt: "What is 2+2? Answer in one word.",
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
      } else if (
        error.message.includes("model not found") ||
        error.message.includes("404")
      ) {
        console.error(
          "   💡 Model might not be available yet or ID is incorrect"
        );
        console.error("      Check: https://openrouter.ai/models");
        console.error("      Note: GPT-5 Nano might be a preview/beta model");
      }
    } else {
      console.error(`   Unknown error: ${error}`);
    }
    console.log("");
  }

  // Test 2: Speed test
  console.log("2️⃣ Testing response speed...");
  console.log('   Prompt: "Say hello in 3 words."');
  console.log("");

  try {
    const startTime = Date.now();
    const result = await generateText({
      model: openrouter(modelId),
      prompt: "Say hello in 3 words.",
    });
    const duration = Date.now() - startTime;

    console.log("   ✅ Success!");
    console.log(`   Response: ${result.text.trim()}`);
    console.log(`   Duration: ${duration}ms`);
    if (duration < 1000) {
      console.log("   ⚡ Very fast response!");
    } else if (duration < 2000) {
      console.log("   ✅ Fast response");
    }
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
  console.log("💡 GPT-5 Nano is optimized for speed and efficiency.");
  console.log("   Great for quick responses and high-volume use cases.");
  console.log("");
  console.log("📝 Available in chat as: 'GPT-5 Nano (OpenRouter)'");
  console.log("");
}

testGPT5Nano().catch(console.error);
