import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { MongoClient } from "mongodb";

const uri = process.env.MCP_TEST_MONGO_URI;

test("MCP returns users with names and null, empty or missing short names", { skip: !uri }, async () => {
  process.env.NODE_ENV = "development";
  delete process.env.DB_PROD;
  process.env.MONGODB_URI_DEV = uri;
  process.env.MONGODB_DATABASE = `mcp_unnamed_test_${randomUUID().replaceAll("-", "")}`;
  process.env.MCP_READ_TOKEN = "unnamed-test-token";

  const client = new MongoClient(uri!);
  const db = client.db(process.env.MONGODB_DATABASE);
  const route = await import("../app/(pages)/api/mcp/route");
  const { getDb } = await import("../app/services/api/_db");
  const headers = {
    Authorization: "Bearer unnamed-test-token",
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
        params: { name: "instagram_get_unnamed_users", arguments: args },
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
        { username: `${name}_yes`, full_name: "Full Name", short_name: null, extracted: true },
        { username: `${name}_other`, full_name: "Other Name", short_name: null, extracted: false },
        { username: `${name}_no_extracted`, full_name: "Another Name", short_name: null },
        { username: `${name}_missing_short`, full_name: "Name", extracted: true },
        { username: `${name}_empty_short`, full_name: "Name", short_name: "", extracted: true },
        { username: `${name}_named`, full_name: "Name", short_name: "Short", extracted: true },
        { username: `${name}_array_short`, full_name: "Name", short_name: [null], extracted: true },
        { username: `${name}_array_empty`, full_name: "Name", short_name: [""], extracted: true },
        { username: `${name}_blank_short`, full_name: "Name", short_name: " ", extracted: true },
        { username: `${name}_missing_full`, short_name: null, extracted: true },
        { username: `${name}_empty_full`, full_name: "", short_name: null, extracted: true },
        { username: `${name}_blank_full`, full_name: " \t", short_name: null, extracted: true },
        { username: `${name}_null_full`, full_name: null, short_name: null, extracted: true },
        { username: `${name}_array_full`, full_name: ["Name"], short_name: null, extracted: true },
        { username: "", full_name: "Name", short_name: null, extracted: true },
        { username: "  ", full_name: "Name", short_name: null, extracted: true },
        { username: null, full_name: "Name", short_name: null, extracted: true },
        { username: ["array"], full_name: "Name", short_name: null, extracted: true },
        { full_name: "Name", short_name: null, extracted: true },
      ]);
    }

    const discovery = await route.GET(new Request("https://example.test/api/mcp", { headers }));
    assert.equal(discovery.status, 200);
    const discovered = await discovery.json();
    assert.ok(discovered.tools.some((tool: { name: string }) => tool.name === "instagram_get_unnamed_users"));

    const result = await call({});
    assert.notEqual(result.isError, true);
    const users = JSON.parse(result.content[0].text);
    assert.deepEqual(Object.keys(users).sort(), ["followers", "followings"]);
    for (const name of ["followers", "followings"]) {
      assert.deepEqual(
        users[name].map((user: { username: string }) => user.username).sort(),
        [`${name}_empty_short`, `${name}_missing_short`, `${name}_yes`],
      );
      assert.equal(users[name].find((user: { username: string }) => user.username === `${name}_yes`).short_name, null);
      assert.ok(users[name][0]._id);
    }
    assert.equal((await call({ unexpected: true })).isError, true);
  } finally {
    await db.dropDatabase();
    await client.close();
    await (await getDb()).client.close();
  }
});
