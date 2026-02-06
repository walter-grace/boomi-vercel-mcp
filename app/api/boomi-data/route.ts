import { getUserBoomiCredentials } from "@/lib/db/queries";
import { auth } from "@/app/(auth)/auth";
import { setUserBoomiCredentials } from "@/lib/ai/mcp-client";

function getMCPServerURL(): string {
  if (typeof process !== "undefined" && process.env?.BOOMI_MCP_SERVER_URL) {
    return process.env.BOOMI_MCP_SERVER_URL;
  }
  return "https://boomi-mcp-server-replitzip.replit.app/mcp";
}

async function callMCPTool(toolName: string, args: Record<string, unknown>): Promise<string> {
  const MCP_SERVER_URL = getMCPServerURL();
  
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
        name: toolName,
        arguments: args,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`MCP server returned ${response.status}`);
  }

  const data = await response.json() as {
    jsonrpc: string;
    result?: { content: Array<{ type: string; text: string }> };
    error?: { code: number; message: string };
    id: number;
  };

  if (data.error) {
    throw new Error(data.error.message || "MCP server error");
  }

  // Extract text from result
  if (data.result?.content?.[0]?.text) {
    return data.result.content[0].text;
  }

  return "";
}

/**
 * GET /api/boomi-data
 * Fetches real Boomi data (processes, atoms, environments, etc.) to personalize prompts
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's Boomi credentials
    const credentials = await getUserBoomiCredentials(session.user.id);
    if (!credentials) {
      return Response.json({
        processes: [],
        atoms: [],
        environments: [],
        connections: [],
        maps: [],
      });
    }

    const profile = credentials.profileName || "production";
    
    // Set credentials in MCP server before making calls
    await setUserBoomiCredentials({
      accountId: credentials.accountId,
      username: credentials.username,
      apiToken: credentials.apiToken,
      profileName: profile,
    });

    const results: {
      processes: Array<{ id: string; name: string }>;
      atoms: Array<{ id: string; name: string }>;
      environments: Array<{ id: string; name: string }>;
      connections: Array<{ id: string; name: string }>;
      maps: Array<{ id: string; name: string }>;
    } = {
      processes: [],
      atoms: [],
      environments: [],
      connections: [],
      maps: [],
    };

    // Fetch processes
    try {
      const processResult = await callMCPTool("manage_process", {
        action: "list",
        profile,
      });
      if (processResult) {
        const parsed = JSON.parse(processResult);
        if (Array.isArray(parsed)) {
          results.processes = parsed
            .slice(0, 10)
            .map((p: any) => ({
              id: p.id || "",
              name: p.name || "Unnamed Process",
            }));
        }
      }
    } catch (error) {
      console.error("Error fetching processes:", error);
    }

    // Fetch atoms
    try {
      const atomsResult = await callMCPTool("list_atoms", { profile });
      if (atomsResult) {
        const parsed = JSON.parse(atomsResult);
        if (Array.isArray(parsed)) {
          results.atoms = parsed
            .slice(0, 10)
            .map((a: any) => ({
              id: a.id || "",
              name: a.name || "Unnamed Atom",
            }));
        }
      }
    } catch (error) {
      console.error("Error fetching atoms:", error);
    }

    // Fetch environments
    try {
      const envResult = await callMCPTool("list_environments", { profile });
      if (envResult) {
        const parsed = JSON.parse(envResult);
        if (Array.isArray(parsed)) {
          results.environments = parsed
            .slice(0, 10)
            .map((e: any) => ({
              id: e.id || "",
              name: e.name || "Unnamed Environment",
            }));
        }
      }
    } catch (error) {
      console.error("Error fetching environments:", error);
    }

    // Fetch connections
    try {
      const connResult = await callMCPTool("list_connections", { profile });
      if (connResult) {
        const parsed = JSON.parse(connResult);
        if (Array.isArray(parsed)) {
          results.connections = parsed
            .slice(0, 10)
            .map((c: any) => ({
              id: c.id || "",
              name: c.name || "Unnamed Connection",
            }));
        }
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
    }

    // Fetch maps
    try {
      const mapsResult = await callMCPTool("list_maps", { profile });
      if (mapsResult) {
        const parsed = JSON.parse(mapsResult);
        if (Array.isArray(parsed)) {
          results.maps = parsed
            .slice(0, 10)
            .map((m: any) => ({
              id: m.id || "",
              name: m.name || "Unnamed Map",
            }));
        }
      }
    } catch (error) {
      console.error("Error fetching maps:", error);
    }

    return Response.json(results);
  } catch (error) {
    console.error("Error in boomi-data API:", error);
    return Response.json(
      {
        processes: [],
        atoms: [],
        environments: [],
        connections: [],
        maps: [],
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

