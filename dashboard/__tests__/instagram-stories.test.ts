import assert from "node:assert/strict";
import { test } from "node:test";
import axios, { AxiosError } from "axios";
import { classifyMetaError, getStoryInsights, listStories } from "../app/services/api/instagram/stories";

test("story listing preserves optional fields and returns pagination and expiration", async () => {
  const adapter = axios.defaults.adapter;
  process.env.GRAPH_INSTAGRAM = "https://graph.example.test/v27.0";
  axios.defaults.adapter = async (config) => {
    if (config.url === "/me") {
      assert.equal(config.params.fields, "user_id");
      return { status: 200, statusText: "OK", headers: {}, config, data: { id: "123", user_id: "987" } };
    }
    assert.equal(config.url, "/987/stories");
    assert.equal(config.params.after, "previous");
    return {
      status: 200, statusText: "OK", headers: {}, config,
      data: { data: [{ id: "456", media_type: "VIDEO", timestamp: "2026-01-01T00:00:00+0000" }], paging: { next: "next", cursors: { after: "cursor" } } },
    };
  };
  try {
    const result = await listStories("token", 10, "previous");
    assert.equal(result.stories[0].expires_at, "2026-01-02T00:00:00.000Z");
    assert.equal(result.stories[0].remaining_seconds, 0);
    assert.deepEqual(result.paging, { next_cursor: "cursor", has_more: true });
  } finally {
    axios.defaults.adapter = adapter;
  }
});

test("ambiguous Meta object errors are not classified as expired stories", () => {
  const error = new AxiosError("failed", "ERR_BAD_REQUEST", undefined, undefined, {
    status: 400, statusText: "Bad Request", headers: {},
    config: { headers: new axios.AxiosHeaders() },
    data: { error: { code: 100, error_subcode: 33, message: "Unsupported get request. Object does not exist, cannot be loaded due to missing permissions, or does not support this operation" } },
  });
  assert.equal(classifyMetaError(error, "token"), "object_not_found_or_inaccessible");
});

test("story listing fails explicitly when the professional account ID is missing", async () => {
  const adapter = axios.defaults.adapter;
  axios.defaults.adapter = async (config) => ({
    status: 200, statusText: "OK", headers: {}, config, data: { id: "123" },
  });
  try {
    await assert.rejects(listStories("token"), /stories request failed: account_id_unavailable/);
  } finally {
    axios.defaults.adapter = adapter;
  }
});

test("story listing accepts Meta's documented account response shape", async () => {
  const adapter = axios.defaults.adapter;
  axios.defaults.adapter = async (config) => {
    if (config.url === "/me") {
      return { status: 200, statusText: "OK", headers: {}, config, data: { data: [{ user_id: "987" }] } };
    }
    assert.equal(config.url, "/987/stories");
    return { status: 200, statusText: "OK", headers: {}, config, data: { data: [] } };
  };
  try {
    assert.deepEqual((await listStories("token")).stories, []);
  } finally {
    axios.defaults.adapter = adapter;
  }
});

test("story insights isolate failed metrics and request navigation breakdown separately", async () => {
  const adapter = axios.defaults.adapter;
  const requested: string[] = [];
  axios.defaults.adapter = async (config) => {
    requested.push(config.params.metric);
    if (config.params.metric === "shares") {
      throw new AxiosError("failed", "ERR_BAD_REQUEST", config, undefined, {
        status: 400, statusText: "Bad Request", headers: {}, config,
        data: { error: { code: 100, message: "unsupported metric" } },
      });
    }
    if (config.params.metric === "navigation") assert.equal(config.params.breakdown, "story_navigation_action_type");
    else assert.equal(config.params.breakdown, undefined);
    return { status: 200, statusText: "OK", headers: {}, config, data: { data: [{ name: config.params.metric, values: [{ value: 4 }] }] } };
  };
  try {
    const result = await getStoryInsights("token", "456", ["reach", "shares", "navigation"]);
    assert.deepEqual(requested, ["reach", "shares", "navigation"]);
    assert.deepEqual(result.available, ["reach", "navigation"]);
    assert.deepEqual(result.unavailable, [{ metric: "shares", reason: "incompatible_or_unavailable" }]);
  } finally {
    axios.defaults.adapter = adapter;
  }
});

test("story insights stop after rate limiting and report remaining metrics", async () => {
  const adapter = axios.defaults.adapter;
  let calls = 0;
  axios.defaults.adapter = async (config) => {
    calls++;
    throw new AxiosError("failed", "ERR_BAD_REQUEST", config, undefined, {
      status: 429, statusText: "Too Many Requests", headers: {}, config, data: { error: { code: 4, message: "rate limit" } },
    });
  };
  try {
    const result = await getStoryInsights("token", "456", ["reach", "views"]);
    assert.equal(calls, 1);
    assert.deepEqual(result.unavailable, [{ metric: "reach", reason: "rate_limited" }, { metric: "views", reason: "rate_limited" }]);
  } finally {
    axios.defaults.adapter = adapter;
  }
});
