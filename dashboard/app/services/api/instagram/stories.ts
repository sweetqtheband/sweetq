import axios from "axios";
import { Collection, Document, Filter, ObjectId } from "mongodb";

export interface Story {
  id: string;
  media_type: "IMAGE" | "VIDEO";
  timestamp: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
}

export interface StoryInsights {
  data: Array<Record<string, unknown>>;
  available: string[];
  unavailable: Array<{ metric: string; reason: string }>;
}

const storyMetrics = ["reach", "views", "replies", "shares", "total_interactions", "navigation"];
const graph = () => axios.create({ baseURL: process.env.GRAPH_INSTAGRAM, timeout: 15000 });

export function classifyMetaError(error: unknown, token: string): string {
  if (!axios.isAxiosError(error)) {
    console.error("[Instagram stories] Request failed", error instanceof Error ? error.name : "unknown error");
    return "request_failed";
  }
  const meta = error.response?.data?.error;
  const code = typeof meta?.code === "number" ? meta.code : undefined;
  const subcode = typeof meta?.error_subcode === "number" ? meta.error_subcode : undefined;
  const message = typeof meta?.message === "string" ? meta.message.split(token).join("[redacted]").replace(/(access_token[=: ]+)[^&\s]+/gi, "$1[redacted]") : undefined;
  console.error("[Instagram stories] Meta error", { code, subcode, message, status: error.response?.status });
  if ([4, 17, 32, 613].includes(code ?? 0) || error.response?.status === 429) return "rate_limited";
  if (code === 10 && /not enough viewers/i.test(message ?? "")) return "insufficient_viewers";
  if ([10, 190, 200].includes(code ?? 0)) return "permission";
  if (code === 100 && /expired/i.test(message ?? "")) return "expired_or_not_found";
  if (code === 100 && (subcode === 33 || /does not exist|cannot be loaded|does not support this operation/i.test(message ?? ""))) return "object_not_found_or_inaccessible";
  if (code === 100 && /unavailable/i.test(message ?? "")) return "incompatible_or_unavailable";
  if (code === 100 && /metric|insight|parameter/i.test(message ?? "")) return "incompatible_or_unavailable";
  return "request_failed";
}

export async function listStories(token: string, limit = 25, cursor?: string) {
  try {
    const client = graph();
    const headers = { Authorization: `Bearer ${token}` };
    const account = await client.get<{ user_id?: unknown; data?: Array<{ user_id?: unknown }> }>("/me", {
      params: { fields: "user_id" }, headers,
    });
    const accountId = account.data.user_id ?? account.data.data?.[0]?.user_id;
    if (typeof accountId !== "string" || !/^\d+$/.test(accountId)) {
      console.error("[Instagram stories] Professional account ID unavailable in /me response");
      throw new Error("account_id_unavailable");
    }
    const response = await client.get<{ data: Story[]; paging?: { cursors?: { after?: string }; next?: string } }>(
      `/${encodeURIComponent(accountId)}/stories`,
      { params: { fields: "id,media_type,timestamp,media_url,thumbnail_url,permalink", limit, ...(cursor ? { after: cursor } : {}) }, headers }
    );
    if (!Array.isArray(response.data.data)) throw new Error("Invalid stories response");
    return {
      stories: response.data.data.map((story) => {
        const published = Date.parse(story.timestamp);
        if (!Number.isFinite(published)) throw new Error("Invalid story timestamp");
        const expires = published + 24 * 60 * 60 * 1000;
        return { ...story, expires_at: new Date(expires).toISOString(), remaining_seconds: Math.max(0, Math.floor((expires - Date.now()) / 1000)) };
      }),
      paging: { next_cursor: response.data.paging?.cursors?.after ?? null, has_more: Boolean(response.data.paging?.next) },
    };
  } catch (error) {
    if (error instanceof Error && error.message === "account_id_unavailable") {
      throw new Error("Instagram stories request failed: account_id_unavailable");
    }
    throw new Error(`Instagram stories request failed: ${classifyMetaError(error, token)}`);
  }
}

