#!/usr/bin/env tsx
/**
 * Manual OAuth 2.1 Test Suite
 * Run with: tsx scripts/test-oauth.ts
 */

import { OAuthService } from "../app/services/api/oauth/service";
import { createHash, randomBytes } from "crypto";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    results.push({ name, passed: true });
    console.log(`✓ ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    results.push({ name, passed: false, error: message });
    console.log(`✗ ${name}: ${message}`);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message?: string) {
  if (actual !== expected) {
    throw new Error(
      `Expected ${expected}, got ${actual}${message ? `: ${message}` : ""}`
    );
  }
}

// Clear store before tests
OAuthService.getStore().codes.clear();
OAuthService.getStore().tokens.clear();

console.log("\n🧪 OAuth 2.1 PKCE Service Tests\n");

test("Authorization code generation", () => {
  const code = OAuthService.generateAuthorizationCode(
    "client-1",
    "challenge",
    "S256",
    "https://callback.example.com",
    "instagram:read",
    "https://mcp.example.com"
  );

  assert(code, "Code should be generated");
  assert(typeof code === "string", "Code should be string");
  assert(code.length > 0, "Code should not be empty");
});

test("Authorization code storage", () => {
  OAuthService.getStore().codes.clear();

  OAuthService.generateAuthorizationCode(
    "client-1",
    "challenge",
    "S256",
    "https://callback.example.com",
    "instagram:read",
    "https://mcp.example.com"
  );

  assert(OAuthService.getStore().codes.size === 1, "Code should be stored");
});

test("Authorization code expiration (10 minutes)", () => {
  OAuthService.getStore().codes.clear();

  const now = Date.now();
  OAuthService.generateAuthorizationCode(
    "client-1",
    "challenge",
    "S256",
    "https://callback.example.com",
    "instagram:read",
    "https://mcp.example.com"
  );

  const code = Array.from(OAuthService.getStore().codes.values())[0];
  const expiresIn = code.expires_at - now;

  assert(expiresIn > 9 * 60 * 1000, "Should expire in ~10 minutes (lower bound)");
  assert(expiresIn < 11 * 60 * 1000, "Should expire in ~10 minutes (upper bound)");
});

test("PKCE S256 code_challenge verification", () => {
  // Verify that S256 hashing works correctly with base64url
  const verifier = randomBytes(32).toString("hex");
  const challenge = createHash("sha256")
    .update(verifier)
    .digest("base64url");

  // Challenge should be non-empty and base64url encoded (no +, /, =)
  assert(challenge.length > 0, "Challenge should not be empty");
  assert(!/[+\/=]/.test(challenge), "Challenge should be base64url encoded");

  // Verify it's consistent
  const challenge2 = createHash("sha256")
    .update(verifier)
    .digest("base64url");

  assertEqual(challenge, challenge2, "S256 should produce consistent output");
});

test("Code exchange with valid PKCE verifier", () => {
  OAuthService.getStore().codes.clear();
  OAuthService.getStore().tokens.clear();

  const verifier = randomBytes(32).toString("hex");
  const challenge = createHash("sha256").update(verifier).digest("base64url");

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
    "client-1",
    verifier,
    "https://callback.example.com"
  );

  assert(token, "Token should be returned");
  assert(token?.access_token, "Access token should exist");
  assertEqual(token?.token_type, "Bearer", "Token type should be Bearer");
  assertEqual(token?.expires_in, 3600, "Token should expire in 1 hour");
  assertEqual(token?.scope, "instagram:read", "Scope should be preserved");
});

test("Code exchange with wrong code_verifier (PKCE rejection)", () => {
  OAuthService.getStore().codes.clear();
  OAuthService.getStore().tokens.clear();

  const verifier = randomBytes(32).toString("hex");
  const challenge = createHash("sha256").update(verifier).digest("base64url");

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
    wrongVerifier,
    "https://callback.example.com"
  );

  assert(!token, "Should reject token exchange with wrong verifier");
});

test("Code exchange with wrong client_id", () => {
  OAuthService.getStore().codes.clear();
  OAuthService.getStore().tokens.clear();

  const verifier = randomBytes(32).toString("hex");
  const challenge = createHash("sha256").update(verifier).digest("base64url");

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
    "different-client",
    verifier,
    "https://callback.example.com"
  );

  assert(!token, "Should reject token exchange with wrong client_id");
});

test("Code exchange deletes authorization code", () => {
  OAuthService.getStore().codes.clear();
  OAuthService.getStore().tokens.clear();

  const verifier = randomBytes(32).toString("hex");
  const challenge = createHash("sha256").update(verifier).digest("base64url");

  const code = OAuthService.generateAuthorizationCode(
    "client-1",
    challenge,
    "S256",
    "https://callback.example.com",
    "instagram:read",
    "https://mcp.example.com"
  );

  assert(
    OAuthService.getStore().codes.size === 1,
    "Authorization code should be stored"
  );

  OAuthService.exchangeCodeForToken(
    code,
    "client-1",
    verifier,
    "https://callback.example.com"
  );

  assert(
    OAuthService.getStore().codes.size === 0,
    "Authorization code should be deleted after exchange"
  );
});

test("Token verification for valid token", () => {
  OAuthService.getStore().codes.clear();
  OAuthService.getStore().tokens.clear();

  const verifier = randomBytes(32).toString("hex");
  const challenge = createHash("sha256").update(verifier).digest("base64url");

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

  assert(verified, "Token should be verified");
  assertEqual(
    verified?.access_token,
    tokenResponse?.access_token,
    "Token value should match"
  );
  assertEqual(verified?.token_type, "Bearer", "Token type should be Bearer");
  assertEqual(verified?.scope, "instagram:read", "Scope should be preserved");
});

test("Token verification for invalid token", () => {
  const verified = OAuthService.verifyToken("invalid-token");
  assert(!verified, "Invalid token should not be verified");
});

test("Token revocation", () => {
  OAuthService.getStore().codes.clear();
  OAuthService.getStore().tokens.clear();

  const verifier = randomBytes(32).toString("hex");
  const challenge = createHash("sha256").update(verifier).digest("base64url");

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

  assert(
    OAuthService.verifyToken(token),
    "Token should exist before revocation"
  );

  const revoked = OAuthService.revokeToken(token);
  assert(revoked, "Revocation should return true");
  assert(!OAuthService.verifyToken(token), "Token should not exist after revocation");
});

test("Complete OAuth PKCE flow (end-to-end)", () => {
  OAuthService.getStore().codes.clear();
  OAuthService.getStore().tokens.clear();

  // Step 1: Client generates PKCE verifier
  const verifier = randomBytes(32).toString("hex");
  const challenge = createHash("sha256").update(verifier).digest("base64url");

  // Step 2: Request authorization code
  const code = OAuthService.generateAuthorizationCode(
    "chatgpt",
    challenge,
    "S256",
    "https://openai.com/callback",
    "instagram:read instagram:insights",
    "https://mcp.example.com"
  );

  assert(code, "Authorization code should be generated");

  // Step 3: Exchange code for token
  const token = OAuthService.exchangeCodeForToken(
    code,
    "chatgpt",
    verifier,
    "https://openai.com/callback"
  );

  assert(token, "Access token should be issued");

  // Step 4: Use token
  const verified = OAuthService.verifyToken(token!.access_token);

  assert(verified, "Token should be verified");
  assert(verified?.scope.includes("instagram:read"), "Should have read scope");
  assert(verified?.scope.includes("instagram:insights"), "Should have insights scope");
});

// Print summary
console.log("\n" + "=".repeat(50));
const passed = results.filter((r) => r.passed).length;
const total = results.length;
console.log(`\nResults: ${passed}/${total} tests passed`);

if (passed === total) {
  console.log("✓ All tests passed!");
  process.exit(0);
} else {
  console.log("✗ Some tests failed:");
  results
    .filter((r) => !r.passed)
    .forEach((r) => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  process.exit(1);
}
