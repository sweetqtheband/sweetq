import type { InstagramPage } from "@/types/instagram-post";
import { GET } from "../../_api";
import dbApi from "../../_db";

export async function listInstagramPosts(
  accessToken: string,
  limit = 25,
  cursor?: string
) {
  try {
    const graph = dbApi.create({
      baseURL: process.env.GRAPH_INSTAGRAM,
    });

    const params: Record<string, any> = {
      fields:
        "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
      limit,
    };

    if (cursor) {
      params.after = cursor;
    }

    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    console.log("[listInstagramPosts] Calling Instagram API with params:", {
      url: "/me/media",
      fields: params.fields,
      limit: params.limit,
      hasToken: !!accessToken,
    });

    const response = await GET(graph, `/me/media`, params, headers);

    console.log("[listInstagramPosts] Response status:", response.status);

    if (!response.data) {
      throw new Error("No data returned from Instagram API");
    }

    const result = response.data as InstagramPage;

    return {
      posts: result.data || [],
      nextCursor: result.paging?.cursors?.after ?? null,
      hasMore: Boolean(result.paging?.next),
    };
  } catch (error) {
    console.error("[listInstagramPosts] Error:", error);
    throw error;
  }
}
