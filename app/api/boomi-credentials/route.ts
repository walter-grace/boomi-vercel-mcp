import { auth } from "@/app/(auth)/auth";
import {
  getUserBoomiCredentials,
  saveUserBoomiCredentials,
} from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";
import { z } from "zod";

const credentialsSchema = z.object({
  accountId: z.string().min(1, "Account ID is required"),
  username: z.string().min(1, "Username is required"),
  apiToken: z.string().min(1, "API token is required"),
  profileName: z.string().optional(),
});

/**
 * GET /api/boomi-credentials
 * Returns user's Boomi credentials (without the actual token for security)
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new ChatSDKError("unauthorized:auth").toResponse();
  }

  try {
    const credentials = await getUserBoomiCredentials(session.user.id);

    if (!credentials) {
      return Response.json({ credentials: null });
    }

    // Return without the actual token for security
    return Response.json({
      credentials: {
        accountId: credentials.accountId,
        username: credentials.username,
        profileName: credentials.profileName,
        // Don't return apiToken
      },
    });
  } catch (error) {
    // Gracefully handle errors - return null instead of error response
    // This allows the UI to show the connect button even if DB has issues
    console.warn("Failed to get Boomi credentials (graceful fallback):", error);
    return Response.json({ credentials: null });
  }
}

/**
 * POST /api/boomi-credentials
 * Save or update user's Boomi credentials
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new ChatSDKError("unauthorized:auth").toResponse();
  }

  try {
    const body = await request.json();
    const { accountId, username, apiToken, profileName } =
      credentialsSchema.parse(body);

    await saveUserBoomiCredentials({
      userId: session.user.id,
      accountId,
      username,
      apiToken,
      profileName,
    });

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { success: false, error: error.errors[0]?.message },
        { status: 400 }
      );
    }
    
    // Handle ChatSDKError (from database queries)
    if (error instanceof ChatSDKError) {
      const errorMessage = error.message || "Database error";
      const statusCode = error.statusCode || 500;
      
      // Check if it's a migration error
      if (errorMessage.includes("migration") || errorMessage.includes("table not found")) {
        return Response.json(
          {
            success: false,
            error: errorMessage,
          },
          { status: 503 }
        );
      }
      
      return Response.json(
        { success: false, error: errorMessage },
        { status: statusCode }
      );
    }
    
    // Check if table doesn't exist (fallback)
    if (
      error instanceof Error &&
      (error.message.includes("does not exist") ||
        error.message.includes("relation") ||
        error.message.includes("table"))
    ) {
      return Response.json(
        {
          success: false,
          error:
            "Database migration required. Please run: npm run db:migrate",
        },
        { status: 503 }
      );
    }
    
    console.error("Failed to save Boomi credentials:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to save credentials";
    return Response.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

