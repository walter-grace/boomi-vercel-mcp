import { auth } from "@/app/(auth)/auth";
import { fetchMCPTools } from "@/lib/ai/mcp-client";
import {
  getCachedMcpTools,
  saveCachedMcpTools,
} from "@/lib/db/queries";

/**
 * GET /api/mcp-tools
 * Returns list of available MCP tools from the Boomi server.
 *
 * Cache strategy (per-user, DB-backed):
 *   1. Check DB for a non-expired cache row for this user → return instantly
 *   2. On cache miss, fetch from the Replit MCP server (2 round-trips)
 *   3. Store the result in the DB so subsequent loads are instant
 *   4. Also set Cache-Control so the browser caches for 60 s
 */
export async function GET() {
  try {
    // ── 1. Identify the user ──────────────────────────────────────
    const session = await auth();
    const userId = session?.user?.id;

    // ── 2. Try DB cache (if we have a user) ───────────────────────
    if (userId) {
      const cached = await getCachedMcpTools(userId);

      if (cached) {
        const tools = cached.tools as unknown[];
        console.log(
          `[MCP Cache] ✅ HIT — ${tools.length} tools from DB for user ${userId.substring(0, 8)}…`
        );
        return Response.json(
          { tools, cached: true },
          {
            headers: {
              "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
            },
          }
        );
      }
    }

    // ── 3. Cache miss → fetch from Replit MCP server ──────────────
    console.log("[MCP Cache] MISS — fetching from Replit MCP server…");
    const tools = await fetchMCPTools();

    // ── 4. Store in DB for next time ──────────────────────────────
    if (userId && tools.length > 0) {
      // Fire-and-forget — don't block the response
      saveCachedMcpTools({ userId, tools }).then(() => {
        console.log(
          `[MCP Cache] 💾 Saved ${tools.length} tools to DB for user ${userId.substring(0, 8)}…`
        );
      });
    }

    return Response.json(
      { tools, cached: false },
      {
        headers: {
          "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    // Gracefully handle errors — return empty array
    console.error("[MCP Cache] Error:", error);
    return Response.json({ tools: [], cached: false });
  }
}
