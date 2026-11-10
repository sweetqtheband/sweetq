import { z } from "zod";
import { createMcpOAuthProvider, MCP_OAUTH_SCOPE } from "./provider";
import type { JWKS, Provider } from "oidc-provider";

const jwksSchema = z.object({
  keys: z.array(z.object({
    kty: z.literal("RSA"),
    kid: z.string().min(1),
    n: z.string().min(1),
    e: z.string().min(1),
    d: z.string().min(1),
    p: z.string().min(1),
    q: z.string().min(1),
    dp: z.string().min(1),
    dq: z.string().min(1),
    qi: z.string().min(1),
  }).passthrough()).min(1),
});

let instance: Provider | undefined;

export function getOAuthProvider(): Provider {
  if (instance) return instance;
  const issuer = process.env.MCP_OAUTH_ISSUER;
  const cookieKey = process.env.MCP_OAUTH_COOKIE_KEY;
  const keyJson = process.env.MCP_OAUTH_JWKS;
  if (!issuer || !cookieKey || !keyJson) throw new Error("OAuth configuration is incomplete");
  const resource = `${issuer}/api/mcp`;
  const jwks: JWKS = jwksSchema.parse(JSON.parse(keyJson));
  instance = createMcpOAuthProvider({ issuer, resource, cookieKeys: [cookieKey], jwks });
  return instance;
}

export function oauthMetadata(): { issuer: string; resource: string; metadata: string } {
  const issuer = process.env.MCP_OAUTH_ISSUER;
  if (!issuer) throw new Error("OAuth configuration is incomplete");
  getOAuthProvider();
  return {
    issuer,
    resource: `${issuer}/api/mcp`,
    metadata: `${issuer}/.well-known/oauth-protected-resource/api/mcp`,
  };
}

export async function verifyOAuthAccessToken(token: string): Promise<boolean> {
  const { resource } = oauthMetadata();
  const provider = getOAuthProvider();
  const accessToken = await provider.AccessToken.find(token);
  return !!accessToken && accessToken.isValid &&
    accessToken.aud === resource &&
    !!accessToken.accountId &&
    !!accessToken.scope?.split(" ").includes(MCP_OAUTH_SCOPE);
}
