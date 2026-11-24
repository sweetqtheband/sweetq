import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { MongoClient } from "mongodb";
import { ensureStoryIndexes, listStoryHistory, saveStory, saveStoryInsights } from "../app/services/api/instagram/stories";

const uri = process.env.MCP_TEST_MONGO_URI;

test("story history upserts, keeps snapshots and paginates equal timestamps", { skip: !uri }, async () => {
  const client = new MongoClient(uri!);
  const db = client.db(`story_test_${randomUUID().replaceAll("-", "")}`);
  const collection = db.collection("instagram_stories");
  try {
    await client.connect();
    await ensureStoryIndexes(collection);
    const now = new Date("2026-01-01T01:00:00Z");
    const story = { id: "123", media_type: "IMAGE" as const, timestamp: "2026-01-01T00:00:00Z" };
    await saveStory(collection, story, now);
    await saveStory(collection, story, new Date("2026-01-01T02:00:00Z"));
    await saveStory(collection, { ...story, id: "124" }, now);
    const insights = { data: [{ name: "reach", values: [{ value: 10 }] }], available: ["reach"], unavailable: [] };
    await saveStoryInsights(collection, story.id, insights, now);
    await saveStoryInsights(collection, story.id, { data: [], available: [], unavailable: [{ metric: "reach", reason: "unavailable" }] }, new Date("2026-01-01T02:00:00Z"));
    const saved = await collection.findOne({ id: story.id });
    assert.equal(await collection.countDocuments({ id: story.id }), 1);
    assert.equal(saved?.snapshots.length, 2);
    assert.equal(saved?.latest_metrics.reach.values[0].value, 10);
    assert.equal(saved?.first_synced_at.toISOString(), now.toISOString());
    const first = await listStoryHistory(collection, { limit: 1 });
    assert.equal(first.paging.has_more, true);
    assert.equal(first.stories[0].snapshots, undefined);
    const second = await listStoryHistory(collection, { limit: 1, cursor: first.paging.next_cursor! });
    assert.equal(second.paging.has_more, false);
    assert.notEqual(first.stories[0].id, second.stories[0].id);
  } finally {
    await db.dropDatabase();
    await client.close();
  }
});
