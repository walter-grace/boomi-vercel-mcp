# OpenRouter Integration Guide

## Overview

OpenRouter provides access to **100+ AI models** from multiple providers through a **single API key**. This simplifies your setup significantly compared to managing separate API keys for each provider.

## Benefits

- ✅ **One API Key** - Access 100+ models from OpenAI, Anthropic, Google, xAI, Mistral, and more
- ✅ **Unified Billing** - All costs tracked through OpenRouter
- ✅ **Automatic Fallback** - OpenRouter handles routing and fallbacks
- ✅ **Reasoning Models** - Access to models like Kimi K2.5 with extended thinking
- ✅ **Cost Tracking** - Built-in usage accounting per model
- ✅ **Response Healing** - Automatic JSON repair for structured outputs

## Setup

### 1. Get OpenRouter API Key

1. Visit: https://openrouter.ai/keys
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `sk-or-`)

### 2. Add to Environment Variables

**Local (.env.local):**
```bash
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
OPENROUTER_HTTP_REFERER=https://your-app.com  # Optional
OPENROUTER_APP_NAME=Boomi Chatbot  # Optional
```

**Vercel:**
```bash
echo 'sk-or-v1-your-api-key-here' | vercel env add OPENROUTER_API_KEY production
```

Or via Dashboard:
- Go to: Vercel Project → Settings → Environment Variables
- Add: `OPENROUTER_API_KEY` = `sk-or-v1-your-api-key-here`

### 3. Select Model

In the chat interface, select any model with "(OpenRouter)" suffix:
- `GPT-4o (OpenRouter)`
- `Claude 3.5 Sonnet (OpenRouter)`
- `Kimi K2.5 (OpenRouter)` - Reasoning model
- And many more!

## Available Models

### OpenAI Models
- `openrouter/openai/gpt-4o` - Latest GPT-4o
- `openrouter/openai/gpt-4o-mini` - Fast and affordable
- `openrouter/openai/gpt-4-turbo` - High-performance

### Anthropic Models
- `openrouter/anthropic/claude-3.5-sonnet` - Best balance
- `openrouter/anthropic/claude-3-opus` - Most capable

### Google Models
- `openrouter/google/gemini-pro` - Advanced Google model

### Reasoning Models
- `openrouter/moonshotai/kimi-k2.5` - Extended thinking capabilities

### xAI Models
- `openrouter/xai/grok-beta` - Conversational model

### More Models

See the full list: https://openrouter.ai/models

## Default Model

If `OPENROUTER_API_KEY` is set, the default model automatically switches to:
- `openrouter/openai/gpt-4o-mini`

Otherwise, it falls back to:
- `openai-direct/gpt-4o-mini` (requires `OPENAI_API_KEY`)

## Testing

Run the test script to verify OpenRouter integration:

```bash
npx tsx scripts/test-openrouter.ts
```

This will test:
1. GPT-4o Mini via OpenRouter
2. Claude 3.5 Sonnet via OpenRouter
3. Kimi K2.5 (Reasoning) via OpenRouter

## MCP Integration

OpenRouter models work seamlessly with your Boomi MCP server. All 7 MCP tools are available regardless of which OpenRouter model you choose.

## Cost Considerations

- **OpenRouter Models**: Billed through OpenRouter (unified billing)
- **Gateway Models**: Billed through Vercel AI Gateway
- **Direct Models**: Billed directly to provider account

OpenRouter provides transparent pricing and usage tracking for all models.

## Advanced Features

### Response Healing

OpenRouter supports automatic JSON repair for structured outputs:

```typescript
const model = openrouter('openai/gpt-4o', {
  plugins: [{ id: 'response-healing' }],
});
```

### Usage Accounting

Track token usage and costs:

```typescript
const model = openrouter('openai/gpt-4o', {
  usage: { include: true },
});
```

### Reasoning Models

Access models with extended thinking capabilities:

```typescript
const model = openrouter('moonshotai/kimi-k2.5');
// Model will show reasoning steps in responses
```

## Troubleshooting

### Models Not Appearing

- Verify `OPENROUTER_API_KEY` is set correctly
- Check API key is valid and has credits
- Ensure model ID starts with `openrouter/`

### API Errors

- Check OpenRouter dashboard for usage limits
- Verify API key has sufficient credits
- Check model availability: https://openrouter.ai/models

### Cost Concerns

- OpenRouter provides transparent pricing
- Check usage in OpenRouter dashboard
- Set spending limits in OpenRouter settings

## Comparison: OpenRouter vs Other Options

| Feature | OpenRouter | Gateway | Direct APIs |
|---------|-----------|---------|-------------|
| API Keys Needed | 1 | 0 (Vercel) | Multiple |
| Models Available | 100+ | Limited | Per provider |
| Billing | Unified | Vercel | Per provider |
| Reasoning Models | ✅ | Limited | Per provider |
| Cost Tracking | ✅ Built-in | Limited | Per provider |

## Next Steps

1. ✅ Get OpenRouter API key
2. ✅ Add to environment variables
3. ✅ Test with `npx tsx scripts/test-openrouter.ts`
4. ✅ Select OpenRouter models in chat interface
5. ✅ Enjoy access to 100+ models with one API key!

