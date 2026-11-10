import assert from "node:assert/strict";
import { after, test } from "node:test";
import { MongoClient } from "mongodb";
import { randomUUID } from "node:crypto";
import { generateKeyPairSync } from "node:crypto";
import { createServer } from "node:http";
import { createMongoAdapter } from "../app/services/api/oauth/mongo-adapter";
import { createMcpOAuthProvider } from "../app/services/api/oauth/provider";

const uri = process.env.OAUTH_TEST_MONGO_URI;
if (!uri) throw new Error("OAUTH_TEST_MONGO_URI is required");
const client = new MongoClient(uri);
const db = client.db(`mcp_oauth_adapter_test_${randomUUID().replaceAll("-", "")}`);
const adapter = createMongoAdapter(async () => db);

after(async () => {
  await db.dropDatabase();
  await client.close();
});

test("OAuth models persist, expire, consume, and revoke by grant", async () => {
  const codes = adapter("AuthorizationCode");
  await codes.upsert("code-1", { uid: "uid-1", grantId: "grant-1", userCode: "user-1" }, 60);
  assert.equal((await adapter("AuthorizationCode").find("code-1"))?.grantId, "grant-1");
  assert.equal((await codes.findByUid("uid-1"))?.userCode, "user-1");
  assert.equal((await codes.findByUserCode("user-1"))?.uid, "uid-1");
  await codes.consume("code-1");
  assert.equal(typeof (await codes.find("code-1"))?.consumed, "number");
  await codes.upsert("expired", { grantId: "grant-1" }, -1);
  assert.equal(await codes.find("expired"), undefined);
  await codes.revokeByGrantId("grant-1");
  assert.equal(await codes.find("code-1"), undefined);
  await codes.upsert("destroyed", {}, 60);
  await codes.destroy("destroyed");
  assert.equal(await codes.find("destroyed"), undefined);
});

test("the OAuth provider persists its models in the configured MongoDB database", async () => {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const jwk = privateKey.export({ format: "jwk" });
  const provider = createMcpOAuthProvider({
    issuer: "https://example.test",
    resource: "https://example.test/api/mcp",
    cookieKeys: ["test-cookie-key-with-at-least-32-characters"],
    jwks: { keys: [{ ...jwk, kid: "test-key", use: "sig", alg: "RS256" }] },
    connect: async () => db,
  });
  const logged: string[] = [];
  const originalError = console.error;
  console.error = (...args: unknown[]) => logged.push(args.join(" "));
  try {
    const error = new Error("sensitive-token");
    error.stack = "Error: sensitive-token\n    at handler (/private/path/token.js:12:34)";
    provider.emit("server_error", null, error);
  } finally {
    console.error = originalError;
  }
  assert.match(logged.join("\n"), /Provider server error Error token\.js:12:34/);
  assert.doesNotMatch(logged.join("\n"), /sensitive-token|\/private\/path/);
  await provider.AccessToken.adapter.upsert("provider-test", {
    accountId: "test-account",
  }, 60);
  assert.equal(
    (await provider.AccessToken.adapter.find("provider-test"))?.accountId,
    "test-account",
  );
  const server = createServer(provider.callback());
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const response = await fetch(`http://127.0.0.1:${address.port}/.well-known/openid-configuration`);
    assert.equal(response.status, 200);
    const metadata = await response.json() as {
      issuer: string;
      code_challenge_methods_supported: string[];
      client_id_metadata_document_supported: boolean;
    };
    assert.equal(metadata.issuer, "https://example.test");
    assert.ok(metadata.code_challenge_methods_supported.includes("S256"));
    assert.equal(metadata.client_id_metadata_document_supported, true);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
