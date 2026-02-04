#!/usr/bin/env tsx
/**
 * Test OpenAI integration
 */

import { config } from "dotenv";

config({ path: ".env.local" });

async function testOpenAI() {
  console.log("🤖 Testing OpenAI Integration");
  console.log("=".repeat(50));
  console.log("");

  // Check if OpenAI API key is set
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log("⚠️  OPENAI_API_KEY not set in .env.local");
    console.log("   OpenAI direct models will use gateway instead");
    console.log("");
    console.log("To use direct OpenAI API:");
    console.log("  1. Get API key from https://platform.openai.com/api-keys");
    console.log("  2. Add to .env.local: OPENAI_API_KEY=sk-...");
    console.log("");
  } else {
    console.log("✅ OPENAI_API_KEY is set");
    console.log("");
  }

  // Test OpenAI provider
  console.log("🔧 Testing OpenAI Provider...");
  try {
    const { getLanguageModel } = await import("../lib/ai/providers");
    
    // Test gateway OpenAI model
    console.log("\n1️⃣ Testing OpenAI via Gateway (openai/gpt-4.1-mini)...");
    const gatewayModel = getLanguageModel("openai/gpt-4.1-mini");
    console.log("  ✅ Gateway OpenAI model loaded");
    console.log(`  Model ID: ${gatewayModel.modelId}`);
    
    // Test direct OpenAI model (if API key is set)
    if (apiKey) {
      console.log("\n2️⃣ Testing OpenAI Direct (openai-direct/gpt-4o-mini)...");
      const directModel = getLanguageModel("openai-direct/gpt-4o-mini");
      console.log("  ✅ Direct OpenAI model loaded");
      console.log(`  Model ID: ${directModel.modelId}`);
    } else {
      console.log("\n2️⃣ Skipping direct OpenAI test (no API key)");
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ OpenAI integration test completed!");
    console.log("");
    console.log("📝 Available OpenAI Models:");
    console.log("  • openai/gpt-4.1-mini (via Gateway)");
    console.log("  • openai/gpt-5.2 (via Gateway)");
    if (apiKey) {
      console.log("  • openai-direct/gpt-4o (Direct API)");
      console.log("  • openai-direct/gpt-4o-mini (Direct API)");
      console.log("  • openai-direct/gpt-4-turbo (Direct API)");
    }
    console.log("");

  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testOpenAI();

