import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { Collection, MongoClient, ObjectId } from "mongodb";
import { NextRequest } from "next/server";

const uri = process.env.MCP_TEST_MONGO_URI;

test("MCP discovers filter options and lists followers and followings", { skip: !uri }, async () => {
  process.env.NODE_ENV = "development";
  delete process.env.DB_PROD;
  process.env.MONGODB_URI_DEV = uri;
  process.env.MONGODB_DATABASE = `mcp_user_list_${randomUUID().replaceAll("-", "")}`;
  process.env.MCP_READ_TOKEN = "user-list-test-token";
  const client = new MongoClient(uri!);
  const db = client.db(process.env.MONGODB_DATABASE);
  const route = await import("../app/(pages)/api/mcp/route");
  const { getDb } = await import("../app/services/api/_db");
  const { buildUserFilters } = await import("../app/services/api/instagram/user-filters");
  const followerRoute = await import("../app/(pages)/api/followers/route");
  const followingRoute = await import("../app/(pages)/api/followings/route");
  const headers = {
    Authorization: "Bearer user-list-test-token",
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  const call = async (name: string, args: object = {}) => {
    const response = await route.POST(new Request("https://example.test/api/mcp", {
      method: "POST", headers,
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }),
    }));
    assert.equal(response.status, 200);
    const text = await response.text();
    const data = text.split("\n").find((line) => line.startsWith("data: "));
    return JSON.parse(data ? data.slice(6) : text).result;
  };
  const data = async (name: string, args: object = {}) => {
    const result = await call(name, args);
    assert.notEqual(result.isError, true, JSON.stringify(result));
    return JSON.parse(result.content[0].text);
  };

  try {
    await db.collection("countries").insertMany([
      { id: "205", name: { es: "España", en: "Spain" } },
      { id: "99", name: { es: "Otro país", en: "Other" } },
    ]);
    await db.collection("states").insertMany([
      { id: "10", country_id: "205", name: { es: "Madrid", en: "Madrid" } },
      { id: "11", country_id: "99", name: { es: "Madrid", en: "Madrid" } },
    ]);
    await db.collection("cities").insertMany([
      { id: "100", state_id: "10", name: { es: "Madrid", en: "Madrid" } },
      { id: "101", state_id: "11", name: { es: "Madrid", en: "Madrid" } },
    ]);
    const tag = new ObjectId();
    const otherTag = new ObjectId();
    await db.collection("tags").insertMany([{ _id: tag, name: "Música" }, { _id: otherTag, name: "Conciertos" }]);
    for (const name of ["followers", "followings"]) {
      await db.collection(name).insertMany([
        { username: `${name}_a`, full_name: "Ana", country: 205, state: 10, city: 100, tags: [String(tag)], treatment: 1, unfollow: false },
        { username: `${name}_b`, full_name: "Bea", country: 205, state: 10, city: 100, tags: [String(tag), String(otherTag)], treatment: 2, unfollow: false },
        { username: `${name}_c`, full_name: "Celia", country: 205, state: 10, city: 100, tags: [], treatment: 1, unfollow: true },
        { username: `${name}_d`, full_name: "Dani", country: 99, state: 11, city: 101, tags: [], treatment: 1, unfollow: false },
        { username: `${name}_e`, full_name: "Eli", country: 205, state: 10, city: 100, tags: [], treatment: 1 },
      ]);
    }

    const discovery = await route.GET(new Request("https://example.test/api/mcp", { headers }));
    const tools = (await discovery.json()).tools.map((tool: { name: string }) => tool.name);
    for (const name of ["instagram_get_followers", "instagram_get_followings", "instagram_get_filter_definitions", "instagram_search_filter_options"]) assert.ok(tools.includes(name));
    const definitions = await data("instagram_get_filter_definitions");
    assert.deepEqual(definitions.filters.treatment.options.map((option: { id: number }) => option.id), [1, 2]);
    assert.equal(definitions.filters.show.default, "0");

    const country = await data("instagram_search_filter_options", { type: "country", query: "España" });
    assert.equal(country.items[0].id, "205");
    const states = await data("instagram_search_filter_options", { type: "state", query: "Madrid" });
    assert.equal(states.items.length, 2);
    const madrid = await data("instagram_search_filter_options", { type: "state", query: "Madrid", country_id: country.items[0].id });
    assert.equal(madrid.items.length, 1);
    assert.equal(madrid.items[0].id, "10");
    const cities = await data("instagram_search_filter_options", { type: "city", query: "Madrid", state_id: "10" });
    assert.equal(cities.items[0].id, "100");
    const tags = await data("instagram_search_filter_options", { type: "tag", query: "Música" });
    assert.equal(tags.items[0].id, String(tag));
    assert.equal((await data("instagram_search_filter_options", { type: "country", query: "Spain" })).items[0].id, "205");
    assert.equal((await data("instagram_search_filter_options", { type: "country", query: ".*" })).items.length, 0);
    const firstOption = await data("instagram_search_filter_options", { type: "state", limit: 1 });
    const secondOption = await data("instagram_search_filter_options", { type: "state", limit: 1, cursor: firstOption.next_cursor });
    assert.equal(firstOption.has_more, true);
    assert.equal(secondOption.has_more, false);
    assert.notEqual(firstOption.items[0].id, secondOption.items[0].id);
    assert.equal((await call("instagram_search_filter_options", { type: "tag", country_id: "205" })).isError, true);

    for (const name of ["followers", "followings"]) {
      const method = `instagram_get_${name}`;
      const first = await data(method, { filters: { country: "205", state: "10" }, limit: 1 });
      assert.equal(first.items.length, 1);
      assert.equal(first.has_more, true);
      const second = await data(method, { filters: { country: "205", state: "10" }, limit: 1, cursor: first.next_cursor });
      assert.equal(second.has_more, false);
      assert.notEqual(first.items[0]._id, second.items[0]._id);
      assert.equal((await data(method)).items.length, 3);
      assert.equal((await data(method, { filters: { show: "2" } })).items.length, 5);
      assert.equal((await data(method, { filters: { show: "1" } })).items[0].username, `${name}_c`);
      const filtered = await data(method, { filters: { country: "205", state: "10", city: "100", tags: [String(tag)], withoutTags: [String(otherTag)], treatment: [1] } });
      assert.deepEqual(filtered.items.map((user: { username: string }) => user.username), [`${name}_a`]);
      assert.equal((await data(method, { query: "bea" })).items[0].username, `${name}_b`);
      assert.equal((await data(method, { query: ".*" })).items.length, 0);
      assert.equal((await call(method, { filters: { show: "3" } })).isError, true);
      assert.equal((await call(method, { cursor: "bad" })).isError, true);
    }
    assert.deepEqual(buildUserFilters(undefined), [{ unfollow: false }]);
    assert.deepEqual(buildUserFilters({}), []);
    assert.deepEqual(buildUserFilters({ show: "2", country: "205", tags: ["x"], withoutTags: ["y"], treatment: ["1"] }), [
      { country: 205 }, { tags: { $in: ["x"] } }, { tags: { $nin: ["y"] } }, { treatment: { $in: [1] } },
    ]);
    await db.collection("filters").insertOne({
      key: "test-filter",
      filters: { country: "205", state: "10", tags: [String(tag)], withoutTags: [String(otherTag)], treatment: ["1"], show: "0" },
    });
    for (const [name, handler] of [["followers", followerRoute.GET], ["followings", followingRoute.GET]] as const) {
      const defaultResponse = await handler(new NextRequest(`https://example.test/api/${name}?limit=20`));
      const defaultResult = await defaultResponse.json();
      assert.equal(defaultResult.total, 3);
      const filteredResponse = await handler(new NextRequest(`https://example.test/api/${name}?limit=20&filter=test-filter`));
      const filteredResult = await filteredResponse.json();
      assert.equal(filteredResult.total, 1);
      assert.equal(filteredResult.items[0].username, `${name}_a`);
    }

    const originalFind = Collection.prototype.find;
    Collection.prototype.find = function (...args: Parameters<typeof originalFind>) {
      if (this.collectionName === "followers") throw new Error("test database failure");
      return originalFind.apply(this, args);
    } as typeof originalFind;
    try {
      assert.equal((await call("instagram_get_followers")).isError, true);
    } finally {
      Collection.prototype.find = originalFind;
    }
  } finally {
    await db.dropDatabase();
    await client.close();
    await (await getDb()).client.close();
  }
});
