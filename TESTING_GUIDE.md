# Testing Guide - Chat Feature with MCP Integration

## ✅ Pre-Test Checklist

### 1. MCP Server Connection
✅ **PASSED** - MCP server is healthy and all 7 tools are available:
- `list_boomi_profiles`
- `set_boomi_credentials`
- `delete_boomi_profile`
- `boomi_account_info`
- `manage_trading_partner`
- `manage_process`
- `manage_organization`

### 2. Environment Variables Setup

**Required:**
- ✅ `AUTH_SECRET` - Auto-generated
- ❌ `POSTGRES_URL` - **Need to add your database URL**

**Optional (for full functionality):**
- `OPENROUTER_API_KEY` - For reasoning models (Kimi K2.5)
- `BOOMI_ACCOUNT_ID` - For Boomi MCP tools
- `BOOMI_USERNAME` - For Boomi MCP tools
- `BOOMI_API_TOKEN` - For Boomi MCP tools
- `BOOMI_PROFILE_NAME` - For Boomi MCP tools

## 🚀 Quick Setup Options

### Option 1: Use Vercel Environment Variables (Recommended)
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link your project (if not already linked)
vercel link

# Pull environment variables from Vercel
vercel env pull
```

### Option 2: Manual Setup
Edit `.env.local` and add:
```bash
POSTGRES_URL=postgresql://user:password@localhost:5432/database
# Or use a cloud database like Neon, Supabase, etc.
```

### Option 3: Use Local PostgreSQL
```bash
# Install PostgreSQL locally, then:
POSTGRES_URL=postgresql://localhost:5432/ai_chatbot
```

## 🧪 Testing Steps

### Step 1: Verify Environment
```bash
npx tsx scripts/check-env.ts
```

### Step 2: Run Database Migrations
```bash
pnpm db:migrate
```

### Step 3: Start Development Server
```bash
pnpm dev
```

### Step 4: Test Chat Feature
1. Open http://localhost:3000
2. Create an account or login
3. Start a new chat
4. Try asking questions that would use MCP tools:
   - "List my Boomi profiles"
   - "Show me Boomi account information"
   - "What trading partners do I have?"

### Step 5: Test with Reasoning Model
1. Select "Kimi K2.5 (OpenRouter)" from model selector
2. Ask a reasoning question: "How many r's are in 'strawberry'?"
3. Verify reasoning details are preserved in follow-up messages

## 🔍 Troubleshooting

### MCP Tools Not Appearing
- Check MCP server is accessible: `curl https://boomi-mcp-server-replitzip.replit.app/health`
- Run test script: `npx tsx scripts/test-mcp-connection.ts`
- Check browser console for errors

### Database Connection Issues
- Verify POSTGRES_URL is correct
- Check database is accessible
- Run migrations: `pnpm db:migrate`

### OpenRouter Models Not Working
- Verify OPENROUTER_API_KEY is set
- Check API key is valid
- Test with a simple model first

## 📊 Test Results

Run these commands to verify everything is working:

```bash
# Test MCP connection
npx tsx scripts/test-mcp-connection.ts

# Check environment
npx tsx scripts/check-env.ts

# Start server
pnpm dev
```

