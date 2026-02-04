#!/usr/bin/env tsx

/**
 * Test the stream endpoint directly
 * This is what the UI uses to resume streams
 */

import "dotenv/config";

const API_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function testStreamEndpoint() {
  console.log("🧪 Testing Stream Endpoint");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  // Test with a fake chat ID
  const chatId = "test-chat-id";
  const streamUrl = `${API_URL}/api/chat/${chatId}/stream`;

  console.log(`1️⃣ Testing stream endpoint: ${streamUrl}`);
  console.log("");

  try {
    const response = await fetch(streamUrl, {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
      },
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Content-Type: ${response.headers.get("content-type")}`);
    console.log("");

    if (response.status === 204) {
      console.log("   ✅ 204 No Content (expected for empty stream)");
      console.log("   This means the endpoint exists and works!");
    } else if (response.status === 404) {
      console.log("   ⚠️  404 - Chat not found (expected for fake ID)");
      console.log("   But endpoint exists!");
    } else {
      const text = await response.text();
      console.log(`   Response: ${text.slice(0, 200)}`);
    }

    console.log("");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Stream endpoint test completed!");
    console.log("");
    console.log("💡 Next steps:");
    console.log("   1. Check browser console (F12) for [UI] logs");
    console.log("   2. Check terminal for [Chat] logs");
    console.log("   3. Look for '[Chat] Starting stream merge...' in terminal");
    console.log("   4. Look for '[UI] Chat response received' in browser");
    
  } catch (error) {
    console.error("");
    console.error("❌ Test failed:", error);
    if (error instanceof Error) {
      console.error("   Message:", error.message);
    }
  }
}

testStreamEndpoint().catch(console.error);

