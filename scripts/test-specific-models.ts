#!/usr/bin/env tsx
/**
 * Test specific OpenRouter models
 */

import { config } from "dotenv";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

config({ path: ".env.local" });

async function testSpecificModels() {
  console.log("🧪 Testing Specific OpenRouter Models");
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

  // Models to test
  const modelsToTest = [
    {
      id: "google/gemini-3-flash-preview",
      name: "Gemini 3 Flash Preview",
    },
    {
      id: "anthropic/claude-sonnet-4.5",
      name: "Claude Sonnet 4.5",
    },
    {
      id: "deepseek/deepseek-v3.2",
      name: "DeepSeek V3.2",
    },
  ];

  const testPrompt = "What is 2+2? Answer in exactly one word.";

  for (let i = 0; i < modelsToTest.length; i++) {
    const model = modelsToTest[i];
    console.log(`${i + 1}️⃣ Testing ${model.name}...`);
    console.log(`   Model ID: ${model.id}`);
    console.log(`   Prompt: "${testPrompt}"`);
    console.log("");

    try {
      const startTime = Date.now();
      const result = await generateText({
        model: openrouter(model.id),
        prompt: testPrompt,
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
  }

  console.log("=".repeat(60));
  console.log("✅ Testing completed!");
  console.log("");
  console.log("💡 If all tests passed, these models are ready to use in chat!");
  console.log("   Select them from the model dropdown in the chat interface.");
  console.log("");
}

testSpecificModels().catch(console.error);

