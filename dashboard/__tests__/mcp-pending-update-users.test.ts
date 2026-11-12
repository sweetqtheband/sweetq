import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { Collection, MongoClient } from "mongodb";

const uri = process.env.MCP_TEST_MONGO_URI;

test("pending update users are exposed through MCP and filtered in MongoDB", { skip: !uri }, async () => {
  process.env.NODE_ENV = "development";
  delete process.env.DB_PROD;
  process.env.MONGODB_URI_DEV = uri;
  process.env.MONGODB_DATABASE = `mcp_pending_test_${randomUUID().replaceAll("-", "")}`;
  process.env.MCP_READ_TOKEN = "pending-test-token";

  const client = new MongoClient(uri!);
  const db = client.db(process.env.MONGODB_DATABASE);
  const route = await import("../app/(pages)/api/mcp/route");
  const { getDb, getCollection } = await import("../app/services/api/_db");
  const { updatePendingUsers } = await import("../app/services/api/instagram/pending-update");
  const { instagramSvc } = await import("../app/services/api/instagram");
  const { uploadSvc } = await import("../app/services/api/upload");
  const { default: puppeteer } = await import("puppeteer");
  const headers = {
    Authorization: "Bearer pending-test-token",
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  const call = async (args: object = {}, name = "instagram_get_pending_update_users") => {
    const response = await route.POST(new Request("https://example.test/api/mcp", {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name, arguments: args },
      }),
    }));
    assert.equal(response.status, 200);
    const body = await response.text();
    const data = body.split("\n").find((line) => line.startsWith("data: "));
    return JSON.parse(data ? data.slice(6) : body).result;
  };

  try {
    for (const name of ["followers", "followings"]) {
      await db.collection(name).insertMany([
        { username: `${name}_missing`, extracted: true, full_name: "Missing Name" },
        { username: `${name}_null`, extracted: true, short_name: null },
        { username: `${name}_empty`, extracted: true, short_name: "" },
        { username: `${name}_named`, extracted: true, short_name: "Name" },
        { username: `${name}_false`, extracted: false },
        { username: `${name}_not_extracted` },
        { username: `${name}_string`, extracted: "true" },
      ]);
    }

    const discovery = await route.GET(new Request("https://example.test/api/mcp", { headers }));
    assert.equal(discovery.status, 200);
    const discovered = await discovery.json();
    assert.ok(discovered.tools.some((tool: { name: string }) => tool.name === "instagram_get_pending_update_users"));
    assert.ok(discovered.tools.some((tool: { name: string }) => tool.name === "instagram_update_pending_users"));

    const result = await call();
    assert.notEqual(result.isError, true);
    const users = JSON.parse(result.content[0].text);
    assert.deepEqual(Object.keys(users).sort(), ["followers", "followings"]);
    for (const name of ["followers", "followings"]) {
      assert.deepEqual(
        users[name].map((user: { username: string }) => user.username).sort(),
        [`${name}_missing`, `${name}_null`],
      );
      assert.equal(users[name].find((user: { username: string }) => user.username.endsWith("_missing")).full_name, "Missing Name");
    }

    const invalid = await call({ unexpected: true });
    assert.equal(invalid.isError, true);

    const empty = await call({ followers: [], followings: [] }, "instagram_update_pending_users");
    assert.equal(empty.isError, false);
    assert.deepEqual(JSON.parse(empty.content[0].text), { followers: [], followings: [] });
    const invalidUpdate = await call({ followers: [{ _id: "bad" }], followings: [] }, "instagram_update_pending_users");
    assert.equal(invalidUpdate.isError, true);
    const duplicate = await call({ followers: [users.followers[0], users.followers[0]], followings: [] }, "instagram_update_pending_users");
    assert.equal(duplicate.isError, true);

    const followers = await getCollection("followers");
    const followings = await getCollection("followings");
    const instagram = instagramSvc(followers);
    const imageUrl = "https://example.test/instagram.jpg";
    await followers.updateOne({ username: "followers_missing" }, {
      $set: { hasS3Image: true, profile_pic_url: "/imgs/users/followers_missing.jpg", instagram_profile_pic_url: imageUrl },
    });
    const stored = await followers.findOne({ username: "followers_missing" });
    assert.ok(stored);
    const failed = users.followers.find((user: { username: string }) => user.username === "followers_null");
    const skipped = await followers.findOne({ username: "followers_empty" });
    assert.ok(skipped);
    const touched: string[] = [];
    const results = await updatePendingUsers({
      followers: [{ _id: stored._id.toString() }, failed, { _id: skipped._id.toString() }],
      followings: [],
    }, { followers, followings }, {
      getProfile: async (username) => {
        touched.push(username);
        if (username === "followers_null") return null;
        return { id: "123", username, full_name: "New name", biography: "Bio", profile_pic_url: imageUrl, isPrivate: false, isVerified: false };
      },
      updateUser: (profile, current, collection, matches, filter) =>
        instagram.updateUser(profile, current, collection, matches, undefined, { filter, upsert: false }),
    });
    assert.deepEqual(results.followers.map((user) => user.status), ["updated", "error", "skipped"]);
    assert.deepEqual(touched, ["followers_missing", "followers_null"]);
    const updated = await followers.findOne({ _id: stored._id });
    assert.equal(updated?.full_name, "New name");
    assert.equal(updated?.profile_pic_url, "/imgs/users/followers_missing.jpg");
    assert.equal(updated?.instagram_profile_pic_url, imageUrl);
    assert.equal(updated?.extracted, true);
    assert.equal((await followers.findOne({ username: "followers_null" }))?.short_name, null);

    await followers.insertOne({ username: "followings_missing", extracted: true, short_name: "Already named" });
    await followings.updateOne({ username: "followings_missing" }, {
      $set: { hasS3Image: true, profile_pic_url: "/imgs/users/followings_missing.jpg", instagram_profile_pic_url: imageUrl },
    });
    const originalLaunch = puppeteer.launch;
    let activeUsername = "";
    let closed = false;
    const fakePage = () => ({
      setRequestInterception: async () => {},
      on: () => {},
      goto: async (url: string) => { activeUsername = new URL(url).pathname.split("/")[1]; },
      waitForFunction: async () => {},
      content: async () => activeUsername === "followers_null"
        ? "profile unavailable"
        : `"xig_user_by_username":${JSON.stringify({
          pk: "123", username: activeUsername, full_name: "From Instagram",
          biography: "Bio", profile_pic_url: imageUrl, is_private: false, is_verified: false,
        })}`,
      close: async () => { closed = true; },
    });
    puppeteer.launch = async () => ({ newPage: async () => fakePage() }) as never;
    try {
      const update = await call({
        followers: [users.followers.find((user: { username: string }) => user.username === "followers_missing"), failed],
        followings: [users.followings.find((user: { username: string }) => user.username === "followings_missing")],
      }, "instagram_update_pending_users");
      assert.equal(update.isError, true);
      const outcome = JSON.parse(update.content[0].text);
      assert.deepEqual(outcome.followers.map((user: { status: string }) => user.status), ["updated", "error"]);
      assert.deepEqual(outcome.followings.map((user: { status: string }) => user.status), ["updated"]);
      assert.equal((await followers.findOne({ _id: stored._id }))?.full_name, "From Instagram");
      assert.equal((await followings.findOne({ username: "followings_missing" }))?.followed_back, true);
      assert.equal(closed, true);
    } finally {
      puppeteer.launch = originalLaunch;
    }

    const originalFetch = globalThis.fetch;
    const originalUpload = uploadSvc.uploadS3;
    const originalDelete = uploadSvc.deleteS3;
    const uploadCalls: string[] = [];
    globalThis.fetch = async () => new Response(new Uint8Array([1, 2, 3]), {
      headers: { "Content-Type": "image/jpeg" },
    });
    uploadSvc.uploadS3 = async (file) => { uploadCalls.push(file.name); return true; };
    uploadSvc.deleteS3 = async () => { throw new Error("Old image must not be deleted before updating"); };
    try {
      const newImage = "https://example.test/new.jpg";
      const imageResult = await updatePendingUsers({ followers: [{ _id: stored._id.toString() }], followings: [] }, { followers, followings }, {
        getProfile: async (username) => ({
          id: null, username, full_name: "New image", biography: null,
          profile_pic_url: newImage, isPrivate: null, isVerified: null,
        }),
        updateUser: (profile, current, collection, matches, filter) =>
          instagram.updateUser(profile, current, collection, matches, undefined, { filter, upsert: false }),
      });
      assert.equal(imageResult.followers[0].status, "updated");
      assert.deepEqual(uploadCalls, ["followers_missing.jpg"]);
      const imageUpdated = await followers.findOne({ _id: stored._id });
      assert.equal(imageUpdated?.instagram_profile_pic_url, newImage);
      assert.equal(imageUpdated?.id, "123");
      assert.equal(imageUpdated?.biography, "Bio");
      globalThis.fetch = async () => new Response(null, { status: 503 });
      const failedImage = await updatePendingUsers({ followers: [{ _id: stored._id.toString() }], followings: [] }, { followers, followings }, {
        getProfile: async (username) => ({
          id: "123", username, full_name: "Must not save", biography: null,
          profile_pic_url: "https://example.test/unavailable.jpg", isPrivate: null, isVerified: null,
        }),
        updateUser: (profile, current, collection, matches, filter) =>
          instagram.updateUser(profile, current, collection, matches, undefined, { filter, upsert: false }),
      });
      assert.equal(failedImage.followers[0].status, "error");
      assert.equal((await followers.findOne({ _id: stored._id }))?.full_name, "New image");

      const concurrent = await updatePendingUsers({ followers: [{ _id: stored._id.toString() }], followings: [] }, { followers, followings }, {
        getProfile: async (username) => {
          await followers.updateOne({ _id: stored._id }, { $set: { short_name: "Completed elsewhere" } });
          return {
            id: "123", username, full_name: "Must not overwrite", biography: null,
            profile_pic_url: newImage, isPrivate: null, isVerified: null,
          };
        },
        updateUser: (profile, current, collection, matches, filter) =>
          instagram.updateUser(profile, current, collection, matches, undefined, { filter, upsert: false }),
      });
      assert.equal(concurrent.followers[0].status, "error");
      const concurrentUser = await followers.findOne({ _id: stored._id });
      assert.equal(concurrentUser?.full_name, "New image");
      assert.equal(concurrentUser?.short_name, "Completed elsewhere");
    } finally {
      globalThis.fetch = originalFetch;
      uploadSvc.uploadS3 = originalUpload;
      uploadSvc.deleteS3 = originalDelete;
    }

    const originalFind = Collection.prototype.find;
    Collection.prototype.find = function (...args: Parameters<typeof originalFind>) {
      if (this.collectionName === "followers") throw new Error("test database failure");
      return originalFind.apply(this, args);
    } as typeof originalFind;
    try {
      const failed = await call();
      assert.equal(failed.isError, true);
    } finally {
      Collection.prototype.find = originalFind;
    }
  } finally {
    await db.dropDatabase();
    await client.close();
    await (await getDb()).client.close();
  }
});
