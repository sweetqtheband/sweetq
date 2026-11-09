import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/app/services/api/_db";
import { FactorySvc } from "@/app/services/api/factory";
import { instagramSyncSvc } from "@/app/services/api/instagram/sync";
import { timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Verify admin token for sync operations
 */
const verifyAdminToken = (request: NextRequest): boolean => {
  const adminToken = process.env.INSTAGRAM_SYNC_ADMIN_TOKEN;

  if (!adminToken) {
    console.warn("[instagram-sync] INSTAGRAM_SYNC_ADMIN_TOKEN not configured");
    return false;
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const bearerToken = authHeader.slice(7);
  const expected = Buffer.from(adminToken);
  const received = Buffer.from(bearerToken);

  if (expected.length !== received.length) {
    return false;
  }

  try {
    return timingSafeEqual(expected, received);
  } catch {
    return false;
  }
};

/**
 * POST /api/instagram/sync
 * Trigger Instagram posts synchronization
 *
 * Body:
 * {
 *   "action": "import" | "sync-post" | "stats" | "clear-old",
 *   "options": {
 *     "limit": number,
 *     "maxPages": number,
 *     "mediaType": "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REELS",
 *     "postId": string (for sync-post action),
 *     "daysOld": number (for clear-old action)
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action = "import", options = {} } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Missing action parameter" },
        { status: 400 }
      );
    }

    // Get collections
    const instagramCollection = await getCollection("instagram");
    const instagramSvc = FactorySvc("instagram", instagramCollection);

    // Get access token
    const tokenData = await instagramSvc.getAccessToken(instagramSvc);
    if (!tokenData || !tokenData.user_id) {
      return NextResponse.json(
        { error: "Instagram not authorized. Please authorize first." },
        { status: 401 }
      );
    }

    const postsCollection = await getCollection("instagramPosts");
    const sync = instagramSyncSvc(postsCollection);

    switch (action) {
      case "import": {
        // Ensure indexes
        const postsSvc = FactorySvc("instagramPosts", postsCollection);
        await postsSvc.ensureIndexes();

        // Import posts from API
        const result = await sync.importFromAPI(
          tokenData.long_live_access_token,
          tokenData.user_id,
          {
            limit: options.limit || 25,
            maxPages: options.maxPages || 10,
            mediaType: options.mediaType,
          }
        );

        return NextResponse.json(result);
      }

      case "sync-post": {
        if (!options.postId) {
          return NextResponse.json(
            { error: "Missing postId in options" },
            { status: 400 }
          );
        }

        const result = await sync.syncPostById(
          tokenData.long_live_access_token,
          options.postId
        );

        return NextResponse.json(result);
      }

      case "stats": {
        const stats = await sync.getStats();
        return NextResponse.json(stats);
      }

      case "clear-old": {
        const result = await sync.clearOldData(options.daysOld || 90);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[instagram-sync] Error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/instagram/sync
 * Get sync status and statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const postsCollection = await getCollection("instagramPosts");
    const sync = instagramSyncSvc(postsCollection);

    const stats = await sync.getStats();

    return NextResponse.json({
      status: "ok",
      stats,
    });
  } catch (error) {
    console.error("[instagram-sync] Error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