export async function getStoryInsights(token: string, id: string, metrics = storyMetrics): Promise<StoryInsights> {
  const data: Array<Record<string, unknown>> = [];
  const unavailable: StoryInsights["unavailable"] = [];
  let stopReason: string | undefined;
  for (const metric of [...new Set(metrics)]) {
    if (stopReason) {
      unavailable.push({ metric, reason: stopReason });
      continue;
    }
    if (metric === "impressions") {
      unavailable.push({ metric, reason: "deprecated" });
      continue;
    }
    try {
      const response = await graph().get<{ data: Array<Record<string, unknown>> }>(
        `/${encodeURIComponent(id)}/insights`,
        { params: { metric, ...(metric === "navigation" ? { breakdown: "story_navigation_action_type" } : {}) }, headers: { Authorization: `Bearer ${token}` } }
      );
      if (!Array.isArray(response.data.data)) throw new Error("Invalid insights response");
      const matching = response.data.data.filter((item) => item.name === metric);
      if (matching.length) data.push(...matching);
      else unavailable.push({ metric, reason: "unavailable" });
    } catch (error) {
      const reason = classifyMetaError(error, token);
      unavailable.push({ metric, reason });
      if (["permission", "rate_limited", "expired_or_not_found", "object_not_found_or_inaccessible", "request_failed"].includes(reason)) stopReason = reason;
    }
  }
  return { data, available: data.map((item) => String(item.name)), unavailable };
}

export async function ensureStoryIndexes(collection: Collection<Document>) {
  await Promise.all([
    collection.createIndex({ id: 1 }, { unique: true }),
    collection.createIndex({ timestamp: -1, _id: -1 }),
    collection.createIndex({ status: 1, expires_at: 1 }),
  ]);
}

export async function saveStory(collection: Collection<Document>, story: Story, now = new Date()) {
  const expiresAt = new Date(Date.parse(story.timestamp) + 86400000);
  if (!Number.isFinite(expiresAt.getTime())) throw new Error("Invalid story timestamp");
  const { id, media_type, timestamp, media_url, thumbnail_url, permalink } = story;
  await collection.updateOne(
    { id: story.id },
    { $set: { id, media_type, timestamp: new Date(timestamp).toISOString(), ...(media_url ? { media_url } : {}), ...(thumbnail_url ? { thumbnail_url } : {}), ...(permalink ? { permalink } : {}), expires_at: expiresAt, last_synced_at: now, status: expiresAt > now ? "active" : "expired" }, $setOnInsert: { first_synced_at: now, snapshots: [] } },
    { upsert: true }
  );
}

export async function saveStoryInsights(collection: Collection<Document>, id: string, insights: StoryInsights, now = new Date()) {
  const updates: Record<string, unknown> = { last_synced_at: now };
  for (const metric of insights.data) {
    if (typeof metric.name === "string" && /^[a-z_]+$/.test(metric.name)) updates[`latest_metrics.${metric.name}`] = { $literal: metric };
  }
  await collection.updateOne({ id }, [{ $set: {
    ...updates,
    snapshots: { $concatArrays: [{ $ifNull: ["$snapshots", []] }, [{ $literal: { captured_at: now, ...insights } }]] },
  } }]);
}

export interface StoryHistoryInput {
  start_date?: string;
  end_date?: string;
  media_type?: "IMAGE" | "VIDEO";
  status?: "active" | "expired";
  limit: number;
  cursor?: string;
}

export async function listStoryHistory(collection: Collection<Document>, input: StoryHistoryInput) {
  const filter: Filter<Document> = {};
  if (input.start_date || input.end_date) filter.timestamp = {
    ...(input.start_date ? { $gte: input.start_date } : {}),
    ...(input.end_date ? { $lte: input.end_date } : {}),
  };
  if (input.media_type) filter.media_type = input.media_type;
  if (input.status) filter.status = input.status;
  if (input.cursor) {
    let cursor: { timestamp: string; id: string };
    try {
      cursor = JSON.parse(Buffer.from(input.cursor, "base64url").toString("utf8"));
      if (!cursor.timestamp || !ObjectId.isValid(cursor.id) || !Number.isFinite(Date.parse(cursor.timestamp))) throw new Error();
    } catch {
      throw new Error("Invalid story history cursor");
    }
    filter.$or = [
      { timestamp: { $lt: cursor.timestamp } },
      { timestamp: cursor.timestamp, _id: { $lt: new ObjectId(cursor.id) } },
    ];
  }
  const items = await collection.find(filter, { projection: { snapshots: 0 } }).sort({ timestamp: -1, _id: -1 }).limit(input.limit + 1).toArray();
  const hasMore = items.length > input.limit;
  const stories = items.slice(0, input.limit);
  const last = stories[stories.length - 1];
  return { stories, paging: { has_more: hasMore, next_cursor: hasMore && last ? Buffer.from(JSON.stringify({ timestamp: last.timestamp, id: String(last._id) })).toString("base64url") : null } };
}
