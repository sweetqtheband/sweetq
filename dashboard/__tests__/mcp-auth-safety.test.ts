import assert from "node:assert/strict";
import { test } from "node:test";
import { GET as authorize } from "../app/(pages)/api/oauth/authorize/route";
import { GET as authorizationMetadata } from "../app/(pages)/api/.well-known/oauth-authorization-server/route";
import { GET as resourceMetadata } from "../app/(pages)/api/.well-known/oauth-protected-resource/route";
import { POST as token } from "../app/(pages)/api/oauth/token/route";
import { POST as introspect } from "../app/(pages)/api/oauth/introspect/route";
import { POST as revoke } from "../app/(pages)/api/oauth/revoke/route";
import { GET as mcpGet, POST as mcpPost } from "../app/(pages)/api/mcp/route";

test("the incomplete OAuth flow and metadata are unavailable", async () => {
  for (const handler of [authorize, authorizationMetadata, resourceMetadata, token, introspect, revoke]) {
    const response = await handler();
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("location"), null);
  }
});

test("MCP still requires the existing bearer token", async () => {
  const previous = process.env.MCP_READ_TOKEN;
  process.env.MCP_READ_TOKEN = "test-mcp-secret";
  try {
    const unauthenticated = await mcpGet(new Request("https://example.com/api/mcp"));
    assert.equal(unauthenticated.status, 401);
    assert.match(unauthenticated.headers.get("www-authenticate") ?? "", /^Bearer/);

    const invalid = await mcpGet(
      new Request("https://example.com/api/mcp", {
        headers: { Authorization: "Bearer invalid-oauth-token" },
      })
    );
    assert.equal(invalid.status, 401);

    const authorized = await mcpPost(
      new Request("https://example.com/api/mcp", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-mcp-secret",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jsonrpc: "2.0", method: "tools/list", id: 1 }),
      })
    );
    assert.equal(authorized.status, 200);
    const body = await authorized.text();
    for (const name of [
      "instagram_list_posts",
      "instagram_get_post",
      "instagram_get_insights",
      "instagram_get_account_insights",
      "instagram_search_posts",
    ]) {
      assert.ok(body.includes(name), `Missing tool: ${name}`);
    }

    const initialized = await mcpPost(
      new Request("https://example.com/api/mcp", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-mcp-secret",
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "initialize",
          id: 2,
          params: {
            protocolVersion: "2025-03-26",
            capabilities: {},
            clientInfo: { name: "test-client", version: "1.0.0" },
          },
        }),
      })
    );
    assert.equal(initialized.status, 200);
    assert.match(await initialized.text(), /protocolVersion/);

    const notification = await mcpPost(
      new Request("https://example.com/api/mcp", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-mcp-secret",
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
        },
        body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }),
      })
    );
    assert.equal(notification.status, 202);
  } finally {
    if (previous === undefined) delete process.env.MCP_READ_TOKEN;
    else process.env.MCP_READ_TOKEN = previous;
  }
});
