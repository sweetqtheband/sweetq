import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import axios from "axios";
import { MongoClient } from "mongodb";

const uri = process.env.MCP_TEST_MONGO_URI;

test("MCP lists stories, detects story insights, and reads history without an Instagram token", { skip: !uri }, async () => {
  process.env.NODE_ENV = "development";
  delete process.env.DB_PROD;
  process.env.MONGODB_URI_DEV = uri;
  process.env.MONGODB_DATABASE = `mcp_stories_${randomUUID().replaceAll("-", "")}`;
  process.env.MCP_READ_TOKEN = "test-mcp-token";
  process.env.GRAPH_INSTAGRAM = "https://graph.example.test/v27.0";
  process.env.NEXT_PUBLIC_AWS_REGION = "us-east-1";
  const adapter = axios.defaults.adapter;
  axios.defaults.adapter = async (config) => {
    const data = config.url === "/123/stories"
      ? { data: [{ id: "456", media_type: "IMAGE", timestamp: "2026-01-01T00:00:00Z" }] }
      : { data: [{ name: config.params.metric, values: [{ value: 3 }] }] };
    return { data, status: 200, statusText: "OK", headers: {}, config };
  };
  const client = new MongoClient(uri!);
  const db = client.db(process.env.MONGODB_DATABASE);
  const { POST } = await import("../app/(pages)/api/mcp/route");
  const { getDb } = await import("../app/services/api/_db");
  const call = async (name: string, args: object) => {
    const response = await POST(new Request("https://example.test/api/mcp", {
      method: "POST",
      headers: { Authorization: "Bearer test-mcp-token", "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }),
    }));
    const body = await response.text();
    const line = body.split("\n").find((value) => value.startsWith("data: "));
    const result = JSON.parse(line ? line.slice(6) : body).result;
    assert.notEqual(result.isError, true, result.content?.[0]?.text);
    return JSON.parse(result.content[0].text);
  };
  try {
    await db.collection("instagram").insertOne({ id: "instagram", user_id: "123", long_live_access_token: "test-token" });
    const listed = await call("instagram_list_stories", {});
    assert.equal(listed.stories[0].id, "456");
    const insights = await call("instagram_get_insights", { post_id: "456", metrics: ["navigation"] });
    assert.deepEqual(insights.available, ["navigation"]);
    await db.collection("instagram_stories").insertOne({ id: "456", timestamp: "2026-01-01T00:00:00.000Z", snapshots: [{ captured_at: new Date() }] });
    await db.collection("instagram").deleteOne({ id: "instagram" });
    assert.equal((await call("instagram_get_story_history", { story_id: "456" })).snapshots.length, 1);
    const history = await call("instagram_list_story_history", { limit: 1 });
    assert.equal(history.stories[0].id, "456");
    assert.equal(history.stories[0].snapshots, undefined);
  } finally {
    await db.dropDatabase();
    await client.close();
    await (await getDb()).client.close();
    axios.defaults.adapter = adapter;
  }
});
