# Fix Model Cookie Issue

If you're seeing "no response" in the UI, it's likely because a cookie is caching the old gateway model.

## Quick Fix:

1. **Open Browser DevTools** (F12)
2. **Go to Application tab** (Chrome) or **Storage tab** (Firefox)
3. **Click Cookies** → `http://localhost:3000`
4. **Find and delete** the `chat-model` cookie
5. **Refresh the page** (F5 or Cmd+R)

## Alternative: Use Incognito/Private Window

1. Open a new incognito/private window
2. Visit http://localhost:3000
3. This will use the new default model

## Verify Model Selection:

After clearing the cookie, make sure:
- The model selector shows: **"GPT-4o Mini (Direct)"**
- NOT: "GPT-4.1 Mini (Gateway)" or "Gemini 2.5 Flash Lite"

## Test:

1. Click "List my Boomi profiles"
2. You should see a response using your OpenAI API key
3. Check terminal for: `[Chat] Using model: openai-direct/gpt-4o-mini`

