/**
 * OAuth 2.1 Service for MCP authentication with PKCE S256
 */

import { createHash, randomBytes } from "crypto";
import type {
  OAuthAuthorizationCode,
  OAuthToken,
  OAuthTokenResponse,
} from "@/types/oauth";

interface Store {
  codes: Map<string, OAuthAuthorizationCode>;
  tokens: Map<string, OAuthToken>;
}

// In-memory store (in production, use Redis or database)
const store: Store = {
  codes: new Map(),
  tokens: new Map(),
};

// Cleanup expired codes and tokens periodically
setInterval(() => {
  const now = Date.now();

  // Remove expired codes (10 minutes)
  for (const [key, code] of store.codes.entries()) {
    if (code.expires_at < now) {
      store.codes.delete(key);
    }
  }

  // Remove expired tokens (1 hour)
  for (const [key, token] of store.tokens.entries()) {
    if (token.expires_at < now) {
      store.tokens.delete(key);
    }
  }
}, 60000); // Check every minute

export const OAuthService = {
  /**
   * Generate authorization code with PKCE challenge
   */
  generateAuthorizationCode(
    clientId: string,
    codeChallenge: string,
    codeChallengeMethod: "S256",
    redirectUri: string,
    scope: string,
    resource: string
  ): string {
    const code = randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    store.codes.set(code, {
      code,
      scope,
      resource,
      client_id: clientId,
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod,
      expires_at: expiresAt,
      created_at: Date.now(),
    });

    return code;
  },

  /**
   * Exchange authorization code for access token with PKCE verification
   */
  exchangeCodeForToken(
    code: string,
    clientId: string,
    codeVerifier: string,
    redirectUri: string
  ): OAuthTokenResponse | null {
    const authCode = store.codes.get(code);

    if (!authCode) {
      return null;
    }

    // Verify code not expired
    if (authCode.expires_at < Date.now()) {
      store.codes.delete(code);
      return null;
    }

    // Verify client_id matches
    if (authCode.client_id !== clientId) {
      return null;
    }

    // Verify PKCE S256
    const codeChallenge = createHash("sha256")
      .update(codeVerifier)
      .digest("base64url");

    if (codeChallenge !== authCode.code_challenge) {
      return null;
    }

    // Generate access token
    const accessToken = randomBytes(32).toString("hex");
    const expiresIn = 3600; // 1 hour
    const expiresAt = Date.now() + expiresIn * 1000;

    store.tokens.set(accessToken, {
      access_token: accessToken,
      token_type: "Bearer",
      scope: authCode.scope,
      resource: authCode.resource,
      issued_at: Date.now(),
      expires_at: expiresAt,
      client_id: clientId,
    });

    // Delete used authorization code
    store.codes.delete(code);

    return {
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: expiresIn,
      scope: authCode.scope,
      resource: authCode.resource,
    };
  },

  /**
   * Verify access token and return token data
   */
  verifyToken(token: string): OAuthToken | null {
    const oauthToken = store.tokens.get(token);

    if (!oauthToken) {
      return null;
    }

    // Verify token not expired
    if (oauthToken.expires_at < Date.now()) {
      store.tokens.delete(token);
      return null;
    }

    return oauthToken;
  },

  /**
   * Revoke access token
   */
  revokeToken(token: string): boolean {
    return store.tokens.delete(token);
  },

  /**
   * Get store for testing
   */
  getStore(): Store {
    return store;
  },
};
