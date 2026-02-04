# OpenAI Integration Guide

## Overview

Your chatbot now supports OpenAI models in two ways:

1. **Via Vercel AI Gateway** (Recommended, no API key needed)
2. **Direct OpenAI API** (Requires OPENAI_API_KEY)

## Option 1: Via Vercel AI Gateway (Recommended)

### Available Models
- `openai/gpt-4.1-mini` - Fast and cost-effective
- `openai/gpt-5.2` - Most capable OpenAI model

### Setup
- ✅ **No setup required** - Works automatically with Vercel AI Gateway
- Uses OIDC authentication on Vercel
- No API key needed

### Usage
Simply select the model from the dropdown in the chat interface.

## Option 2: Direct OpenAI API

### Available Models
- `openai-direct/gpt-4o` - Latest GPT-4o model
- `openai-direct/gpt-4o-mini` - Fast and affordable
- `openai-direct/gpt-4-turbo` - High-performance model

### Setup

1. **Get OpenAI API Key**
   - Visit: https://platform.openai.com/api-keys
   - Create a new API key
   - Copy the key (starts with `sk-`)

2. **Add to Environment Variables**
   
   **Local (.env.local):**
   ```bash
   OPENAI_API_KEY=sk-your-api-key-here
   ```
   
   **Vercel:**
   ```bash
   echo 'sk-your-api-key-here' | vercel env add OPENAI_API_KEY production
   ```
   
   Or via Dashboard:
   - Go to: Vercel Project → Settings → Environment Variables
   - Add: `OPENAI_API_KEY` = `sk-your-api-key-here`

3. **Select Model**
   - In the chat interface, select a model with "(Direct)" suffix
   - These models bypass the gateway and use OpenAI directly

## Benefits of Each Option

### Vercel AI Gateway
- ✅ No API key management
- ✅ Automatic authentication
- ✅ Unified interface for multiple providers
- ✅ Built-in rate limiting and monitoring

### Direct OpenAI API
- ✅ Access to latest models (GPT-4o, GPT-4o-mini)
- ✅ More control over API usage
- ✅ Direct billing to OpenAI account
- ✅ Lower latency (no gateway layer)

## Testing

Run the test script to verify OpenAI integration:

```bash
npx tsx scripts/test-openai.ts
```

## MCP Integration

Both OpenAI options work seamlessly with your Boomi MCP server. The 7 MCP tools are available regardless of which OpenAI option you choose.

## Troubleshooting

### Gateway Models Not Working
- Check Vercel AI Gateway is activated
- Verify you're on a Vercel deployment (not local)
- Check Vercel dashboard for gateway status

### Direct Models Not Working
- Verify `OPENAI_API_KEY` is set correctly
- Check API key is valid and has credits
- Ensure model ID starts with `openai-direct/`

## Cost Considerations

- **Gateway Models**: Billed through Vercel AI Gateway
- **Direct Models**: Billed directly to your OpenAI account

Choose based on your billing preferences and model availability needs.

