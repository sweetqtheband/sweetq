import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createHash, generateKeyPairSync, randomBytes, randomUUID } from "node:crypto";
import { MongoClient, ObjectId } from "mongodb";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";

const uri = process.env.OAUTH_TEST_MONGO_URI;
if (!uri) throw new Error("OAUTH_TEST_MONGO_URI is required");
const dbName = `oauth_flow_${randomUUID().replaceAll("-", "")}`;
process.env.NODE_ENV = "development";
process.env.MONGODB_URI_DEV = uri;
process.env.MONGODB_DATABASE = dbName;
process.env.NEXT_PUBLIC_AWS_REGION = "eu-west-1";
process.env.MCP_OAUTH_ISSUER = "https://example.test";
process.env.MCP_OAUTH_COOKIE_KEY = "test-cookie-key-with-at-least-32-characters";
const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
process.env.MCP_OAUTH_JWKS = JSON.stringify({ keys: [{
  ...privateKey.export({ format: "jwk" }), kid: "test-key", use: "sig", alg: "RS256",
}] });
process.env.MCP_READ_TOKEN = "old-test-token";

const client = new MongoClient(uri);
const db = client.db(dbName);
const adminId = new ObjectId();
const profileId = new ObjectId();
const userUuid = "d8cc14b7-f652-4722-880a-salt";
await db.collection("user_profiles").insertOne({ _id: profileId, type: "admin" });
await db.collection("users").insertOne({
  _id: adminId, username: "test-user", _profileId: profileId,
  _uuid: userUuid, password: CryptoJS.SHA3("test-password:salt").toString(),
});

after(async () => {
  await db.dropDatabase();
  await client.close();
  const { getDb } = await import("../app/services/api/_db");
  await (await getDb()).client.close();
});

