import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { MongoClient, ObjectId } from "mongodb";
import axios from "axios";

const uri = process.env.MCP_TEST_MONGO_URI;

test("catalog candidates and selected incoming messages are exposed without updating users", { skip: !uri }, async () => {
  process.env.NODE_ENV = "development";
  delete process.env.DB_PROD;
  process.env.MONGODB_URI_DEV = uri;
  process.env.MONGODB_DATABASE = `mcp_catalog_${randomUUID().replaceAll("-", "")}`;
  process.env.MCP_READ_TOKEN = "catalog-test-token";
  process.env.GRAPH_INSTAGRAM = "https://graph.example.test";
  process.env.NEXT_PUBLIC_API_URI = "https://cache.example.test";
  let graphFailure = false;
  let messageFailure = false;
  const originalAdapter = axios.defaults.adapter;
  axios.defaults.adapter = async (config) => {
    let data: unknown;
    if (config.baseURL === "https://cache.example.test/cache") {
      data = null;
    } else if (config.baseURL === "https://graph.example.test" && !graphFailure) {
      if (config.url === "/conversation-2") {
        data = { messages: { data: [{ id: "m1", created_time: "2025-01-01T00:00:00Z" }] } };
      } else if (config.url === "/m1") {
        if (messageFailure) throw new Error("Synthetic message failure");
        data = { id: "m1", from: { username: "followers_two" }, message: "Synthetic message" };
      } else {
        throw new Error("Unexpected Graph request");
      }
    } else {
      throw new Error("Synthetic Graph failure");
    }
    return { data, status: 200, statusText: "OK", headers: {}, config };
  };
  const client = new MongoClient(uri!);
  const db = client.db(process.env.MONGODB_DATABASE);
  const route = await import("../app/(pages)/api/mcp/route");
  const { getDb, getCollection } = await import("../app/services/api/_db");
  const { getCatalogUsers } = await import("../app/services/api/instagram/catalog-users");
  const { CatalogUsersInput } = await import("../app/services/api/instagram/validators");
  const headers = {
    Authorization: "Bearer catalog-test-token",
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  const call = async (args: object) => {
    const response = await route.POST(new Request("https://example.test/api/mcp", {
      method: "POST", headers,
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "instagram_get_users_to_catalog", arguments: args } }),
    }));
    assert.equal(response.status, 200);
    const body = await response.text();
    const data = body.split("\n").find((line) => line.startsWith("data: "));
    return JSON.parse(data ? data.slice(6) : body).result;
  };
  try {
    const tag = new ObjectId();
    await db.collection("tags").insertOne({ _id: tag, name: "Responde" });
    for (const origin of ["followers", "followings"]) {
      await db.collection(origin).insertMany([
        { username: `${origin}_one`, full_name: "One", instagram_conversation_id: "conversation-1", tags: [String(tag)] },
        { username: `${origin}_two`, instagram_conversation_id: "conversation-2", tags: [String(tag)], state: NaN },
        { username: "has_state", instagram_conversation_id: "conversation-3", tags: [String(tag)], state: 10 },
        { username: "has_catalog", instagram_conversation_id: "conversation-4", tags: [String(tag)], catalogued: 1 },
        { username: "no_tag", instagram_conversation_id: "conversation-5" },
        { username: "no_conversation", tags: [String(tag)] },
        { username: "null_conversation", tags: [String(tag)], instagram_conversation_id: null },
      ]);
    }

    const discovered = await route.GET(new Request("https://example.test/api/mcp", { headers }));
    assert.ok((await discovered.json()).tools.some((tool: { name: string }) => tool.name === "instagram_get_users_to_catalog"));
    for (const origin of ["followers", "followings"] as const) {
      const firstResponse = await call({ action: "list", origin, limit: 1 });
      assert.notEqual(firstResponse.isError, true);
      const first = JSON.parse(firstResponse.content[0].text);
      assert.equal(first.items.length, 1);
      assert.equal(first.has_more, true);
      const second = JSON.parse((await call({ action: "list", origin, limit: 1, cursor: first.next_cursor })).content[0].text);
      assert.equal(second.has_more, false);
      assert.notEqual(first.items[0]._id, second.items[0]._id);
      const users = await getCollection(origin);
      const tags = await getCollection("tags");
      const input = CatalogUsersInput.parse({ action: "messages", origin, user_id: first.items[0]._id });
      const result = await getCatalogUsers(input, users, tags, async (conversationId) => {
        assert.equal(conversationId, "conversation-1");
        return [
          { from: { username: `${origin}_one` }, message: "Recent" },
          { from: { username: "sweetqtheband" }, message: "Do not include" },
          { from: { username: `${origin}_one` }, message: "Earlier" },
          { from: { username: `${origin}_one` } },
        ];
      });
      assert.deepEqual(result, { origin, user_id: first.items[0]._id, username: `${origin}_one`, messages: ["Earlier", "Recent"] });
      assert.equal((await users.findOne({ _id: new ObjectId(first.items[0]._id) }))?.catalogued, undefined);
      await assert.rejects(() => getCatalogUsers(input, users, tags, async () => { throw new Error("Instagram failure"); }));
      await assert.rejects(() => getCatalogUsers(input, users, tags, async () => ["REVOKED"]));
      await users.updateOne({ _id: new ObjectId(first.items[0]._id) }, { $set: { catalogued: 1 } });
      await assert.rejects(() => getCatalogUsers(input, users, tags, async () => []));
      const noToken = await call({ action: "messages", origin, user_id: second.items[0]._id });
      assert.equal(noToken.isError, true);
    }
    assert.equal((await call({ action: "messages", origin: "followers" })).isError, true);
    await db.collection("instagram").insertOne({ id: "instagram", long_live_access_token: "synthetic-token" });
    const remaining = await db.collection("followers").findOne({ username: "followers_two" });
    assert.ok(remaining);
    const messageResponse = await call({ action: "messages", origin: "followers", user_id: remaining._id.toString() });
    assert.notEqual(messageResponse.isError, true);
    assert.deepEqual(JSON.parse(messageResponse.content[0].text).messages, ["Synthetic message"]);
    messageFailure = true;
    assert.equal((await call({ action: "messages", origin: "followers", user_id: remaining._id.toString() })).isError, true);
    messageFailure = false;
    graphFailure = true;
    assert.equal((await call({ action: "messages", origin: "followers", user_id: remaining._id.toString() })).isError, true);
    await db.collection("tags").deleteOne({ _id: tag });
    assert.equal((await call({ action: "list", origin: "followers" })).isError, true);
  } finally {
    await db.dropDatabase();
    await client.close();
    await (await getDb()).client.close();
    axios.defaults.adapter = originalAdapter;
  }
});
