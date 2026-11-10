import { z } from "zod";

/**
 * Input schemas for Instagram MCP tools
 * Used to validate and document tool parameters
 */

export const ListPostsInput = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .default(25)
    .describe("Number of posts to return (1-50)"),
  cursor: z
    .string()
    .optional()
    .describe("Pagination cursor from previous response"),
  media_type: z
    .enum(["IMAGE", "VIDEO", "CAROUSEL_ALBUM", "REELS"])
    .optional()
    .describe("Filter by media type"),
  start_date: z
    .string()
    .datetime()
    .optional()
    .describe("Filter posts from this date onwards (ISO 8601 format)"),
  end_date: z
    .string()
    .datetime()
    .optional()
    .describe("Filter posts until this date (ISO 8601 format)"),
});

export const GetPostInput = z.object({
  post_id: z.string().describe("Instagram post ID"),
});

export const GetInsightsInput = z.object({
  post_id: z.string().describe("Instagram post ID"),
  metrics: z
    .array(z.string())
    .optional()
    .describe("Specific metrics to retrieve (engagement, impressions, reach, etc.)"),
});

export const GetAccountInsightsInput = z.object({
  period: z
    .enum(["day", "week", "month"])
    .default("day")
    .describe("Time period for metrics"),
});

export const SearchPostsInput = z.object({
  query: z
    .string()
    .min(1)
    .max(100)
    .describe("Search term for post captions"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .default(25)
    .describe("Maximum results to return"),
  skip: z
    .number()
    .int()
    .min(0)
    .default(0)
    .describe("Number of results to skip for pagination"),
  media_type: z
    .enum(["IMAGE", "VIDEO", "CAROUSEL_ALBUM", "REELS"])
    .optional()
    .describe("Filter by media type"),
});

export type ListPostsInputType = z.infer<typeof ListPostsInput>;
export type GetPostInputType = z.infer<typeof GetPostInput>;
export type GetInsightsInputType = z.infer<typeof GetInsightsInput>;
export type GetAccountInsightsInputType = z.infer<typeof GetAccountInsightsInput>;
export type SearchPostsInputType = z.infer<typeof SearchPostsInput>;
