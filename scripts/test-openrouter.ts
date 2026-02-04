#!/usr/bin/env tsx
/**
 * Test OpenRouter integration
 */

import { config } from "dotenv";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

config({ path: ".env.local" });

async function testOpenRouter() {
  console.log("🌐 Testing OpenRouter Integration");
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

  // Test 1: GPT-4o Mini
  console.log("1️⃣ Testing GPT-4o Mini via OpenRouter...");
  try {
    const result = await generateText({
      model: openrouter("openai/gpt-4o-mini"),
      prompt: "Say 'Hello from OpenRouter!' in exactly 5 words.",
    });
    console.log("   ✅ Success!");
    console.log(`   Response: ${result.text}`);
    console.log("");
  } catch (error) {
    console.error("   ❌ Failed:", error instanceof Error ? error.message : error);
    console.log("");
  }

  // Test 2: Claude 3.5 Sonnet
  console.log("2️⃣ Testing Claude 3.5 Sonnet via OpenRouter...");
  try {
    const result = await generateText({
      model: openrouter("anthropic/claude-3.5-sonnet"),
      prompt: "What is 2+2? Answer in one word.",
    });
    console.log("   ✅ Success!");
    console.log(`   Response: ${result.text}`);
    console.log("");
  } catch (error) {
    console.error("   ❌ Failed:", error instanceof Error ? error.message : error);
    console.log("");
  }

  // Test 3: Kimi K2.5 (Reasoning model)
  console.log("3️⃣ Testing Kimi K2.5 (Reasoning) via OpenRouter...");
  try {
    const result = await generateText({
      model: openrouter("moonshotai/kimi-k2.5"),
      prompt: "Count the number of 'e' letters in the word 'elephant'.",
    });
    console.log("   ✅ Success!");
    console.log(`   Response: ${result.text}`);
    console.log("");
  } catch (error) {
    console.error("   ❌ Failed:", error instanceof Error ? error.message : error);
    console.log("");
  }

  console.log("=".repeat(60));
  console.log("✅ OpenRouter integration test completed!");
  console.log("");
  console.log("💡 Available models via OpenRouter:");
  console.log("   • openrouter/openai/gpt-4o");
  console.log("   • openrouter/openai/gpt-4o-mini");
  console.log("   • openrouter/anthropic/claude-3.5-sonnet");
  console.log("   • openrouter/moonshotai/kimi-k2.5 (reasoning)");
  console.log("   • And 100+ more models!");
  console.log("");
  console.log("📚 See all models: https://openrouter.ai/models");
  console.log("");
}

testOpenRouter().catch(console.error);

