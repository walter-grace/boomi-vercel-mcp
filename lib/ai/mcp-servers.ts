/**
 * MCP Server Registry
 *
 * Defines all MCP servers that the application can connect to.
 * Each server is a separate MCP endpoint that exposes its own tools.
 *
 * The LLM sees tools from ALL enabled servers and orchestrates
 * cross-platform workflows automatically.
 *
 * To add a new server:
 *   1. Add a new entry to the array below
 *   2. Set the corresponding env var (e.g. AWS_MCP_SERVER_URL)
 *   3. The server will be auto-discovered on the next request
 */

export interface MCPServerConfig {
  /** Unique identifier used internally (e.g. "boomi", "aws") */
  id: string;
  /** Human-readable name shown in the UI */
  name: string;
  /** HTTP JSON-RPC 2.0 endpoint */
  url: string;
  /** One-line description for the UI */
  description: string;
  /** Whether this server is active */
  enabled: boolean;
  /** Single character shown in the server badge */
  icon: string;
  /** Brand hex colour for the badge */
  color: string;
}

function getEnvVar(name: string): string | undefined {
  if (typeof process !== "undefined" && process.env) {
    return process.env[name];
  }
  return undefined;
}

/**
 * All registered MCP servers.
 * Servers with `enabled: false` or an empty `url` are skipped at runtime.
 */
export function getMCPServers(): MCPServerConfig[] {
  return [
    // ── Boomi Platform (always on) ──────────────────────────────────
    {
      id: "boomi",
      name: "Boomi Platform",
      url:
        getEnvVar("BOOMI_MCP_SERVER_URL") ||
        "https://boomi-mcp-server-replitzip.replit.app/mcp",
      description:
        "Boomi AtomSphere API — integrations, processes, atoms, environments, deployments",
      enabled: true,
      icon: "B",
      color: "#0073CF",
    },

    // ── AWS Cloud (opt-in via env var) ──────────────────────────────
    {
      id: "aws",
      name: "AWS Cloud",
      url: getEnvVar("AWS_MCP_SERVER_URL") || "",
      description:
        "AWS services — S3, Lambda, IAM, CloudWatch, infrastructure management",
      enabled: Boolean(getEnvVar("AWS_MCP_SERVER_URL")),
      icon: "A",
      color: "#FF9900",
    },
  ];
}

/**
 * Returns only servers that are enabled AND have a non-empty URL.
 */
export function getEnabledMCPServers(): MCPServerConfig[] {
  return getMCPServers().filter((s) => s.enabled && s.url);
}

/**
 * Look up a server config by its id.
 */
export function getMCPServerById(
  id: string
): MCPServerConfig | undefined {
  return getMCPServers().find((s) => s.id === id);
}

