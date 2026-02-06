import { tool } from "ai";
import { z } from "zod";
import {
  type MCPServerConfig,
  getEnabledMCPServers,
} from "./mcp-servers";

// ─── Types ───────────────────────────────────────────────────────────

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

/** MCPTool decorated with which server it came from */
export interface MCPToolWithServer extends MCPTool {
  _serverId: string;
  _serverName: string;
  _serverColor: string;
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

// ─── In-memory cache ─────────────────────────────────────────────────

let mcpToolsCache: Record<string, ReturnType<typeof tool>> | null = null;

// ─── Low-level helpers ───────────────────────────────────────────────

/**
 * Initialize MCP connection by calling the initialize method.
 * Each server requires its own initialisation handshake.
 */
async function initializeMCPConnection(serverUrl: string): Promise<boolean> {
  try {
    const response = await fetch(serverUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    console.error(`Failed to initialize MCP connection to ${serverUrl}:`, error);
    return false;
  }
}

// ─── Fetch tools ─────────────────────────────────────────────────────

/**
 * Fetch MCP tools from a **single** server, tagged with server metadata.
 */
async function fetchMCPToolsFromServer(
  server: MCPServerConfig
): Promise<MCPToolWithServer[]> {
  try {
    await initializeMCPConnection(server.url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch(server.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        throw new Error(`MCP server ${server.id} returned ${response.status}`);
      }

      const data = (await response.json()) as MCPToolsListResponse;

      if (data.error) {
        throw new Error(data.error.message || `MCP server ${server.id} error`);
      }

      const tools = data.result?.tools || [];

      // Tag every tool with its source server
      return tools.map((t) => ({
        ...t,
        _serverId: server.id,
        _serverName: server.name,
        _serverColor: server.color,
      }));
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        console.error(`MCP server ${server.id} timed out after 10 s`);
        return [];
      }
      throw error;
    }
  } catch (error) {
    console.error(`Failed to fetch tools from ${server.id}:`, error);
    return [];
  }
}

/**
 * Fetch tools from ALL enabled MCP servers in parallel.
 * This is the public API used by the `/api/mcp-tools` route (for the UI cache).
 */
export async function fetchMCPTools(): Promise<MCPToolWithServer[]> {
  const servers = getEnabledMCPServers();
  const results = await Promise.all(servers.map(fetchMCPToolsFromServer));
  return results.flat();
}

/**
 * Fetch tools from a specific server only (useful for targeted refresh).
 */
export async function fetchMCPToolsForServer(
  serverId: string
): Promise<MCPToolWithServer[]> {
  const servers = getEnabledMCPServers();
  const server = servers.find((s) => s.id === serverId);
  if (!server) {
    return [];
  }
  return fetchMCPToolsFromServer(server);
}

// ─── JSON Schema → Zod conversion ───────────────────────────────────

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

// ─── Tool conversion ─────────────────────────────────────────────────

/**
 * Convert an MCP tool into an AI SDK tool.
 * The `serverUrl` is captured in the closure so each tool calls the right server.
 */
function convertMCPToolToAITool(mcpTool: MCPToolWithServer, serverUrl: string) {
  return {
    name: mcpTool.name,
    tool: tool({
      description: mcpTool.description,
      inputSchema: jsonSchemaToZod(mcpTool.inputSchema),
      execute: async (args) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30_000);

          try {
            // Reorder "action" first for tools that need it
            let processedArgs = args;
            if (
              (mcpTool.name === "manage_process" ||
                mcpTool.name === "manage_trading_partner" ||
                mcpTool.name === "manage_organization" ||
                mcpTool.name === "manage_connection") &&
              args &&
              typeof args === "object" &&
              "action" in args
            ) {
              processedArgs = {
                action: args.action,
                ...Object.fromEntries(
                  Object.entries(args).filter(([key]) => key !== "action")
                ),
              };
            }

            const response = await fetch(serverUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
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
                const parsed = JSON.parse(content);

                // Log known server-side bugs for debugging
                if (
                  parsed.error &&
                  typeof parsed.error === "string" &&
                  parsed.error.includes(
                    "missing 1 required positional argument: 'action'"
                  )
                ) {
                  console.error(
                    `[MCP:${mcpTool._serverId}] Server-side bug for ${mcpTool.name}`,
                    JSON.stringify(processedArgs, null, 2)
                  );
                }

                // Log Boomi API errors
                if (
                  parsed.result &&
                  parsed.result._success === false &&
                  parsed.result.error
                ) {
                  console.error(
                    `[MCP:${mcpTool._serverId}] API error for ${mcpTool.name}: ${parsed.result.error}`
                  );
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
              console.error(
                `MCP tool ${mcpTool.name} (${mcpTool._serverId}) timed out after 30 s`
              );
              return {
                error:
                  "Request timeout: MCP server took too long to respond",
              };
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

// ─── Boomi credential helpers ────────────────────────────────────────

/**
 * Automatically set Boomi credentials from environment variables.
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

  if (accountId && username && apiToken) {
    await sendCredentialsToServer("boomi", {
      profile: profileName,
      account_id: accountId,
      username,
      password: apiToken,
    });
  }
}

/**
 * Set user-specific Boomi credentials on the MCP server.
 */
export async function setUserBoomiCredentials(credentials: {
  accountId: string;
  username: string;
  apiToken: string;
  profileName: string;
}): Promise<void> {
  await sendCredentialsToServer("boomi", {
    profile: credentials.profileName,
    account_id: credentials.accountId,
    username: credentials.username,
    password: credentials.apiToken,
  });
}

/**
 * Generic helper to set credentials on any MCP server via its
 * `set_*_credentials` tool. Currently supports "boomi".
 * Extend with "aws" when the AWS MCP server is connected.
 */
async function sendCredentialsToServer(
  serverId: string,
  params: Record<string, string>
): Promise<void> {
  const servers = getEnabledMCPServers();
  const server = servers.find((s) => s.id === serverId);
  if (!server) {
    return;
  }

  // Map server id → tool name
  const credentialToolMap: Record<string, string> = {
    boomi: "set_boomi_credentials",
    // aws: "set_aws_credentials",  // future
  };

  const toolName = credentialToolMap[serverId];
  if (!toolName) {
    return;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch(server.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method: "tools/call",
          params: { name: toolName, arguments: params },
        }),
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = (await response.json()) as {
          jsonrpc: string;
          result?: { content: Array<{ type: string; text: string }> };
          error?: { code: number; message: string };
        };

        if (!data.error) {
          console.log(
            `✅ Credentials set on ${server.name} (${params.profile ?? "default"})`
          );
        } else {
          console.warn(
            `⚠️  Failed to set credentials on ${server.name}: ${data.error.message}`
          );
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name !== "AbortError") {
        console.warn(
          `⚠️  Failed to set credentials on ${server.name}: ${error.message}`
        );
      }
    }
  } catch {
    // Silently fail — credentials can be set manually
  }
}

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Get tools from ALL enabled MCP servers, converted to AI SDK format.
 *
 * @param userCredentials  Optional Boomi credentials (takes priority over env vars).
 */
export async function getMCPTools(
  userCredentials?: {
    accountId: string;
    username: string;
    apiToken: string;
    profileName: string;
  }
): Promise<Record<string, ReturnType<typeof tool>>> {
  // 1. Set Boomi credentials
  if (userCredentials) {
    await setUserBoomiCredentials(userCredentials);
  } else {
    await autoSetBoomiCredentials();
  }

  // 2. Fetch tools from all servers in parallel
  const allMcpTools = await fetchMCPTools();

  if (allMcpTools.length === 0) {
    return {};
  }

  // 3. Resolve each tool's server URL for the execute closure
  const serverUrlMap = new Map<string, string>();
  for (const server of getEnabledMCPServers()) {
    serverUrlMap.set(server.id, server.url);
  }

  // 4. Convert to AI SDK tools
  const aiTools = allMcpTools.map((t) => {
    const serverUrl = serverUrlMap.get(t._serverId) || "";
    return convertMCPToolToAITool(t, serverUrl);
  });

  // 5. Cache
  mcpToolsCache = Object.fromEntries(
    aiTools.map((t) => [t.name, t.tool])
  ) as Record<string, ReturnType<typeof tool>>;

  return mcpToolsCache;
}

/**
 * Backward-compatible alias. Use `getMCPTools` for new code.
 */
export const getBoomiMCPTools = getMCPTools;

/**
 * Clear the in-memory MCP tools cache.
 */
export function clearMCPCache() {
  mcpToolsCache = null;
}
