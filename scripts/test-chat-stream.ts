#!/usr/bin/env tsx

/**
 * Test script to verify chat API and streaming functionality
 */

import "dotenv/config";

const API_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const TEST_MESSAGE = "Hello, can you list my Boomi profiles?";

async function testChatAPI() {
  console.log("🧪 Testing Chat API Stream");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  // Step 1: Create a new chat
  console.log("1️⃣ Creating new chat...");
  const chatId = `test-${Date.now()}`;
  console.log(`   Chat ID: ${chatId}`);
  console.log("");

  // Step 2: Send a message
  console.log("2️⃣ Sending message to /api/chat...");
  console.log(`   Message: "${TEST_MESSAGE}"`);
  console.log("   Model: openai-direct/gpt-4o-mini");
  console.log("");

  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: chatId,
        message: {
          role: "user",
          parts: [{ type: "text", text: TEST_MESSAGE }],
        },
        selectedChatModel: "openai-direct/gpt-4o-mini",
        selectedVisibilityType: "private",
      }),
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log("   Headers:", Object.fromEntries(response.headers.entries()));
    console.log("");

    if (!response.ok) {
      const errorText = await response.text();
      console.error("   ❌ Error response:", errorText);
      return;
    }

    // Step 3: Check if it's a stream
    const contentType = response.headers.get("content-type");
    console.log("3️⃣ Checking response type...");
    console.log(`   Content-Type: ${contentType}`);
    console.log("");

    if (contentType?.includes("text/event-stream")) {
      console.log("   ✅ Response is a stream!");
      console.log("");

      // Step 4: Read the stream
      console.log("4️⃣ Reading stream chunks...");
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        console.error("   ❌ No reader available");
        return;
      }

      let chunkCount = 0;
      let fullText = "";
      let hasData = false;

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log(`   Stream ended after ${chunkCount} chunks`);
            break;
          }

          chunkCount++;
          const chunk = decoder.decode(value, { stream: true });

          // Parse SSE format
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data && data !== "[DONE]") {
                hasData = true;
                try {
                  const parsed = JSON.parse(data);
                  console.log(
                    `   📦 Chunk ${chunkCount}:`,
                    JSON.stringify(parsed).slice(0, 200)
                  );

                  // Extract text content
                  if (parsed.type === "text-delta" && parsed.textDelta) {
                    fullText += parsed.textDelta;
                  }
                  if (
                    parsed.type === "tool-call" ||
                    parsed.type === "tool-result"
                  ) {
                    console.log(`   🔧 Tool: ${parsed.toolName || "unknown"}`);
                  }
                } catch (e) {
                  // Not JSON, might be plain text
                  if (data.trim()) {
                    console.log(`   📝 Text: ${data.slice(0, 100)}`);
                  }
                }
              }
            }
          }
        }

        console.log("");
        if (hasData) {
          console.log("   ✅ Stream contains data!");
          if (fullText) {
            console.log(
              `   📄 Full text received: ${fullText.length} characters`
            );
            console.log(`   Preview: ${fullText.slice(0, 200)}...`);
          }
        } else {
          console.log("   ⚠️  Stream is empty or contains no data");
        }
      } catch (streamError) {
        console.error("   ❌ Error reading stream:", streamError);
      }
    } else {
      // Not a stream, try to read as JSON
      console.log("   ⚠️  Response is not a stream, reading as JSON...");
      const json = await response.json();
      console.log("   Response:", JSON.stringify(json, null, 2));
    }

    console.log("");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Test completed!");
  } catch (error) {
    console.error("");
    console.error("❌ Test failed:", error);
    if (error instanceof Error) {
      console.error("   Message:", error.message);
      console.error("   Stack:", error.stack);
    }
  }
}

// Run the test
testChatAPI().catch(console.error);
