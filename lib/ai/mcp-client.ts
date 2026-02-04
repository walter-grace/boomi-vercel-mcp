import { tool } from "ai";
import { z } from "zod";

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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(MCP_SERVER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "tools/list",
          params: {},
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`MCP server returned ${response.status}`);
      }

      const data = (await response.json()) as MCPToolsListResponse;

      if (data.error) {
        throw new Error(data.error.message || "MCP server error");
      }

      return data.result?.tools || [];
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        console.error("MCP server request timed out after 10 seconds");
        return [];
      }
      throw error;
    }
  } catch (error) {
    console.error("Failed to fetch MCP tools:", error);
    return [];
  }
}

/**
 * Convert JSON schema to Zod schema (simplified)
 */
function jsonSchemaToZod(schema: MCPTool["inputSchema"]): z.ZodTypeAny {
  if (schema.type === "object" && schema.properties) {
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const [key, prop] of Object.entries(schema.properties)) {
      const propSchema = prop as { type: string; description?: string };
      if (propSchema.type === "string") {
        shape[key] = z.string().optional();
      } else if (propSchema.type === "number") {
        shape[key] = z.number().optional();
      } else if (propSchema.type === "boolean") {
        shape[key] = z.boolean().optional();
      } else {
        shape[key] = z.unknown().optional();
      }
    }
    return z.object(shape);
  }
  return z.object({});
}

/**
 * Convert MCP tool to AI SDK tool format
 */
function convertMCPToolToAITool(mcpTool: MCPTool) {
  return {
    name: mcpTool.name,
    tool: tool({
      description: mcpTool.description,
      inputSchema: jsonSchemaToZod(mcpTool.inputSchema),
      execute: async (args) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for tool calls

          try {
            // Workaround for manage_process, manage_trading_partner, manage_organization
            // These tools seem to have issues with keyword arguments, so we ensure action comes first
            let processedArgs = args;
            if (
              (mcpTool.name === "manage_process" ||
                mcpTool.name === "manage_trading_partner" ||
                mcpTool.name === "manage_organization") &&
              args &&
              typeof args === "object" &&
              "action" in args
            ) {
              // Reorder to put action first, which might help with server-side parsing
              processedArgs = {
                action: args.action,
                ...Object.fromEntries(
                  Object.entries(args).filter(([key]) => key !== "action")
                ),
              };
            }

            const response = await fetch(MCP_SERVER_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              signal: controller.signal,
              body: JSON.stringify({
                jsonrpc: "2.0",
                id: Date.now(),
                method: "tools/call",
                params: {
                  name: mcpTool.name,
                  arguments: processedArgs,
                },
              }),
            });

            clearTimeout(timeoutId);

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
                const parsed = JSON.parse(content);
                
                // Check for the specific error about missing 'action' parameter
                // This is a known server-side bug - log it for debugging
                if (
                  parsed.error &&
                  typeof parsed.error === "string" &&
                  parsed.error.includes("missing 1 required positional argument: 'action'")
                ) {
                  console.error(
                    `[MCP] ⚠️  Server-side bug detected for ${mcpTool.name}`
                  );
                  console.error(
                    `[MCP] The server is not receiving the 'action' parameter correctly.`
                  );
                  console.error(
                    `[MCP] Arguments we sent:`,
                    JSON.stringify(processedArgs, null, 2)
                  );
                  console.error(
                    `[MCP] Full request was:`,
                    JSON.stringify(
                      {
                        jsonrpc: "2.0",
                        method: "tools/call",
                        params: {
                          name: mcpTool.name,
                          arguments: processedArgs,
                        },
                      },
                      null,
                      2
                    )
                  );
                  console.error(
                    `[MCP] 💡 This is a bug in the MCP server's Python code.`
                  );
                  console.error(
                    `[MCP] The server should be updated to properly handle keyword arguments.`
                  );
                }
                
                // Check for Boomi API errors (406, 404, etc.)
                if (
                  parsed.result &&
                  parsed.result._success === false &&
                  parsed.result.error
                ) {
                  const errorMsg = parsed.result.error;
                  if (errorMsg.includes("406 error") || errorMsg.includes("ApiError")) {
                    console.error(
                      `[MCP] ⚠️  Boomi API error for ${mcpTool.name}`
                    );
                    console.error(
                      `[MCP] Error: ${parsed.result.error}`
                    );
                    if (parsed.result.hint) {
                      console.error(
                        `[MCP] Hint: ${parsed.result.hint}`
                      );
                    }
                    console.error(
                      `[MCP] This might indicate:`
                    );
                    console.error(
                      `[MCP]   - The component ID format is incorrect`
                    );
                    console.error(
                      `[MCP]   - The API endpoint expects different parameters`
                    );
                    console.error(
                      `[MCP]   - Access permissions issue`
                    );
                  }
                }
                
                return parsed;
              } catch {
                return content;
              }
            }

            return data.result || { success: true };
          } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === "AbortError") {
              console.error(`MCP tool ${mcpTool.name} timed out after 30 seconds`);
              return { error: "Request timeout: MCP server took too long to respond" };
            }
            throw error;
          }
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
 * Automatically set Boomi credentials from environment variables if available
 */
async function autoSetBoomiCredentials(): Promise<void> {
  const accountId =
    typeof process !== "undefined" && process.env?.BOOMI_ACCOUNT_ID
      ? process.env.BOOMI_ACCOUNT_ID
      : null;
  const username =
    typeof process !== "undefined" && process.env?.BOOMI_USERNAME
      ? process.env.BOOMI_USERNAME
      : null;
  const apiToken =
    typeof process !== "undefined" && process.env?.BOOMI_API_TOKEN
      ? process.env.BOOMI_API_TOKEN
      : null;
  const profileName =
    typeof process !== "undefined" && process.env?.BOOMI_PROFILE_NAME
      ? process.env.BOOMI_PROFILE_NAME
      : "production";

  // Only set if all required variables are present
  if (accountId && username && apiToken) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(MCP_SERVER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: Date.now(),
            method: "tools/call",
            params: {
              name: "set_boomi_credentials",
              arguments: {
                profile: profileName,
                account_id: accountId,
                username: username,
                password: apiToken, // MCP server expects 'password' parameter
              },
            },
          }),
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = (await response.json()) as {
            jsonrpc: string;
            result?: {
              content: Array<{ type: string; text: string }>;
            };
            error?: { code: number; message: string };
          };

          if (!data.error) {
            console.log(`✅ Auto-configured Boomi profile: ${profileName}`);
          } else {
            console.warn(
              `⚠️  Failed to auto-set Boomi credentials: ${data.error.message}`
            );
          }
        }
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name !== "AbortError") {
          console.warn(
            `⚠️  Failed to auto-set Boomi credentials: ${error.message}`
          );
        }
      }
    } catch (error) {
      // Silently fail - credentials can be set manually if needed
    }
  }
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

  // Auto-set credentials from environment variables
  await autoSetBoomiCredentials();

  const mcpTools = await fetchMCPTools();

  if (mcpTools.length === 0) {
    return {};
  }

  // Convert MCP tools to AI SDK tools
  const aiTools = mcpTools.map(convertMCPToolToAITool);

  // Store in cache with names
  mcpToolsCache = Object.fromEntries(
    aiTools.map((tool) => [tool.name, tool.tool])
  ) as Record<string, ReturnType<typeof tool>>;

  return mcpToolsCache;
}

/**
 * Clear the MCP tools cache (useful for testing or reconnection)
 */
export function clearMCPCache() {
  mcpToolsCache = null;
}

