import { OAuthService } from "@/app/services/api/oauth/service";
import { createHash, randomBytes } from "crypto";

describe("OAuth 2.1 PKCE Service", () => {
  beforeEach(() => {
    // Clear store before each test
    OAuthService.getStore().codes.clear();
    OAuthService.getStore().tokens.clear();
  });

  describe("Authorization Code Generation", () => {
    it("should generate a valid authorization code", () => {
      const code = OAuthService.generateAuthorizationCode(
        "client-1",
        "challenge-hash",
        "S256",
        "https://callback.example.com",
        "instagram:read",
        "https://mcp.example.com"
      );

      expect(code).toBeDefined();
      expect(typeof code).toBe("string");
      expect(code.length).toBeGreaterThan(0);
    });

    it("should store authorization code with metadata", () => {
      const clientId = "client-1";
      const challenge = "challenge-hash";
      const resource = "https://mcp.example.com";

      OAuthService.generateAuthorizationCode(
        clientId,
        challenge,
        "S256",
        "https://callback.example.com",
        "instagram:read",
        resource
      );

      const store = OAuthService.getStore();
      const code = Array.from(store.codes.values())[0];

      expect(code.client_id).toBe(clientId);
      expect(code.code_challenge).toBe(challenge);
      expect(code.code_challenge_method).toBe("S256");
      expect(code.resource).toBe(resource);
    });

    it("should set authorization code expiration to 10 minutes", () => {
      const now = Date.now();
      const code = OAuthService.generateAuthorizationCode(
        "client-1",
        "challenge",
        "S256",
        "https://callback.example.com",
        "instagram:read",
        "https://mcp.example.com"
      );

      const store = OAuthService.getStore();
      const authCode = store.codes.get(code);

      expect(authCode).toBeDefined();
      expect(authCode!.expires_at - now).toBeGreaterThan(9 * 60 * 1000);
      expect(authCode!.expires_at - now).toBeLessThan(11 * 60 * 1000);
    });
  });

  describe("Code to Token Exchange (PKCE S256)", () => {
    it("should exchange valid authorization code for access token", () => {
      // Generate code verifier and challenge
      const verifier = randomBytes(32).toString("hex");
      const challenge = createHash("sha256")
        .update(verifier)
        .digest("base64url");

      // Generate authorization code
      const code = OAuthService.generateAuthorizationCode(
        "client-1",
        challenge,
        "S256",
        "https://callback.example.com",
        "instagram:read",
        "https://mcp.example.com"
      );

      // Exchange for token
      const token = OAuthService.exchangeCodeForToken(
        code,
        "client-1",
        verifier,
        "https://callback.example.com"
      );

      expect(token).toBeDefined();
      expect(token?.access_token).toBeDefined();
      expect(token?.token_type).toBe("Bearer");
      expect(token?.expires_in).toBe(3600);
      expect(token?.scope).toBe("instagram:read");
    });

    it("should reject code exchange with wrong client_id", () => {
      const verifier = randomBytes(32).toString("hex");
      const challenge = createHash("sha256")
        .update(verifier)
        .digest("base64url");

      const code = OAuthService.generateAuthorizationCode(
        "client-1",
        challenge,
        "S256",
        "https://callback.example.com",
        "instagram:read",
        "https://mcp.example.com"
      );

      const token = OAuthService.exchangeCodeForToken(
        code,
        "different-client", // Wrong client_id
        verifier,
        "https://callback.example.com"
      );

      expect(token).toBeNull();
    });

    it("should reject code exchange with wrong code_verifier", () => {
      const verifier = randomBytes(32).toString("hex");
      const challenge = createHash("sha256")
        .update(verifier)
        .digest("base64url");

      const code = OAuthService.generateAuthorizationCode(
        "client-1",
        challenge,
        "S256",
        "https://callback.example.com",
        "instagram:read",
        "https://mcp.example.com"
      );

      const wrongVerifier = randomBytes(32).toString("hex");
      const token = OAuthService.exchangeCodeForToken(
        code,
        "client-1",
        wrongVerifier, // Wrong verifier
        "https://callback.example.com"
      );

      expect(token).toBeNull();
    });

    it("should reject expired authorization code", async () => {
      const verifier = randomBytes(32).toString("hex");
      const challenge = createHash("sha256")
        .update(verifier)
        .digest("base64url");

      // Generate code
      const code = OAuthService.generateAuthorizationCode(
        "client-1",
        challenge,
        "S256",
        "https://callback.example.com",
        "instagram:read",
        "https://mcp.example.com"
      );

      // Manually expire it
      const store = OAuthService.getStore();
      const authCode = store.codes.get(code);
      if (authCode) {
        authCode.expires_at = Date.now() - 1000;
      }

      // Try to exchange
      const token = OAuthService.exchangeCodeForToken(
        code,
        "client-1",
        verifier,
        "https://callback.example.com"
      );

      expect(token).toBeNull();
    });

    it("should delete authorization code after successful exchange", () => {
      const verifier = randomBytes(32).toString("hex");
      const challenge = createHash("sha256")
        .update(verifier)
        .digest("base64url");

      const code = OAuthService.generateAuthorizationCode(
        "client-1",
        challenge,
        "S256",
        "https://callback.example.com",
        "instagram:read",
        "https://mcp.example.com"
      );

      const store = OAuthService.getStore();
      expect(store.codes.size).toBe(1);

      OAuthService.exchangeCodeForToken(
        code,
        "client-1",
        verifier,
        "https://callback.example.com"
      );

      expect(store.codes.size).toBe(0);
    });
  });

  describe("Token Verification", () => {
    it("should verify valid access token", () => {
      const verifier = randomBytes(32).toString("hex");
      const challenge = createHash("sha256")
        .update(verifier)
        .digest("base64url");

      const code = OAuthService.generateAuthorizationCode(
        "client-1",
        challenge,
        "S256",
        "https://callback.example.com",
        "instagram:read",
        "https://mcp.example.com"
      );

      const tokenResponse = OAuthService.exchangeCodeForToken(
        code,
        "client-1",
        verifier,
        "https://callback.example.com"
      );

      const verified = OAuthService.verifyToken(tokenResponse!.access_token);

      expect(verified).toBeDefined();
      expect(verified?.access_token).toBe(tokenResponse?.access_token);
      expect(verified?.token_type).toBe("Bearer");
      expect(verified?.scope).toBe("instagram:read");
    });

    it("should reject invalid token", () => {
      const verified = OAuthService.verifyToken("invalid-token");
      expect(verified).toBeNull();
    });

    it("should reject expired token", () => {
      const verifier = randomBytes(32).toString("hex");
      const challenge = createHash("sha256")
        .update(verifier)
        .digest("base64url");

      const code = OAuthService.generateAuthorizationCode(
        "client-1",
        challenge,
        "S256",
        "https://callback.example.com",
        "instagram:read",
        "https://mcp.example.com"
      );

      const tokenResponse = OAuthService.exchangeCodeForToken(
        code,
        "client-1",
        verifier,
        "https://callback.example.com"
      );

      const token = tokenResponse!.access_token;

      // Manually expire it
      const store = OAuthService.getStore();
      const oauthToken = store.tokens.get(token);
      if (oauthToken) {
        oauthToken.expires_at = Date.now() - 1000;
      }

      const verified = OAuthService.verifyToken(token);
      expect(verified).toBeNull();
    });

    it("should return token expiration details", () => {
      const verifier = randomBytes(32).toString("hex");
      const challenge = createHash("sha256")
        .update(verifier)
        .digest("base64url");

      const code = OAuthService.generateAuthorizationCode(
        "client-1",
        challenge,
        "S256",
        "https://callback.example.com",
        "instagram:read",
        "https://mcp.example.com"
      );

      const tokenResponse = OAuthService.exchangeCodeForToken(
        code,
        "client-1",
        verifier,
        "https://callback.example.com"
      );

      const verified = OAuthService.verifyToken(tokenResponse!.access_token);

      expect(verified?.expires_at).toBeGreaterThan(Date.now());
      expect(verified?.issued_at).toBeLessThanOrEqual(Date.now());
    });
  });

  describe("Token Revocation", () => {
    it("should revoke access token", () => {
      const verifier = randomBytes(32).toString("hex");
      const challenge = createHash("sha256")
        .update(verifier)
        .digest("base64url");

      const code = OAuthService.generateAuthorizationCode(
        "client-1",
        challenge,
        "S256",
        "https://callback.example.com",
        "instagram:read",
        "https://mcp.example.com"
      );

      const tokenResponse = OAuthService.exchangeCodeForToken(
        code,
        "client-1",
        verifier,
        "https://callback.example.com"
      );

      const token = tokenResponse!.access_token;

      // Verify token exists
      expect(OAuthService.verifyToken(token)).toBeDefined();

      // Revoke it
      const revoked = OAuthService.revokeToken(token);
      expect(revoked).toBe(true);

      // Verify it's gone
      expect(OAuthService.verifyToken(token)).toBeNull();
    });

    it("should return false when revoking non-existent token", () => {
      const revoked = OAuthService.revokeToken("non-existent-token");
      expect(revoked).toBe(false);
    });
  });

  describe("PKCE S256 Validation", () => {
    it("should correctly validate code_challenge with S256", () => {
      // Test vector from RFC 7636
      const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
      const expectedChallenge = "E9Mrozoa2owutsKEMTXMArJtAKk1MXQu-xIstmKwXG8";

      const computed = createHash("sha256")
        .update(verifier)
        .digest("base64url");

      expect(computed).toBe(expectedChallenge);
    });

    it("should complete full OAuth flow with PKCE", () => {
      // 1. Client generates verifier
      const verifier = randomBytes(32).toString("hex");
      const challenge = createHash("sha256")
        .update(verifier)
        .digest("base64url");

      // 2. Request authorization code
      const code = OAuthService.generateAuthorizationCode(
        "chatgpt",
        challenge,
        "S256",
        "https://openai.com/callback",
        "instagram:read instagram:insights",
        "https://mcp.example.com"
      );

      expect(code).toBeDefined();

      // 3. Exchange code for token (with verifier)
      const token = OAuthService.exchangeCodeForToken(
        code,
        "chatgpt",
        verifier,
        "https://openai.com/callback"
      );

      expect(token).toBeDefined();
      expect(token?.access_token).toBeDefined();

      // 4. Use token
      const verified = OAuthService.verifyToken(token!.access_token);

      expect(verified).toBeDefined();
      expect(verified?.scope).toContain("instagram:read");
    });
  });
});
