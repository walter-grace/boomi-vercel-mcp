# Testing LLM + MCP Integration

## Overview

This guide helps you verify that your LLM (OpenAI) and MCP server work together correctly.

## Prerequisites

1. **Environment Variables Set**
   ```bash
   # Check your .env.local has:
   OPENAI_API_KEY=sk-...
   BOOMI_ACCOUNT_ID=...
   BOOMI_USERNAME=...
   BOOMI_API_TOKEN=...
   BOOMI_PROFILE_NAME=production
   POSTGRES_URL=...
   ```

2. **Dev Server Running**
   ```bash
   pnpm dev
   ```

## Automated Tests

### Test 1: MCP Tool Execution
```bash
npx tsx scripts/test-mcp-tool-execution.ts
```
This verifies:
- ✅ MCP tools can be loaded
- ✅ Tools can be executed
- ✅ Tools return results

### Test 2: LLM + MCP Integration
```bash
npx tsx scripts/test-llm-mcp-integration.ts
```
This verifies:
- ✅ LLM can see MCP tools
- ✅ LLM can call MCP tools
- ✅ Tools work together

### Test 3: All Systems
```bash
npx tsx scripts/test-all.ts
```
This verifies:
- ✅ Environment variables
- ✅ Database connection
- ✅ MCP server
- ✅ All integrations

## Manual Browser Testing

### Step 1: Start Dev Server
```bash
pnpm dev
```

### Step 2: Open Browser
Visit: http://localhost:3000

### Step 3: Create Account or Login
- Sign up for a new account, or
- Login with existing credentials

### Step 4: Start a New Chat
- Click "New Chat" or navigate to `/chat`

### Step 5: Select Model
Choose an OpenAI model:
- **GPT-4o (Direct)** - Recommended for testing
- **GPT-4o Mini (Direct)** - Faster, cheaper
- **GPT-4.1 Mini (Gateway)** - Via Vercel Gateway

### Step 6: Test MCP Tools

#### Test 1: List Boomi Profiles
**Prompt:**
```
List my Boomi profiles
```

**Expected:**
- LLM should call `list_boomi_profiles` tool
- Tool execution appears in chat
- LLM responds with profile list

#### Test 2: Get Account Information
**Prompt:**
```
Show me my Boomi account information
```

**Expected:**
- LLM should call `boomi_account_info` tool
- Tool uses profile from environment
- LLM responds with account details

#### Test 3: Weather Tool (Non-MCP)
**Prompt:**
```
What's the weather in San Francisco?
```

**Expected:**
- LLM should call `getWeather` tool
- Tool returns weather data
- LLM responds with weather info

#### Test 4: Combined Query
**Prompt:**
```
List my Boomi profiles and tell me the weather in New York
```

**Expected:**
- LLM calls multiple tools
- Both MCP and regular tools work
- LLM combines results in response

## What to Look For

### ✅ Success Indicators

1. **Tool Calls Visible**
   - Tool execution appears in chat UI
   - Tool name is shown
   - Tool parameters are displayed

2. **Tool Results**
   - Tool returns data
   - No error messages
   - Results are formatted correctly

3. **LLM Response**
   - LLM uses tool results
   - Response is coherent
   - Information from tools is included

4. **Network Tab**
   - `POST /api/chat` returns 200
   - Response includes tool calls
   - No timeout errors

### ❌ Error Indicators

1. **Tool Not Called**
   - LLM answers without using tool
   - No tool execution in chat
   - Missing information in response

2. **Tool Execution Errors**
   - Error messages in chat
   - Timeout errors
   - "Tool failed" messages

3. **Network Errors**
   - 500 errors on `/api/chat`
   - Timeout errors
   - Connection refused

## Troubleshooting

### LLM Not Calling Tools

**Problem:** LLM responds without using tools

**Solutions:**
1. Be more explicit: "Use the list_boomi_profiles tool to..."
2. Check tool descriptions are clear
3. Try a different model
4. Check `experimental_activeTools` in route

### Tool Execution Fails

**Problem:** Tool is called but fails

**Solutions:**
1. Check MCP server is accessible
2. Verify environment variables
3. Check tool parameters are correct
4. Review MCP server logs

### Timeout Errors

**Problem:** Requests timeout

**Solutions:**
1. Check MCP server response time
2. Verify network connectivity
3. Check timeout settings (10s/30s)
4. Review Vercel function logs

## Debugging Tips

### 1. Check Browser Console
- Open DevTools (F12)
- Look for errors
- Check network requests

### 2. Check Server Logs
```bash
# In terminal running pnpm dev
# Look for:
# - Tool execution logs
# - Error messages
# - MCP server responses
```

### 3. Test MCP Server Directly
```bash
curl -X POST https://boomi-mcp-server-replitzip.replit.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_boomi_profiles",
      "arguments": {}
    }
  }'
```

### 4. Check Environment Variables
```bash
npx tsx scripts/check-env.ts
```

## Success Checklist

- [ ] MCP tools load successfully
- [ ] LLM can see MCP tools
- [ ] LLM calls MCP tools when appropriate
- [ ] Tool execution succeeds
- [ ] Tool results are used in LLM response
- [ ] Multiple tools work together
- [ ] No errors in console
- [ ] No timeout errors
- [ ] Chat UI shows tool calls
- [ ] Responses are accurate

## Next Steps

Once testing passes:
1. ✅ Deploy to Vercel
2. ✅ Test in production
3. ✅ Monitor logs for issues
4. ✅ Optimize tool descriptions
5. ✅ Add more MCP tools as needed

