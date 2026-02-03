# Boomi MCP Server Integration

This document describes the integration of the Boomi MCP (Model Context Protocol) server with the Vercel chatbot.

## Overview

The chatbot is integrated with a Boomi MCP server hosted on Replit, which provides 7 tools for managing Boomi Platform integrations:

1. `list_boomi_profiles` - List all saved Boomi credential profiles
2. `set_boomi_credentials` - Store Boomi API credentials
3. `delete_boomi_profile` - Delete a stored credential profile
4. `boomi_account_info` - Get Boomi account information
5. `manage_trading_partner` - Manage B2B/EDI trading partners (CRUD operations)
6. `manage_process` - Manage Boomi process components (CRUD operations)
7. `manage_organization` - Manage Boomi organization components (CRUD operations)

## Configuration

### Environment Variables

Add the following environment variable to your `.env.local` file (optional, defaults to the Replit server):

```bash
BOOMI_MCP_SERVER_URL=https://boomi-mcp-server-replitzip.replit.app/mcp
```

If not set, the system will default to the Replit-hosted server URL.

### Server Endpoints

- **SSE Endpoint**: `https://boomi-mcp-server-replitzip.replit.app/sse` (for streaming)
- **HTTP POST Endpoint**: `https://boomi-mcp-server-replitzip.replit.app/mcp` (JSON-RPC 2.0)
- **Health Check**: `https://boomi-mcp-server-replitzip.replit.app/health`

## Architecture

The integration works as follows:

1. **MCP Client** (`lib/ai/mcp-client.ts`):
   - Connects to the Boomi MCP server using JSON-RPC protocol
   - Fetches available tools from the server
   - Converts MCP tools to AI SDK-compatible format
   - Caches tools to avoid repeated API calls

2. **Chat Route** (`app/(chat)/api/chat/route.ts`):
   - Loads MCP tools on each request
   - Merges MCP tools with existing tools (getWeather, createDocument, etc.)
   - Makes all tools available to the LLM during chat interactions

## Usage

Once configured, the Boomi MCP tools are automatically available in chat conversations. Users can:

- Set up Boomi credentials: "Set up Boomi credentials for production profile"
- List trading partners: "List all trading partners in the production profile"
- Manage processes: "Create a new process called 'Order Processing'"
- Get account info: "Show me the Boomi account information for production"

## Error Handling

The integration includes error handling:

- If the MCP server is unavailable, the system gracefully falls back to existing tools
- Tool execution errors are returned to the user in a user-friendly format
- Connection failures are logged but don't break the chat functionality

## Caching

MCP tools are cached to improve performance:

- Tool definitions are cached after the first fetch
- Cache can be cleared by calling `clearMCPCache()` if needed
- Tools are re-fetched if the cache is cleared

## Testing

To test the integration:

1. Ensure the MCP server is accessible (check health endpoint)
2. Start a chat conversation
3. Try using Boomi-related commands
4. Verify tools are being called correctly

## Troubleshooting

### Tools not appearing

- Check that `BOOMI_MCP_SERVER_URL` is set correctly
- Verify the MCP server is accessible (check health endpoint)
- Check server logs for connection errors

### Tool execution failures

- Ensure Boomi credentials are set up first using `set_boomi_credentials`
- Verify the profile name is correct
- Check that required parameters are provided

## References

- [Boomi MCP Server Documentation](https://boomi-mcp-server-replitzip.replit.app)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai)

