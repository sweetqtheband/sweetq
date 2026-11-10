import { errors, Provider } from "oidc-provider";
import type { JWKS } from "oidc-provider";
import type { Db } from "mongodb";
import { createMongoAdapter } from "./mongo-adapter";
import { createHash } from "node:crypto";

export const MCP_OAUTH_SCOPE = "instagram:read";

export interface McpOAuthProviderConfig {
  issuer: string;
  resource: string;
  cookieKeys: string[];
  jwks: JWKS;
  connect?: () => Promise<Db>;
}

export function createMcpOAuthProvider(config: McpOAuthProviderConfig): Provider {
  const issuer = new URL(config.issuer);
  const resource = new URL(config.resource);
  if (
    issuer.protocol !== "https:" ||
    resource.protocol !== "https:" ||
    issuer.origin !== resource.origin ||
    config.issuer !== issuer.origin ||
    config.resource !== `${issuer.origin}/api/mcp` ||
    issuer.search || issuer.hash || resource.search || resource.hash
  ) {
    throw new Error("OAuth issuer and resource must be HTTPS URLs on the same origin");
  }
  if (config.cookieKeys.length === 0 || config.cookieKeys.some((key) => key.length < 32)) {
    throw new Error("OAuth cookie keys must each be at least 32 characters");
  }
  if (!config.jwks.keys.length) {
    throw new Error("A persistent OAuth signing key is required");
  }

  const provider = new Provider(config.issuer, {
    adapter: createMongoAdapter(config.connect, `${createHash("sha256").update(config.issuer).digest("hex").slice(0, 24)}_`),
    jwks: config.jwks,
    cookies: { keys: config.cookieKeys },
    pkce: { required: () => true },
    scopes: [MCP_OAUTH_SCOPE],
    responseTypes: ["code"],
    issueRefreshToken: (_ctx, client) => client.grantTypeAllowed("refresh_token"),
    rotateRefreshToken: true,
    ttl: {
      AccessToken: 3600,
      AuthorizationCode: 300,
      Interaction: 600,
      Grant: 30 * 24 * 3600,
      IdToken: 3600,
      Session: 8 * 3600,
      RefreshToken: 30 * 24 * 3600,
    },
    routes: {
      authorization: "/api/oauth/authorize",
      token: "/api/oauth/token",
      revocation: "/api/oauth/revoke",
    },
    features: {
      devInteractions: { enabled: false },
      revocation: { enabled: true },
      dPoP: { enabled: false },
      userinfo: { enabled: false },
      rpInitiatedLogout: { enabled: false },
      pushedAuthorizationRequests: { enabled: false },
      clientIdMetadataDocument: {
        enabled: true,
        ack: "draft-02",
        allowFetch: (_ctx, clientId) => {
          const url = new URL(clientId);
          return url.origin === "https://chatgpt.com" &&
            !url.search && !url.hash &&
            /^\/oauth\/(?:[A-Za-z0-9_-]+\/)?client\.json$/.test(url.pathname);
        },
      },
      resourceIndicators: {
        enabled: true,
        defaultResource: () => config.resource,
        getResourceServerInfo: (_ctx, requested) => {
          if (requested !== config.resource) throw new errors.InvalidTarget();
          return {
            audience: config.resource,
            scope: MCP_OAUTH_SCOPE,
            accessTokenFormat: "opaque",
            accessTokenTTL: 3600,
          };
        },
      },
    },
    interactions: {
      url: (_ctx, interaction) => `/api/oauth/interaction/${interaction.uid}`,
    },
    findAccount: async (_ctx, accountId) => ({
      accountId,
      async claims() {
        return { sub: accountId };
      },
    }),
  });
  provider.proxy = true;
  return provider;
}
