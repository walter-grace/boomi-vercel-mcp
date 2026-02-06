#!/usr/bin/env tsx
/**
 * Test OpenRouter API directly (bypassing AI SDK)
 */

import { config } from "dotenv";

config({ path: ".env.local" });

async function testOpenRouterDirect() {
  console.log("🔍 Testing OpenRouter API Directly");
  console.log("=".repeat(60));
  console.log("");

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.log("❌ OPENROUTER_API_KEY not found");
    return;
  }

  console.log(`✅ API Key found: ${apiKey.substring(0, 15)}...`);
  console.log("");

  // Test 1: List models (should work if key is valid)
  console.log("1️⃣ Testing /api/v1/models endpoint...");
  try {
    const modelsResponse = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://your-app.com",
        "X-Title": "Boomi Chatbot",
      },
    });

    console.log(
      `   Status: ${modelsResponse.status} ${modelsResponse.statusText}`
    );

    if (modelsResponse.ok) {
      const data = await modelsResponse.json();
      console.log(`   ✅ Success! Found ${data.data?.length || 0} models`);
      console.log("");
    } else {
      const error = await modelsResponse.json();
      console.log(`   ❌ Failed: ${JSON.stringify(error, null, 2)}`);
      console.log("");
    }
  } catch (error) {
    console.error(
      `   ❌ Error: ${error instanceof Error ? error.message : error}`
    );
    console.log("");
  }

  // Test 2: Chat completion (the actual API call)
  console.log("2️⃣ Testing /api/v1/chat/completions endpoint...");
  try {
    const chatResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://your-app.com",
          "X-Title": "Boomi Chatbot",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: "Say hello in one word.",
            },
          ],
        }),
      }
    );

    console.log(`   Status: ${chatResponse.status} ${chatResponse.statusText}`);

    if (chatResponse.ok) {
      const data = await chatResponse.json();
      console.log("   ✅ Success!");
      console.log(
        `   Response: ${data.choices?.[0]?.message?.content || "N/A"}`
      );
      console.log("");
    } else {
      const errorText = await chatResponse.text();
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { error: { message: errorText } };
      }

      console.log("   ❌ Failed:");
      console.log(`   Full Error Response: ${errorText}`);
      console.log(`   Parsed Error: ${JSON.stringify(error, null, 2)}`);
      console.log("");

      if (
        error.error?.type === "customer_verification_required" ||
        errorText.includes("customer_verification_required")
      ) {
        console.log("   🔍 ISSUE FOUND: Customer verification required!");
        console.log("");
        console.log("   💡 Your OpenRouter account needs verification:");
        console.log("      1. Go to https://openrouter.ai/keys");
        console.log("      2. Complete account verification");
        console.log("      3. Add payment method or credits");
        console.log("      4. Verify your email if needed");
        console.log("      5. Check for any pending verification steps");
        console.log("");
      } else if (
        error.error?.message === "User not found." ||
        errorText.includes("User not found")
      ) {
        console.log("   💡 This 'User not found' error typically means:");
        console.log("      • API key is invalid or expired");
        console.log("      • API key needs to be regenerated");
        console.log("      • Account needs verification (most likely!)");
        console.log("      • Check: https://openrouter.ai/keys");
        console.log("");
      }
    }
  } catch (error) {
    console.error(
      `   ❌ Error: ${error instanceof Error ? error.message : error}`
    );
    console.log("");
  }

  console.log("=".repeat(60));
  console.log("✅ Direct API test completed!");
  console.log("");
}

testOpenRouterDirect().catch(console.error);
