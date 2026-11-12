import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { Collection, MongoClient, ObjectId } from "mongodb";

const uri = process.env.MCP_TEST_MONGO_URI;

test("MCP updates the supplied fields of existing users", { skip: !uri }, async () => {
  process.env.NODE_ENV = "development";
  delete process.env.DB_PROD;
  process.env.MONGODB_URI_DEV = uri;
  process.env.MONGODB_DATABASE = `mcp_update_users_test_${randomUUID().replaceAll("-", "")}`;
  process.env.MCP_READ_TOKEN = "update-users-test-token";

  const client = new MongoClient(uri!);
  const db = client.db(process.env.MONGODB_DATABASE);
  const route = await import("../app/(pages)/api/mcp/route");
  const { getDb } = await import("../app/services/api/_db");
  const headers = {
    Authorization: "Bearer update-users-test-token",
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  const call = async (args: object) => {
    const response = await route.POST(new Request("https://example.test/api/mcp", {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name: "instagram_update_users", arguments: args },
      }),
    }));
    assert.equal(response.status, 200);
    const body = await response.text();
    const data = body.split("\n").find((line) => line.startsWith("data: "));
    return JSON.parse(data ? data.slice(6) : body).result;
  };

  try {
    const follower = await db.collection("followers").insertOne({
      username: "follower", full_name: "Full", short_name: null, tags: ["original"], unchanged: true,
    });
    const following = await db.collection("followings").insertOne({
      username: "following", full_name: "Full", short_name: null, unchanged: true,
    });
    const missing = new ObjectId();
    const discovery = await route.GET(new Request("https://example.test/api/mcp", { headers }));
    const discovered = await discovery.json();
    assert.ok(discovered.tools.some((tool: { name: string }) => tool.name === "instagram_update_users"));

    const result = await call({
      followers: [{ _id: follower.insertedId.toString(), short_name: "Ana", full_name: null, tags: ["new"], metadata: { source: "mcp" } }],
      followings: [{ _id: following.insertedId.toString(), short_name: "Luis" }, { _id: missing.toString(), short_name: "Missing" }],
    });
    assert.equal(result.isError, true);
    const outcomes = JSON.parse(result.content[0].text);
    assert.deepEqual(outcomes.followers.map((user: { status: string }) => user.status), ["updated"]);
    assert.deepEqual(outcomes.followings.map((user: { status: string }) => user.status), ["updated", "not_found"]);
    const updatedFollower = await db.collection("followers").findOne({ _id: follower.insertedId });
    assert.equal(updatedFollower?.short_name, "Ana");
    assert.equal(updatedFollower?.full_name, null);
    assert.deepEqual(updatedFollower?.tags, ["new"]);
    assert.deepEqual(updatedFollower?.metadata, { source: "mcp" });
    assert.equal(updatedFollower?.username, "follower");
    assert.equal(updatedFollower?.unchanged, true);
    assert.equal((await db.collection("followings").findOne({ _id: following.insertedId }))?.short_name, "Luis");
    assert.equal(await db.collection("followings").findOne({ _id: missing }), null);

    const single = await call({ followers: [{ _id: follower.insertedId.toString(), short_name: "Changed" }] });
    assert.equal(single.isError, false);
    assert.deepEqual(JSON.parse(single.content[0].text).followings, []);
    assert.equal((await db.collection("followers").findOne({ _id: follower.insertedId }))?.short_name, "Changed");
    assert.equal((await call({ followings: [] })).isError, false);

    const emptyInput = await call({});
    assert.equal(emptyInput.isError, true);
    assert.match(emptyInput.content[0].text, /Provide followers, followings, or both/);
    for (const invalid of [
      { followers: [{ _id: "bad", short_name: "x" }] },
      { followers: [{ _id: follower.insertedId.toString() }] },
      { followers: [{ _id: follower.insertedId.toString(), short_name: "x" }, { _id: follower.insertedId.toString().toUpperCase(), short_name: "y" }] },
      { followers: [{ _id: follower.insertedId.toString(), "nested.value": "x" }] },
      { followers: [{ _id: follower.insertedId.toString(), $set: { short_name: "x" } }] },
      { followers: [{ _id: follower.insertedId.toString(), short_name: "must-not-write" }], followings: [{ _id: following.insertedId.toString() }] },
    ]) {
      assert.equal((await call(invalid)).isError, true);
    }
    assert.equal((await db.collection("followers").findOne({ _id: follower.insertedId }))?.short_name, "Changed");

    const originalUpdate = Collection.prototype.updateOne;
    Collection.prototype.updateOne = function (...args: Parameters<typeof originalUpdate>) {
      if (this.collectionName === "followers") throw new Error("test database failure");
      return originalUpdate.apply(this, args);
    } as typeof originalUpdate;
    try {
      const failed = await call({ followers: [{ _id: follower.insertedId.toString(), short_name: "x" }] });
      assert.equal(failed.isError, true);
      assert.equal(JSON.parse(failed.content[0].text).followers[0].status, "error");
    } finally {
      Collection.prototype.updateOne = originalUpdate;
    }
  } finally {
    await db.dropDatabase();
    await client.close();
    await (await getDb()).client.close();
  }
});
