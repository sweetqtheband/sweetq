import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import axios from "axios";
import { MongoClient } from "mongodb";

const uri = process.env.MCP_TEST_MONGO_URI;

test("MCP post insights requests default and custom metrics and reports failures", { skip: !uri }, async () => {
  process.env.NODE_ENV = "development";
  delete process.env.DB_PROD;
  process.env.MONGODB_URI_DEV = uri;
  process.env.MONGODB_DATABASE = `mcp_insights_${randomUUID().replaceAll("-", "")}`;
  process.env.MCP_READ_TOKEN = "test-mcp-token";
  process.env.GRAPH_INSTAGRAM = "https://graph.example.test";
  process.env.NEXT_PUBLIC_AWS_REGION = "us-east-1";

  const originalAdapter = axios.defaults.adapter;
  let shouldFail = false;
  let responseData: unknown = { data: [{ name: "reach", values: [{ value: 42 }] }] };
  const requests: { url?: string; metric: string; authorization?: string }[] = [];
  axios.defaults.adapter = async (config) => {
    requests.push({
      url: config.url,
      metric: config.params.metric,
      authorization: config.headers.Authorization as string,
    });
    if (shouldFail) throw new Error("synthetic-secret");
    return { data: responseData, status: 200, statusText: "OK", headers: {}, config };
  };

  const client = new MongoClient(uri!);
  const db = client.db(process.env.MONGODB_DATABASE);
  const { POST } = await import("../app/(pages)/api/mcp/route");
  const { getDb } = await import("../app/services/api/_db");
  const call = async (args: object) => {
    const response = await POST(new Request("https://example.test/api/mcp", {
      method: "POST",
      headers: {
        Authorization: "Bearer test-mcp-token",
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1, method: "tools/call",
        params: { name: "instagram_get_insights", arguments: args },
      }),
    }));
    assert.equal(response.status, 200);
    const body = await response.text();
    const data = body.split("\n").find((line) => line.startsWith("data: "));
    return JSON.parse(data ? data.slice(6) : body).result;
  };

  try {
    await db.collection("instagram").insertOne({ id: "instagram", long_live_access_token: "test-instagram-token" });
    const first = await call({ post_id: "17917827669510653" });
    assert.notEqual(first.isError, true);
    assert.deepEqual(JSON.parse(first.content[0].text), {
      data: [{ name: "reach", values: [{ value: 42 }] }],
      available: ["reach"],
    });
    assert.deepEqual(requests[0], {
      url: "/17917827669510653/insights",
      metric: "reach,views,total_interactions,shares",
      authorization: "Bearer test-instagram-token",
    });

    responseData = { data: [] };
    const empty = await call({ post_id: "123", metrics: ["likes", "saved"] });
    assert.deepEqual(JSON.parse(empty.content[0].text), { data: [], available: [] });
    assert.equal(requests[1].metric, "likes,saved");

    shouldFail = true;
    const failure = await call({ post_id: "123" });
    assert.equal(failure.isError, true);
    assert.match(failure.content[0].text, /insights request failed/);
    assert.doesNotMatch(failure.content[0].text, /synthetic-secret|test-instagram-token/);

    shouldFail = false;
    responseData = {};
    assert.equal((await call({ post_id: "123" })).isError, true);
  } finally {
    await db.dropDatabase();
    await client.close();
    await (await getDb()).client.close();
    axios.defaults.adapter = originalAdapter;
  }
});