test("OAuth discovery, login, PKCE exchange and MCP authorization", async () => {
  const clientKeys = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    if (String(input) === "https://chatgpt.com/oauth/client.json") {
      return Response.json({
        client_id: "https://chatgpt.com/oauth/client.json",
        redirect_uris: ["https://chatgpt.com/connector_platform_oauth_redirect"],
        response_types: ["code"],
        grant_types: ["authorization_code", "refresh_token", "urn:ietf:params:oauth:grant-type:jwt-bearer"],
        token_endpoint_auth_method: "private_key_jwt",
        token_endpoint_auth_methods_supported: ["none", "private_key_jwt"],
        token_endpoint_auth_signing_alg: "RS256",
        jwks_uri: "https://chatgpt.com/oauth/jwks.json",
      });
    }
    if (String(input) === "https://chatgpt.com/oauth/jwks.json") {
      return Response.json({ keys: [{
        ...clientKeys.publicKey.export({ format: "jwk" }), kid: "test-client-key", use: "sig", alg: "RS256",
      }] });
    }
    return originalFetch(input, init);
  };
  try {
  const { oauthHandler } = await import("../app/services/api/oauth/http");
  const { interactionHandler } = await import("../app/services/api/oauth/interaction");
  const { GET: resourceMetadata } = await import("../app/.well-known/oauth-protected-resource/api/mcp/route");
  const { POST: mcp } = await import("../app/(pages)/api/mcp/route");
  const metadata = await resourceMetadata();
  assert.equal(metadata.status, 200);
  assert.equal((await metadata.json()).resource, "https://example.test/api/mcp");

  const discovery = await oauthHandler(new Request("https://example.test/.well-known/openid-configuration"));
  assert.equal(discovery.status, 200);
  const doc = await discovery.json();
  assert.ok(doc.code_challenge_methods_supported.includes("S256"));
  const oauthDiscovery = await oauthHandler(new Request("https://example.test/.well-known/oauth-authorization-server"));
  assert.equal(oauthDiscovery.status, 200, await oauthDiscovery.clone().text());
  const proxiedDiscovery = await oauthHandler(new Request(
    "https://example.test/.well-known/oauth-authorization-server",
    { headers: { connection: "upgrade, x-proxy-hop", upgrade: "websocket", "x-proxy-hop": "test" } },
  ));
  assert.equal(proxiedDiscovery.status, 200, await proxiedDiscovery.clone().text());

  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const query = new URLSearchParams({
    client_id: "https://chatgpt.com/oauth/client.json",
    redirect_uri: "https://chatgpt.com/connector_platform_oauth_redirect",
    response_type: "code",
    scope: "openid instagram:read",
    state: "test-state",
    code_challenge_method: "S256",
    code_challenge: challenge,
    resource: "https://example.test/api/mcp",
  });
  const start = await oauthHandler(new Request(`https://example.test/api/oauth/authorize?${query}`));
  assert.equal(start.status, 303, await start.clone().text());
  assert.match(start.headers.get("location") ?? "", /\/api\/oauth\/interaction\//);
  const cookies = new Map<string, string>();
  const saveCookies = (response: Response) => {
    for (const cookie of response.headers.getSetCookie()) {
      const entry = cookie.split(";")[0];
      const pos = entry.indexOf("=");
      cookies.set(entry.slice(0, pos), entry.slice(pos + 1));
    }
  };
  const cookieHeader = () => [...cookies.entries()].map(([key, value]) => `${key}=${value}`).join("; ");
  saveCookies(start);
  let location = new URL(start.headers.get("location")!, "https://example.test").toString();
  const login = await interactionHandler(new Request(location, { headers: { cookie: cookieHeader() } }));
  assert.equal(login.status, 200, await login.clone().text());
  assert.equal(login.headers.get("referrer-policy"), "same-origin");
  const csrf = await interactionHandler(new Request(location, {
    method: "POST",
    headers: {
      cookie: cookieHeader(), origin: "https://attacker.example",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ username: "test-user", password: "test-password" }),
  }));
  assert.equal(csrf.status, 403);
  for (const origin of ["null", undefined]) {
    const invalidOrigin = await interactionHandler(new Request(location, {
      method: "POST",
      headers: {
        cookie: cookieHeader(),
        ...(origin === undefined ? {} : { origin }),
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ username: "test-user", password: "test-password" }),
    }));
    assert.equal(invalidOrigin.status, 403);
  }
  const badLogin = await interactionHandler(new Request(location, {
    method: "POST",
    headers: {
      cookie: cookieHeader(), origin: "https://example.test",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ username: "test-user", password: "bad-password" }),
  }));
  assert.equal(badLogin.status, 401);
  const loginSubmit = await interactionHandler(new Request(location, {
    method: "POST",
    headers: {
      cookie: cookieHeader(), origin: "https://example.test",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ username: "test-user", password: "test-password" }),
  }));
  assert.equal(loginSubmit.status, 303, await loginSubmit.clone().text());
  saveCookies(loginSubmit);
  location = new URL(loginSubmit.headers.get("location")!, "https://example.test").toString();
  let resumed = await oauthHandler(new Request(location, { headers: { cookie: cookieHeader() } }));
  assert.equal(resumed.status, 303, await resumed.clone().text());
  saveCookies(resumed);
  saveCookies(resumed);
  location = new URL(resumed.headers.get("location")!, "https://example.test").toString();
  if (new URL(location).pathname.startsWith("/api/oauth/interaction/")) {
    const consent = await interactionHandler(new Request(location, {
      method: "POST",
      headers: {
        cookie: cookieHeader(), origin: "https://example.test",
        "content-type": "application/x-www-form-urlencoded",
      },
      body: "",
    }));
    assert.equal(consent.status, 303, await consent.clone().text());
    saveCookies(consent);
    resumed = await oauthHandler(new Request(
      new URL(consent.headers.get("location")!, "https://example.test"),
      { headers: { cookie: cookieHeader() } },
    ));
    assert.equal(resumed.status, 303, await resumed.clone().text());
    location = new URL(resumed.headers.get("location")!, "https://example.test").toString();
  }
  const redirect = new URL(location);
  if (redirect.origin === "https://example.test") {
    const next = await interactionHandler(new Request(location, { headers: { cookie: cookieHeader() } }));
    assert.fail(`Unexpected interaction: ${await next.text()}`);
  }
  assert.equal(redirect.origin, "https://chatgpt.com", location);
  assert.equal(redirect.searchParams.get("state"), "test-state");
  const code = redirect.searchParams.get("code");
  assert.ok(code, redirect.toString());

  const tokenBody = new URLSearchParams({
    grant_type: "authorization_code", client_id: "https://chatgpt.com/oauth/client.json",
    redirect_uri: "https://chatgpt.com/connector_platform_oauth_redirect",
    code, code_verifier: verifier, resource: "https://example.test/api/mcp",
    client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    client_assertion: jwt.sign({}, clientKeys.privateKey, {
      algorithm: "RS256", keyid: "test-client-key",
      issuer: "https://chatgpt.com/oauth/client.json",
      subject: "https://chatgpt.com/oauth/client.json",
      audience: "https://example.test/api/oauth/token",
      expiresIn: "5m", jwtid: randomUUID(),
    }),
  });
  const incorrectVerifier = new URLSearchParams(tokenBody);
  incorrectVerifier.set("code_verifier", "wrong-verifier-with-adequate-length-00000000000000");
  const invalidExchange = await oauthHandler(new Request("https://example.test/api/oauth/token", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: incorrectVerifier,
  }));
  assert.equal(invalidExchange.status, 400);
  assert.equal((await invalidExchange.json()).error, "invalid_grant");
  tokenBody.set("client_assertion", jwt.sign({}, clientKeys.privateKey, {
    algorithm: "RS256", keyid: "test-client-key",
    issuer: "https://chatgpt.com/oauth/client.json", subject: "https://chatgpt.com/oauth/client.json",
    audience: "https://example.test/api/oauth/token", expiresIn: "5m", jwtid: randomUUID(),
  }));
  const token = await oauthHandler(new Request("https://example.test/api/oauth/token", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: tokenBody,
  }));
  assert.equal(token.status, 200, await token.clone().text());
  const tokens = await token.json();
  const accessToken: string = tokens.access_token;
  assert.ok(tokens.refresh_token);
  const authorized = await mcp(new Request("https://example.test/api/mcp", {
    method: "POST",
    headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
  }));
  assert.equal(authorized.status, 200, await authorized.clone().text());
  assert.match(await authorized.text(), /instagram_list_posts/);
  const toolCall = await mcp(new Request("https://example.test/api/mcp", {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0", id: 2, method: "tools/call",
      params: { name: "instagram_list_posts", arguments: {} },
    }),
  }));
  assert.equal(toolCall.status, 200, await toolCall.clone().text());
  assert.match(await toolCall.text(), /No Instagram token found/);
  const { getOAuthProvider, verifyOAuthAccessToken } = await import("../app/services/api/oauth/runtime");
  const store = getOAuthProvider().AccessToken.adapter;
  const now = Math.floor(Date.now() / 1000);
  const base = { jti: "invalid-token", kind: "AccessToken", iat: now, exp: now + 60, accountId: "test-account" };
  await store.upsert("wrong-audience", { ...base, aud: "https://elsewhere.test", scope: "instagram:read" }, 60);
  await store.upsert("wrong-scope", { ...base, aud: "https://example.test/api/mcp", scope: "other" }, 60);
  await store.upsert("expired", { ...base, exp: now - 1, aud: "https://example.test/api/mcp", scope: "instagram:read" }, 60);
  assert.equal(await verifyOAuthAccessToken("wrong-audience"), false);
  assert.equal(await verifyOAuthAccessToken("wrong-scope"), false);
  assert.equal(await verifyOAuthAccessToken("expired"), false);
  const refreshBody = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: "https://chatgpt.com/oauth/client.json",
    refresh_token: tokens.refresh_token,
    resource: "https://example.test/api/mcp",
    client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    client_assertion: jwt.sign({}, clientKeys.privateKey, {
      algorithm: "RS256", keyid: "test-client-key",
      issuer: "https://chatgpt.com/oauth/client.json", subject: "https://chatgpt.com/oauth/client.json",
      audience: "https://example.test/api/oauth/token", expiresIn: "5m", jwtid: randomUUID(),
    }),
  });
  const refreshed = await oauthHandler(new Request("https://example.test/api/oauth/token", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: refreshBody,
  }));
  assert.equal(refreshed.status, 200, await refreshed.clone().text());
  const rotated = await refreshed.json();
  assert.ok(rotated.refresh_token);
  assert.notEqual(rotated.refresh_token, tokens.refresh_token);
  assert.equal(await verifyOAuthAccessToken(rotated.access_token), true);
  tokenBody.set("client_assertion", jwt.sign({}, clientKeys.privateKey, {
    algorithm: "RS256", keyid: "test-client-key",
    issuer: "https://chatgpt.com/oauth/client.json", subject: "https://chatgpt.com/oauth/client.json",
    audience: "https://example.test/api/oauth/token", expiresIn: "5m", jwtid: randomUUID(),
  }));
  const replay = await oauthHandler(new Request("https://example.test/api/oauth/token", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: tokenBody,
  }));
  assert.equal(replay.status, 400);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
