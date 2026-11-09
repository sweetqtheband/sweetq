import type { InstagramPage, InstagramInsightsResponse, InstagramPost } from "@/types/instagram-post";
import { GET } from "../../_api";
import dbApi from "../../_db";

/**
 * List Instagram posts with pagination and optional filters
 */
export async function listInstagramPosts(
  accessToken: string,
  userId: string,
  limit = 25,
  cursor?: string,
  mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REELS"
) {
  try {
    const graph = dbApi.create({
      baseURL: process.env.GRAPH_INSTAGRAM,
    });

    if (!userId) {
      throw new Error("Instagram User ID not found");
    }

    const params: Record<string, any> = {
      fields:
        "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{id,media_type,media_url,thumbnail_url,timestamp}",
      limit,
    };

    if (cursor) {
      params.after = cursor;
    }

    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    console.log("[listInstagramPosts] Calling Instagram API", {
      url: `/me/media`,
      fields: params.fields,
      limit: params.limit,
      mediaType,
    });

    const response = await GET(graph, `/me/media`, params, headers);

    if (!response.data) {
      throw new Error("No data returned from Instagram API");
    }

    const result = response.data as InstagramPage;

    // Filter by media type if specified
    let posts = result.data || [];
    if (mediaType) {
      posts = posts.filter((post) => post.media_type === mediaType);
    }

    return {
      posts,
      nextCursor: result.paging?.cursors?.after ?? null,
      hasMore: Boolean(result.paging?.next),
    };
  } catch (error) {
    console.error("[listInstagramPosts] Error:", error);
    throw error;
  }
}

/**
 * Get a specific Instagram post by ID
 */
export async function getInstagramPost(accessToken: string, postId: string) {
  try {
    const graph = dbApi.create({
      baseURL: process.env.GRAPH_INSTAGRAM,
    });

    const params: Record<string, any> = {
      fields:
        "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{id,media_type,media_url,thumbnail_url,timestamp}",
    };

    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    console.log("[getInstagramPost] Fetching post", { postId });

    const response = await GET(graph, `/${postId}`, params, headers);

    if (!response.data) {
      throw new Error("Post not found");
    }

    return response.data as InstagramPost;
  } catch (error) {
    console.error("[getInstagramPost] Error:", error);
    throw error;
  }
}

/**
 * Get insights for a specific post
 * Available metrics vary by media type and Instagram permissions
 */
export async function getPostInsights(accessToken: string, postId: string) {
  try {
    const graph = dbApi.create({
      baseURL: process.env.GRAPH_INSTAGRAM,
    });

    // Request all possible metrics; Instagram will return only available ones
    const metricsFields = [
      "engagement",
      "impressions",
      "reach",
      "saved",
      "video_views",
      "plays",
      "shares",
      "comments",
      "likes",
      "taps_forward",
      "taps_back",
      "answers",
    ].join(",");

    const params: Record<string, any> = {
      fields: metricsFields,
    };

    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    console.log("[getPostInsights] Fetching insights", { postId });

    const response = await GET(graph, `/${postId}/insights`, params, headers);

    if (!response.data) {
      return { data: [], available: [] };
    }

    const result = response.data as InstagramInsightsResponse;
    const available = (result.data || []).map((insight) => insight.name);

    return {
      data: result.data || [],
      available,
    };
  } catch (error) {
    console.error("[getPostInsights] Error:", error);
    // Don't throw for insights - they might not be available
    return { data: [], available: [], error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Get account-level insights
 * Requires instagram_business_manage_insights permission
 */
export async function getAccountInsights(
  accessToken: string,
  userId: string,
  period: "day" | "week" | "month" = "day"
) {
  try {
    const graph = dbApi.create({
      baseURL: process.env.GRAPH_INSTAGRAM,
    });

    // Request common account metrics
    const metricsFields = [
      "follower_count",
      "get_detailed_analytics",
      "impressions",
      "reach",
      "profile_views",
      "website_clicks",
      "email_contacts",
      "phone_call_clicks",
      "text_message_clicks",
      "online_followers",
    ].join(",");

    const params: Record<string, any> = {
      fields: metricsFields,
      period,
    };

    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    console.log("[getAccountInsights] Fetching account insights", { userId, period });

    const response = await GET(graph, `/${userId}/insights`, params, headers);

    if (!response.data) {
      return { data: [], available: [] };
    }

    const result = response.data as InstagramInsightsResponse;
    const available = (result.data || []).map((insight) => insight.name);

    return {
      data: result.data || [],
      available,
    };
  } catch (error) {
    console.error("[getAccountInsights] Error:", error);
    return {
      data: [],
      available: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get the authenticated user's Instagram business account info
 */
export async function getAccountInfo(accessToken: string) {
  try {
    const graph = dbApi.create({
      baseURL: process.env.GRAPH_INSTAGRAM,
    });

    const params: Record<string, any> = {
      fields:
        "id,username,name,biography,profile_picture_url,followers_count,follows_count,media_count,ig_id",
    };

    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    console.log("[getAccountInfo] Fetching account info");

    const response = await GET(graph, `/me`, params, headers);

    if (!response.data) {
      throw new Error("Could not retrieve account info");
    }

    return response.data;
  } catch (error) {
    console.error("[getAccountInfo] Error:", error);
    throw error;
  }
}

