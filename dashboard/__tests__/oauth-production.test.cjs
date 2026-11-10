const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { createServer } = require("node:net");
const { generateKeyPairSync, randomBytes, randomUUID, createHash } = require("node:crypto");
const { join } = require("node:path");
const { MongoClient, ObjectId } = require("mongodb");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

test("production Next exchanges an OAuth code and authorizes MCP", async () => {
  const uri = process.env.OAUTH_TEST_MONGO_URI;
  assert.ok(uri, "OAUTH_TEST_MONGO_URI is required");
  const dbname = `oauth_next_${randomUUID().replaceAll("-", "")}`;
  const mongo = new MongoClient(uri);
  await mongo.connect();
  const db = mongo.db(dbname);
  const socket = createServer();
  await new Promise((resolve) => socket.listen(0, "127.0.0.1", resolve));
  const port = socket.address().port;
  await new Promise((resolve, reject) => socket.close(error => error ? reject(error) : resolve()));
  let child;
  try {
    await db.command({ createUser: "test-user", pwd: "test-password", roles: [{ role: "readWrite", db: dbname }] });
    const profile = new ObjectId();
    await db.collection("user_profiles").insertOne({ _id: profile, type: "admin" });
    await db.collection("users").insertOne({
      _id: new ObjectId(), username: "test-user", _profileId: profile,
      _uuid: "d8cc14b7-f652-4722-880a-salt", password: CryptoJS.SHA3("test-password:salt").toString(),
    });
    const issuerKey = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const clientKey = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const issuer = "https://example.test";
    const local = `http://127.0.0.1:${port}`;
    child = spawn("./node_modules/.bin/next", ["start", "-p", String(port)], {
      env: {
        ...process.env, MCP_OAUTH_ISSUER: issuer,
        MCP_OAUTH_COOKIE_KEY: "test-cookie-key-with-at-least-32-characters",
        MCP_OAUTH_JWKS: JSON.stringify({ keys: [{ ...issuerKey.privateKey.export({ format: "jwk" }), kid: "test", use: "sig", alg: "RS256" }] }),
        OAUTH_TEST_PUBLIC_JWK: JSON.stringify({ ...clientKey.publicKey.export({ format: "jwk" }), kid: "test-client-key", use: "sig", alg: "RS256" }),
        MONGODB_URI: uri, MONGODB_DATABASE: dbname, MONGODB_USER: "test-user",
        MONGODB_PASSWORD: "test-password", MONGODB_AUTH_SOURCE: dbname,
        NODE_OPTIONS: `--require ${join(process.cwd(), "__tests__/fixtures/oauth-fetch-mock.cjs")}`,
      },
      stdio: "ignore",
    });
    let ready = false;
    for (let i = 0; i < 100; i++) {
      try {
        ready = (await fetch(local + "/jwks")).ok;
        if (ready) break;
      } catch {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    assert.ok(ready, "Production server did not start");
    const cookies = new Map();
    async function request(url, options = {}) {
      const target = new URL(url, issuer);
      assert.equal(target.origin, issuer);
      const response = await fetch(local + target.pathname + target.search, {
        ...options, redirect: "manual",
        headers: { cookie: [...cookies].map(([k, v]) => `${k}=${v}`).join("; "), ...options.headers },
      });
      for (const cookie of response.headers.getSetCookie()) {
        const pair = cookie.split(";")[0], i = pair.indexOf("=");
        cookies.set(pair.slice(0, i), pair.slice(i + 1));
      }
      return response;
    }
    const location = response => {
      assert.ok(response.headers.get("location"));
      return new URL(response.headers.get("location"), issuer);
    };
    const verifier = randomBytes(32).toString("base64url");
    const params = new URLSearchParams({
      client_id: "https://chatgpt.com/oauth/client.json",
      redirect_uri: "https://chatgpt.com/connector_platform_oauth_redirect",
      response_type: "code", scope: "openid instagram:read", state: "test-state",
      code_challenge_method: "S256", code_challenge: createHash("sha256").update(verifier).digest("base64url"),
      resource: `${issuer}/api/mcp`,
    });
    let response = await request(`/api/oauth/authorize?${params}`);
    assert.equal(response.status, 303);
    let url = location(response);
    response = await request(url, {
      method: "POST", headers: { origin: issuer, "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username: "test-user", password: "test-password" }),
    });
    assert.equal(response.status, 303);
    response = await request(location(response));
    assert.equal(response.status, 303);
    url = location(response);
    if (url.pathname.startsWith("/api/oauth/interaction/")) {
      response = await request(url, {
        method: "POST", headers: { origin: issuer, "content-type": "application/x-www-form-urlencoded" }, body: "",
      });
      assert.equal(response.status, 303);
      response = await request(location(response));
      assert.equal(response.status, 303);
      url = location(response);
    }
    assert.equal(url.origin, "https://chatgpt.com");
    assert.equal(url.searchParams.get("state"), "test-state");
    const code = url.searchParams.get("code");
    assert.ok(code);
    const assertion = jwt.sign({}, clientKey.privateKey, {
      algorithm: "RS256", keyid: "test-client-key", issuer: "https://chatgpt.com/oauth/client.json",
      subject: "https://chatgpt.com/oauth/client.json", audience: `${issuer}/api/oauth/token`,
      expiresIn: "5m", jwtid: randomUUID(),
    });
    response = await request("/api/oauth/token", {
      method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code", client_id: "https://chatgpt.com/oauth/client.json",
        redirect_uri: "https://chatgpt.com/connector_platform_oauth_redirect", code, code_verifier: verifier,
        resource: `${issuer}/api/mcp`, client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        client_assertion: assertion,
      }),
    });
    assert.equal(response.status, 200, `Token endpoint returned HTTP ${response.status}`);
    const tokens = await response.json();
    assert.ok(tokens.access_token);
    assert.ok(tokens.id_token);
    response = await request("/api/mcp", {
      method: "POST",
      headers: { authorization: `Bearer ${tokens.access_token}`, "content-type": "application/json", accept: "application/json, text/event-stream" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
    });
    assert.equal(response.status, 200);
    assert.match(await response.text(), /instagram_list_posts/);
  } finally {
    if (child && child.exitCode === null) {
      child.kill("SIGTERM");
      await new Promise(resolve => child.once("exit", resolve));
    }
    await db.dropDatabase();
    await mongo.close();
  }
});
