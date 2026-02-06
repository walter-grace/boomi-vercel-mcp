import { auth } from "@/app/(auth)/auth";
import { invalidateMcpToolsCache } from "@/lib/db/queries";

/**
 * POST /api/mcp-tools/invalidate
 * Clears the MCP tools cache for the current user.
 * The next GET /api/mcp-tools will fetch fresh from Replit.
 */
export async function POST() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await invalidateMcpToolsCache(userId);
    console.log(
      `[MCP Cache] 🗑️ Invalidated cache for user ${userId.substring(0, 8)}…`
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("[MCP Cache] Invalidation error:", error);
    return Response.json(
      { error: "Failed to invalidate cache" },
      { status: 500 }
    );
  }
}

