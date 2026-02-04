#!/usr/bin/env tsx
/**
 * Verify OpenRouter API key is set and valid
 */

import { config } from "dotenv";

config({ path: ".env.local" });

async function verifyOpenRouterKey() {
  console.log("🔑 Verifying OpenRouter API Key");
  console.log("=".repeat(60));
  console.log("");

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.log("❌ OPENROUTER_API_KEY not found in environment");
    console.log("");
    console.log("Please add to .env.local:");
    console.log("  OPENROUTER_API_KEY=sk-or-v1-...");
    console.log("");
    return;
  }

  console.log("✅ OPENROUTER_API_KEY is set");
  console.log("");

  // Check format
  if (!apiKey.startsWith("sk-or-")) {
    console.log("⚠️  Warning: API key doesn't start with 'sk-or-'");
    console.log("   OpenRouter keys typically start with 'sk-or-v1-'");
    console.log("   Current key starts with:", apiKey.substring(0, 10) + "...");
    console.log("");
  } else {
    console.log("✅ API key format looks correct (starts with 'sk-or-')");
    console.log("");
  }

  // Show masked key
  const maskedKey = apiKey.length > 20 
    ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`
    : "***";
  console.log(`📝 Key preview: ${maskedKey}`);
  console.log(`📏 Key length: ${apiKey.length} characters`);
  console.log("");

  // Test API key with a simple request
  console.log("🧪 Testing API key with OpenRouter...");
  console.log("");

  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER || "https://your-app.com",
        "X-Title": process.env.OPENROUTER_APP_NAME || "Boomi Chatbot",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ API key is valid!");
      console.log(`   Available models: ${data.data?.length || 0}`);
      console.log("");
      
      // Check for specific models
      const modelIds = data.data?.map((m: any) => m.id) || [];
      const testModels = [
        "openai/gpt-4o-mini",
        "moonshotai/kimi-k2.5",
        "anthropic/claude-sonnet-4.5",
        "google/gemini-3-flash-preview",
        "deepseek/deepseek-v3.2",
        "openai/gpt-5-nano",
      ];

      console.log("🔍 Checking for specific models:");
      for (const modelId of testModels) {
        const found = modelIds.some((id: string) => id.includes(modelId.split("/")[1]));
        console.log(`   ${found ? "✅" : "❌"} ${modelId}`);
      }
      console.log("");
    } else {
      const errorData = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
      console.log(`❌ API key test failed: ${response.status} ${response.statusText}`);
      console.log(`   Error: ${errorData.error?.message || "Unknown error"}`);
      console.log("");

      if (response.status === 401) {
        console.log("💡 This usually means:");
        console.log("   • API key is invalid or expired");
        console.log("   • API key needs verification");
        console.log("   • Check: https://openrouter.ai/keys");
        console.log("");
      } else if (response.status === 402) {
        console.log("💡 This usually means:");
        console.log("   • API key needs credits added");
        console.log("   • Check: https://openrouter.ai/keys");
        console.log("");
      }
    }
  } catch (error) {
    console.error("❌ Error testing API key:");
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error(`   Unknown error: ${error}`);
    }
    console.log("");
  }

  console.log("=".repeat(60));
  console.log("✅ Verification completed!");
  console.log("");
}

verifyOpenRouterKey().catch(console.error);

