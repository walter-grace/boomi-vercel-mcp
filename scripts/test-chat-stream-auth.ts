#!/usr/bin/env tsx

/**
 * Test script to verify chat API with authentication
 * This simulates what the browser does
 */

import "dotenv/config";

const API_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const TEST_MESSAGE = "Hello, can you list my Boomi profiles?";

async function testChatAPIWithAuth() {
  console.log("🧪 Testing Chat API Stream (with auth simulation)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  // Note: The chat API requires authentication
  // In a real browser, this would use cookies from the session
  // For testing, we'll check if we can at least see the endpoint structure

  console.log("1️⃣ Testing endpoint availability...");

  try {
    // Try OPTIONS to see if endpoint exists
    const optionsResponse = await fetch(`${API_URL}/api/chat`, {
      method: "OPTIONS",
    });
    console.log(`   OPTIONS Status: ${optionsResponse.status}`);
    console.log("");

    // Try POST without auth (should fail with 401 or 403)
    console.log("2️⃣ Testing POST without authentication...");
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: `test-${Date.now()}`,
        message: {
          role: "user",
          parts: [{ type: "text", text: TEST_MESSAGE }],
        },
        selectedChatModel: "openai-direct/gpt-4o-mini",
        selectedVisibilityType: "private",
      }),
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.status === 401 || response.status === 403) {
      console.log("   ✅ Endpoint requires authentication (expected)");
      const errorText = await response.text();
      console.log(`   Error: ${errorText.slice(0, 200)}`);
    } else if (response.status === 405) {
      console.log(
        "   ⚠️  Method not allowed - endpoint might not exist or routing issue"
      );
    } else {
      const text = await response.text();
      console.log(`   Response: ${text.slice(0, 500)}`);
    }

    console.log("");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("💡 To test with real auth:");
    console.log("   1. Open browser DevTools (F12)");
    console.log("   2. Go to Network tab");
    console.log("   3. Send a message in the chat UI");
    console.log("   4. Find the /api/chat request");
    console.log("   5. Right-click > Copy > Copy as cURL");
    console.log("   6. Run that cURL command to test");
    console.log("");
    console.log("🔍 Or check the browser console for [UI] logs");
    console.log("   and terminal for [Chat] logs");
  } catch (error) {
    console.error("");
    console.error("❌ Test failed:", error);
    if (error instanceof Error) {
      console.error("   Message:", error.message);
    }
  }
}

// Run the test
testChatAPIWithAuth().catch(console.error);
