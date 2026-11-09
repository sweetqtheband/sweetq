import { Collection, Document } from "mongodb";
import { listInstagramPosts, getInstagramPost } from "./media";
import { StoredInstagramPost } from "@/types/instagram-post";
import { Model } from "@/app/models/instagramPost";

interface SyncResult {
  success: boolean;
  imported: number;
  updated: number;
  errors: Array<{ id: string; error: string }>;
  duration: number;
  message: string;
}

/**
 * Instagram Posts Sync Service
 * Handles synchronization of Instagram posts to MongoDB
 */
export const instagramSyncSvc = (postsCollection: Collection<Document>) => {
  return {
    /**
     * Import Instagram posts from API to MongoDB
     * Recursively pages through all available posts
     */
    importFromAPI: async (
      accessToken: string,
      userId: string,
      options: {
        limit?: number;
        maxPages?: number;
        mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REELS";
      } = {}
    ): Promise<SyncResult> => {
      const startTime = Date.now();
      const maxPages = options.maxPages || 10;
      const pageLimit = Math.min(options.limit || 25, 100);
      let imported = 0;
      let updated = 0;
      const errors: Array<{ id: string; error: string }> = [];
      let cursor: string | null = null;
      let pageCount = 0;

      try {
        console.log("[instagramSyncSvc.importFromAPI] Starting import", {
          userId,
          maxPages,
          pageLimit,
          mediaType: options.mediaType,
        });

        while (pageCount < maxPages) {
          try {
            const response = await listInstagramPosts(
              accessToken,
              userId,
              pageLimit,
              cursor || undefined,
              options.mediaType
            );

            const posts = response.posts;
            if (!posts || posts.length === 0) {
              console.log("[instagramSyncSvc.importFromAPI] No more posts to import");
              break;
            }

            // Transform and upsert posts
            for (const post of posts) {
              try {
                const storedPost: StoredInstagramPost = {
                  id: post.id,
                  caption: post.caption,
                  media_type: post.media_type as any,
                  media_url: post.media_url,
                  thumbnail_url: post.thumbnail_url,
                  permalink: post.permalink,
                  timestamp: post.timestamp,
                  children: post.children,
                  synced_at: new Date(),
                  created_at: new Date(),
                  updated_at: new Date(),
                };

                const existing = await postsCollection.findOne({ id: post.id });
                if (existing) {
                  updated++;
                } else {
                  imported++;
                }

                await postsCollection.findOneAndUpdate(
                  { id: post.id },
                  {
                    $set: storedPost,
                  },
                  { upsert: true }
                );
              } catch (error) {
                errors.push({
                  id: post.id,
                  error: error instanceof Error ? error.message : "Unknown error",
                });
                console.error(`[instagramSyncSvc.importFromAPI] Error upserting post ${post.id}:`, error);
              }
            }

            cursor = response.nextCursor;
            pageCount++;

            if (!response.hasMore || !cursor) {
              console.log("[instagramSyncSvc.importFromAPI] Reached end of posts");
              break;
            }

            // Small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (pageError) {
            console.error(`[instagramSyncSvc.importFromAPI] Error on page ${pageCount}:`, pageError);
            errors.push({
              id: `page-${pageCount}`,
              error: pageError instanceof Error ? pageError.message : "Unknown error",
            });
            break;
          }
        }

        const duration = Date.now() - startTime;

        return {
          success: errors.length === 0,
          imported,
          updated,
          errors,
          duration,
          message: `Imported ${imported} new posts, updated ${updated} existing posts in ${duration}ms`,
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        return {
          success: false,
          imported,
          updated,
          errors: [
            ...errors,
            {
              id: "sync",
              error: errorMessage,
            },
          ],
          duration,
          message: `Sync failed after ${duration}ms: ${errorMessage}`,
        };
      }
    },

    /**
     * Sync a single post by ID
     */
    syncPostById: async (
      accessToken: string,
      postId: string
    ): Promise<{ success: boolean; post?: StoredInstagramPost; error?: string }> => {
      try {
        const post = await getInstagramPost(accessToken, postId);

        const storedPost: StoredInstagramPost = {
          id: post.id,
          caption: post.caption,
          media_type: post.media_type as any,
          media_url: post.media_url,
          thumbnail_url: post.thumbnail_url,
          permalink: post.permalink,
          timestamp: post.timestamp,
          children: post.children,
          synced_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        };

        const result = await postsCollection.findOneAndUpdate(
          { id: postId },
          { $set: storedPost },
          { upsert: true, returnDocument: "after" }
        );

        const updatedDoc = result?.value;
        return {
          success: true,
          post: updatedDoc ? Model(updatedDoc) : undefined,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`[instagramSyncSvc.syncPostById] Error:`, error);

        return {
          success: false,
          error: errorMessage,
        };
      }
    },

    /**
     * Get sync statistics
     */
    getStats: async () => {
      try {
        const total = await postsCollection.countDocuments();
        const lastSynced = await postsCollection
          .find({})
          .sort({ synced_at: -1 })
          .limit(1)
          .toArray();

        const imageCount = await postsCollection.countDocuments({ media_type: "IMAGE" });
        const videoCount = await postsCollection.countDocuments({ media_type: "VIDEO" });
        const reelsCount = await postsCollection.countDocuments({ media_type: "REELS" });
        const carouselCount = await postsCollection.countDocuments({
          media_type: "CAROUSEL_ALBUM",
        });

        return {
          total,
          lastSynced: lastSynced[0]?.synced_at || null,
          byMediaType: {
            IMAGE: imageCount,
            VIDEO: videoCount,
            REELS: reelsCount,
            CAROUSEL_ALBUM: carouselCount,
          },
        };
      } catch (error) {
        console.error("[instagramSyncSvc.getStats] Error:", error);
        return {
          total: 0,
          lastSynced: null,
          byMediaType: {
            IMAGE: 0,
            VIDEO: 0,
            REELS: 0,
            CAROUSEL_ALBUM: 0,
          },
        };
      }
    },

    /**
     * Clear old synced data (optional maintenance)
     */
    clearOldData: async (daysOld: number = 90) => {
      try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const result = await postsCollection.deleteMany({
          synced_at: { $lt: cutoffDate },
        });

        console.log(`[instagramSyncSvc.clearOldData] Deleted ${result.deletedCount} old posts`);

        return {
          success: true,
          deletedCount: result.deletedCount,
        };
      } catch (error) {
        console.error("[instagramSyncSvc.clearOldData] Error:", error);

        return {
          success: false,
          deletedCount: 0,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  };
};
