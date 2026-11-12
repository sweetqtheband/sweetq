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

export const GetPendingUpdateUsersInput = z.object({}).strict();
export const GetUnnamedUsersInput = z.object({}).strict();

const catalogId = z.string().regex(/^\d+$/).describe("Numeric catalog ID returned by instagram_search_filter_options");
const pageFields = {
  limit: z.number().int().min(1).max(100).default(50).describe("Maximum items per page (1-100)"),
  cursor: z.string().regex(/^[0-9a-fA-F]{24}$/).optional().describe("next_cursor from the previous page"),
};

export const UserFiltersInput = z.object({
  country: catalogId.optional(),
  state: catalogId.optional(),
  city: catalogId.optional(),
  tags: z.array(z.string().min(1)).optional().describe("Match at least one of these tag IDs"),
  withoutTags: z.array(z.string().min(1)).optional().describe("Exclude users with any of these tag IDs"),
  treatment: z.array(z.number().int().min(1).max(2)).optional().describe("1 = person, 2 = collective"),
  show: z.enum(["0", "1", "2"]).default("0").describe("0 = active, 1 = unfollowed, 2 = all"),
}).strict();

export const ListUsersInput = z.object({
  filters: UserFiltersInput.default({ show: "0" }),
  query: z.string().min(1).max(100).optional().describe("Literal search in username and full_name"),
  ...pageFields,
}).strict();

export const FilterDefinitionsInput = z.object({}).strict();

export const FilterOptionsInput = z.object({
  type: z.enum(["country", "state", "city", "tag"]),
  query: z.string().min(1).max(100).optional().describe("Literal name search, in Spanish or English"),
  country_id: catalogId.optional().describe("Restrict states to this country ID"),
  state_id: catalogId.optional().describe("Restrict cities to this state ID"),
  ...pageFields,
}).strict().superRefine((input, ctx) => {
  if (input.country_id && input.type !== "state") {
    ctx.addIssue({ code: "custom", path: ["country_id"], message: "Only valid for state options" });
  }
  if (input.state_id && input.type !== "city") {
    ctx.addIssue({ code: "custom", path: ["state_id"], message: "Only valid for city options" });
  }
});

const PendingUser = z.object({
  _id: z.string().regex(/^[0-9a-fA-F]{24}$/),
}).passthrough();

export const UpdatePendingUsersInput = z.object({
  followers: z.array(PendingUser),
  followings: z.array(PendingUser),
}).strict();

export const UpdateUsersInput = z.object({
  followers: z.array(PendingUser).optional(),
  followings: z.array(PendingUser).optional(),
}).strict();

export type ListPostsInputType = z.infer<typeof ListPostsInput>;
export type GetPostInputType = z.infer<typeof GetPostInput>;
export type GetInsightsInputType = z.infer<typeof GetInsightsInput>;
export type GetAccountInsightsInputType = z.infer<typeof GetAccountInsightsInput>;
export type SearchPostsInputType = z.infer<typeof SearchPostsInput>;
