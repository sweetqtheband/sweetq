import assert from "node:assert/strict";
import { test } from "node:test";
import axios, { AxiosError } from "axios";
import { getStoryInsights, listStories } from "../app/services/api/instagram/stories";

test("story listing preserves optional fields and returns pagination and expiration", async () => {
  const adapter = axios.defaults.adapter;
  process.env.GRAPH_INSTAGRAM = "https://graph.example.test/v27.0";
  axios.defaults.adapter = async (config) => {
    assert.equal(config.url, "/123/stories");
    assert.equal(config.params.after, "previous");
    return {
      status: 200, statusText: "OK", headers: {}, config,
      data: { data: [{ id: "456", media_type: "VIDEO", timestamp: "2026-01-01T00:00:00+0000" }], paging: { next: "next", cursors: { after: "cursor" } } },
    };
  };
  try {
    const result = await listStories("token", "123", 10, "previous");
    assert.equal(result.stories[0].expires_at, "2026-01-02T00:00:00.000Z");
    assert.equal(result.stories[0].remaining_seconds, 0);
    assert.deepEqual(result.paging, { next_cursor: "cursor", has_more: true });
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
