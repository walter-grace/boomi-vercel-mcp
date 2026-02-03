import { tool } from "ai";

function getMCPServerURL(): string {
  if (typeof process !== "undefined" && process.env?.BOOMI_MCP_SERVER_URL) {
    return process.env.BOOMI_MCP_SERVER_URL;
  }
  return "https://boomi-mcp-server-replitzip.replit.app/mcp";
}

const MCP_SERVER_URL = getMCPServerURL();

interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface MCPToolsListResponse {
  jsonrpc: string;
  result?: {
    tools: MCPTool[];
  };
  error?: {
    code: number;
    message: string;
  };
  id: number;
}

let mcpToolsCache: Record<string, ReturnType<typeof tool>> | null = null;

/**
 * Initialize MCP connection by calling the initialize method
 */
async function initializeMCPConnection(): Promise<boolean> {
  try {
    const response = await fetch(MCP_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: {
            name: "vercel-chatbot",
            version: "1.0.0",
          },
        },
      }),
    });

    if (!response.ok) {
      return false;
    }

    await response.json();
    return true;
  } catch (error) {
    console.error("Failed to initialize MCP connection:", error);
    return false;
  }
}

/**
 * Fetch MCP tools from the Boomi server using JSON-RPC
 */
async function fetchMCPTools(): Promise<MCPTool[]> {
  try {
    // Initialize connection first
    await initializeMCPConnection();

    const response = await fetch(MCP_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list",
        params: {},
      }),
    });

    if (!response.ok) {
      throw new Error(`MCP server returned ${response.status}`);
    }

    const data = (await response.json()) as MCPToolsListResponse;

    if (data.error) {
      throw new Error(data.error.message || "MCP server error");
    }

    return data.result?.tools || [];
  } catch (error) {
    console.error("Failed to fetch MCP tools:", error);
    return [];
  }
}

/**
 * Convert MCP tool to AI SDK tool format
 */
function convertMCPToolToAITool(mcpTool: MCPTool) {
  return {
    name: mcpTool.name,
    tool: tool({
      description: mcpTool.description,
      parameters: mcpTool.inputSchema.properties as Record<
        string,
        { type: string; description?: string }
      >,
      execute: async (args: Record<string, unknown>) => {
        try {
        const response = await fetch(MCP_SERVER_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: Date.now(),
            method: "tools/call",
            params: {
              name: mcpTool.name,
              arguments: args,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`MCP server returned ${response.status}`);
        }

        const data = (await response.json()) as {
          jsonrpc: string;
          result?: {
            content: Array<{ type: string; text: string }>;
            isError: boolean;
          };
          error?: { code: number; message: string };
          id: number;
        };

        if (data.error) {
          throw new Error(data.error.message || "MCP tool execution error");
        }

        // Extract text content from MCP response
        const content = data.result?.content?.[0]?.text;
        if (content) {
          try {
            // Try to parse as JSON, fallback to string
            return JSON.parse(content);
          } catch {
            return content;
          }
        }

        return data.result || { success: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        return {
          error: `Failed to execute ${mcpTool.name}: ${errorMessage}`,
        };
      }
    },
    }),
  };
}

/**
 * Get MCP tools from the Boomi server, converted to AI SDK format
 * Caches tools to avoid repeated calls
 */
export async function getBoomiMCPTools(): Promise<
  Record<string, ReturnType<typeof tool>>
> {
  if (mcpToolsCache) {
    return mcpToolsCache;
  }

  const mcpTools = await fetchMCPTools();

  if (mcpTools.length === 0) {
    return {};
  }

  // Convert MCP tools to AI SDK tools
  const aiTools = mcpTools.map(convertMCPToolToAITool);

  // Store in cache with names
  mcpToolsCache = Object.fromEntries(
    aiTools.map((tool) => [tool.name, tool.tool])
  );

  return mcpToolsCache;
}

/**
 * Clear the MCP tools cache (useful for testing or reconnection)
 */
export function clearMCPCache() {
  mcpToolsCache = null;
}

