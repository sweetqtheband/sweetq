import { generateKeyPairSync, randomBytes } from "node:crypto";
import { appendFile, readFile } from "node:fs/promises";

const file = process.argv[2];
const issuer = process.argv[3];
if (!file || !issuer) {
  console.error("Usage: node scripts/create-mcp-oauth-config.mjs <env-file> <https-origin>");
  process.exitCode = 1;
} else {
  const parsed = new URL(issuer);
  if (parsed.protocol !== "https:" || parsed.origin !== issuer) {
    throw new Error("The issuer must be an HTTPS origin without a trailing slash");
  }
  const existing = await readFile(file, "utf8");
  if (/^\s*(?:MCP_OAUTH_ISSUER|MCP_OAUTH_COOKIE_KEY|MCP_OAUTH_JWKS)\s*=/m.test(existing)) {
    throw new Error("OAuth configuration already exists; refusing to replace keys");
  }
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const jwks = JSON.stringify({ keys: [{
    ...privateKey.export({ format: "jwk" }), kid: randomBytes(16).toString("hex"),
    use: "sig", alg: "RS256",
  }] });
  const cookieKey = randomBytes(48).toString("base64url");
  await appendFile(file, `\nMCP_OAUTH_ISSUER=${issuer}\nMCP_OAUTH_COOKIE_KEY=${cookieKey}\nMCP_OAUTH_JWKS='${jwks}'\n`);
  console.log("OAuth configuration added. Keep this file private and back up the signing key.");
}
