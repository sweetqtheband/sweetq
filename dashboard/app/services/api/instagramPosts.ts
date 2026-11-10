import { Collection, Document, ObjectId } from "mongodb";
import { BaseSvc } from "./_base";
import { Model } from "@/app/models/instagramPost";
import { StoredInstagramPost } from "@/types/instagram-post";

/**
 * Instagram Posts Service
 * Manages Instagram posts stored in MongoDB, including search and sync
 */
export const instagramPostsSvc = (collection: Collection<Document>) => {
  const base = BaseSvc(collection, Model);

  return {
    ...base,

    /**
     * Find posts by caption text
     */
    findByCaption: async (query: string, limit: number = 50, skip: number = 0) => {
      try {
        const regex = new RegExp(query, "i");
        const posts = await collection
          .find({ caption: { $regex: regex } })
          .skip(skip)
          .limit(limit)
          .sort({ timestamp: -1 })
          .toArray();

        const total = await collection.countDocuments({ caption: { $regex: regex } });

        return {
          posts: posts.map((p) => Model(p)),
          total,
          hasMore: skip + limit < total,
        };
      } catch (error) {
        console.error("[instagramPostsSvc.findByCaption] Error:", error);
        return { posts: [], total: 0, hasMore: false };
      }
    },

    /**
     * Find posts by date range
     */
    findByDateRange: async (
      startDate: Date,
      endDate: Date,
      limit: number = 50,
      skip: number = 0
    ) => {
      try {
        const posts = await collection
          .find({
            timestamp: { $gte: startDate.toISOString(), $lte: endDate.toISOString() },
          })
          .skip(skip)
          .limit(limit)
          .sort({ timestamp: -1 })
          .toArray();

        const total = await collection.countDocuments({
          timestamp: { $gte: startDate.toISOString(), $lte: endDate.toISOString() },
        });

        return {
          posts: posts.map((p) => Model(p)),
          total,
          hasMore: skip + limit < total,
        };
      } catch (error) {
        console.error("[instagramPostsSvc.findByDateRange] Error:", error);
        return { posts: [], total: 0, hasMore: false };
      }
    },

    /**
     * Find posts by media type
     */
    findByMediaType: async (
      mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REELS",
      limit: number = 50,
      skip: number = 0
    ) => {
      try {
        const posts = await collection
          .find({ media_type: mediaType })
          .skip(skip)
          .limit(limit)
          .sort({ timestamp: -1 })
          .toArray();

        const total = await collection.countDocuments({ media_type: mediaType });

        return {
          posts: posts.map((p) => Model(p)),
          total,
          hasMore: skip + limit < total,
        };
      } catch (error) {
        console.error("[instagramPostsSvc.findByMediaType] Error:", error);
        return { posts: [], total: 0, hasMore: false };
      }
    },

    /**
     * Upsert a post (insert if not exists, update if exists)
     */
    upsert: async (post: StoredInstagramPost) => {
      try {
        const result = await collection.findOneAndUpdate(
          { id: post.id },
          {
            $set: {
              ...post,
              updated_at: new Date(),
            },
          },
          { upsert: true, returnDocument: "after" }
        );

        const doc = result?.value;
        return doc ? Model(doc) : null;
      } catch (error) {
        console.error("[instagramPostsSvc.upsert] Error:", error);
        throw error;
      }
    },

    /**
     * Upsert multiple posts
     */
    upsertMany: async (posts: StoredInstagramPost[]) => {
      if (!posts || posts.length === 0) return { inserted: 0, updated: 0 };

      try {
        const operations = posts.map((post) => ({
          updateOne: {
            filter: { id: post.id },
            update: {
              $set: {
                ...post,
                updated_at: new Date(),
              },
            },
            upsert: true,
          },
        }));

        const result = await collection.bulkWrite(operations);
        return {
          inserted: result.upsertedCount,
          updated: result.modifiedCount,
        };
      } catch (error) {
        console.error("[instagramPostsSvc.upsertMany] Error:", error);
        throw error;
      }
    },

    /**
     * Find post by Instagram ID
     */
    findById: async (id: string) => {
      try {
        const post = await collection.findOne({ id });
        return post ? Model(post) : null;
      } catch (error) {
        console.error("[instagramPostsSvc.findById] Error:", error);
        return null;
      }
    },

    /**
     * Get recent posts with optional filters
     */
    getRecent: async (
      limit: number = 50,
      mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REELS"
    ) => {
      try {
        const query = mediaType ? { media_type: mediaType } : {};
        const posts = await collection
          .find(query)
          .sort({ timestamp: -1 })
          .limit(limit)
          .toArray();

        return posts.map((p) => Model(p));
      } catch (error) {
        console.error("[instagramPostsSvc.getRecent] Error:", error);
        return [];
      }
    },

    /**
     * Create text search index
     */
    ensureIndexes: async () => {
      try {
        await collection.createIndex({ id: 1 }, { unique: true });
        await collection.createIndex({ timestamp: -1 });
        await collection.createIndex({ media_type: 1 });
        await collection.createIndex({ caption: "text" });
        await collection.createIndex({ synced_at: -1 });
      } catch (error) {
        console.error("[instagramPostsSvc.ensureIndexes] Error:", error);
      }
    },

    /**
     * Count total posts
     */
    count: async () => {
      try {
        return await collection.countDocuments();
      } catch (error) {
        console.error("[instagramPostsSvc.count] Error:", error);
        return 0;
      }
    },

    /**
     * Delete old posts (by synced_at date)
     */
    deleteOlderThan: async (days: number) => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      try {
        const result = await collection.deleteMany({
          synced_at: { $lt: cutoffDate },
        });

        return result.deletedCount;
      } catch (error) {
        console.error("[instagramPostsSvc.deleteOlderThan] Error:", error);
        return 0;
      }
    },
  };
};
