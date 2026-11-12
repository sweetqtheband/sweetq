import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { MongoClient, ObjectId } from "mongodb";
import { NextRequest } from "next/server";

const uri = process.env.MCP_TEST_MONGO_URI;

test("extracted and deleted users are hidden from MCP and dashboard views", { skip: !uri }, async () => {
  process.env.NODE_ENV = "development";
  delete process.env.DB_PROD;
  process.env.MONGODB_URI_DEV = uri;
  process.env.MONGODB_DATABASE = `instagram_visibility_${randomUUID().replaceAll("-", "")}`;
  process.env.MCP_READ_TOKEN = "visibility-test-token";
  const client = new MongoClient(uri!);
  const db = client.db(process.env.MONGODB_DATABASE);
  const mcp = await import("../app/(pages)/api/mcp/route");
  const followerRoute = await import("../app/(pages)/api/followers/route");
  const followingRoute = await import("../app/(pages)/api/followings/route");
  const totalsRoute = await import("../app/(pages)/api/dashboard/totalFollowers/route");
  const statesRoute = await import("../app/(pages)/api/dashboard/followersByState/route");
  const { getDb, getCollection } = await import("../app/services/api/_db");
  const { getCatalogUsers } = await import("../app/services/api/instagram/catalog-users");
  const { CatalogUsersInput } = await import("../app/services/api/instagram/validators");
  const { visibleInstagramUserFilter } = await import("../app/services/api/instagram/user-visibility");
  const { reconcileHiddenImportUsers, updateFollowedBacks } = await import("../app/services/api/imports");
  const headers = {
    Authorization: "Bearer visibility-test-token",
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  const call = async (name: string, args: object = {}) => {
    const response = await mcp.POST(new Request("https://example.test/api/mcp", {
      method: "POST", headers,
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }),
    }));
    assert.equal(response.status, 200);
    const body = await response.text();
    const data = body.split("\n").find((line) => line.startsWith("data: "));
    const result = JSON.parse(data ? data.slice(6) : body).result;
    assert.notEqual(result.isError, true);
    return JSON.parse(result.content[0].text);
  };

  try {
    const tag = new ObjectId();
    await db.collection("tags").insertOne({ _id: tag, name: "Responde" });
    await db.collection("filters").insertOne({ key: "all", filters: { show: "2" } });
    for (const origin of ["followers", "followings"]) {
      await db.collection(origin).insertMany([
        { username: `${origin}_hidden`, extracted: true, deleted: true },
        { username: `${origin}_visible`, extracted: true, deleted: false },
        { username: `${origin}_no_deleted`, extracted: true },
        { username: `${origin}_not_extracted`, extracted: false, deleted: true },
        { username: `${origin}_no_extracted`, deleted: true },
        { username: `${origin}_neither`, extracted: false, deleted: false },
      ].map((user) => ({
        ...user,
        full_name: "Valid Name",
        short_name: null,
        unfollow: false,
        tags: [String(tag)],
        instagram_conversation_id: "test-conversation",
      })));
    }

    for (const [origin, handler] of [["followers", followerRoute.GET], ["followings", followingRoute.GET]] as const) {
      const expected = [
        `${origin}_visible`, `${origin}_no_deleted`, `${origin}_not_extracted`,
        `${origin}_no_extracted`, `${origin}_neither`,
      ].sort();
      const items: string[] = [];
      let cursor: string | null = null;
      do {
        const page = await call(`instagram_get_${origin}`, { filters: { show: "2" }, limit: 2, ...(cursor ? { cursor } : {}) });
        items.push(...page.items.map((user: { username: string }) => user.username));
        cursor = page.next_cursor;
      } while (cursor);
      assert.deepEqual(items.sort(), expected);

      const response = await handler(new NextRequest(`https://example.test/api/${origin}?filter=all&limit=20`));
      const listing = await response.json();
      assert.equal(listing.total, 5);
      assert.deepEqual(listing.items.map((user: { username: string }) => user.username).sort(), expected);

      const catalog = await call("instagram_get_users_to_catalog", { action: "list", origin });
      assert.deepEqual(catalog.items.map((user: { username: string }) => user.username).sort(), expected);
      const hidden = await db.collection(origin).findOne({ username: `${origin}_hidden` });
      assert.ok(hidden);
      let requestedMessages = false;
      await assert.rejects(() => getCatalogUsers(
        CatalogUsersInput.parse({ action: "messages", origin, user_id: hidden._id.toString() }),
        db.collection(origin),
        db.collection("tags"),
        async () => { requestedMessages = true; return []; },
      ));
      assert.equal(requestedMessages, false);
      const importUsers = await (await getCollection(origin)).find(visibleInstagramUserFilter).toArray();
      assert.deepEqual(importUsers.map((user) => user.username).sort(), expected);
    }

    const unnamed = await call("instagram_get_unnamed_users");
    const pending = await call("instagram_get_pending_update_users");
    for (const origin of ["followers", "followings"]) {
      assert.deepEqual(unnamed[origin].map((user: { username: string }) => user.username).sort(),
        [`${origin}_no_deleted`, `${origin}_visible`]);
      assert.deepEqual(pending[origin].map((user: { username: string }) => user.username).sort(),
        [`${origin}_neither`, `${origin}_not_extracted`]);
    }
    const totals = await (await totalsRoute.GET(new NextRequest("https://example.test/api/dashboard/totalFollowers"))).json();
    assert.equal(totals.total, 5);
    assert.equal(totals.byTag[0].count, 5);
    const states = await (await statesRoute.GET(new NextRequest("https://example.test/api/dashboard/followersByState"))).json();
    assert.equal(states.total, 5);
    assert.equal(states.unknown, 5);

    const importData = {
      newFollowers: ["followers_hidden", "followers_not_extracted", "new_follower"],
      newFollowings: ["followings_hidden", "new_following"],
      sameFollowers: ["existing_follower"],
      sameFollowings: ["existing_following"],
    };
    await reconcileHiddenImportUsers(importData, db.collection("followers"), db.collection("followings"));
    assert.deepEqual(importData.newFollowers, ["followers_not_extracted", "new_follower"]);
    assert.deepEqual(importData.newFollowings, ["new_following"]);
    assert.deepEqual(importData.sameFollowers, ["existing_follower", "followers_hidden"]);
    assert.deepEqual(importData.sameFollowings, ["existing_following", "followings_hidden"]);

    await db.collection("followers").insertMany([
      { username: "visible_pair", extracted: true },
      { username: "hidden_follower", extracted: true, deleted: true },
      { username: "hidden_following", extracted: true },
    ]);
    await db.collection("followings").insertMany([
      { username: "visible_pair", extracted: true },
      { username: "hidden_follower", extracted: true },
      { username: "hidden_following", extracted: true, deleted: true },
    ]);
    const importLog: string[] = [];
    await updateFollowedBacks({
      data: {}, followersCol: db.collection("followers"), followingsCol: db.collection("followings"),
      logProcess: (message) => importLog.push(message),
    });
    assert.ok(importLog.includes("User visible_pair followed back"));
    assert.ok(!importLog.some((message) => message.includes("hidden_follower") || message.includes("hidden_following")));
    assert.equal((await db.collection("followings").findOne({ username: "visible_pair" }))?.followed_back, true);
  } finally {
    await db.dropDatabase();
    await client.close();
    await (await getDb()).client.close();
  }
});
