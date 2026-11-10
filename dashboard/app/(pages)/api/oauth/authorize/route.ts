/**
 * OAuth 2.1 Authorization Endpoint
 * Implements Authorization Code + PKCE S256 flow
 */

import { OAuthService } from "@/app/services/api/oauth/service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;

    // Extract required parameters
    const clientId = params.get("client_id");
    const responseType = params.get("response_type");
    const redirectUri = params.get("redirect_uri");
    const scope = params.get("scope") || "instagram:read";
    const state = params.get("state");
    const codeChallenge = params.get("code_challenge");
    const codeChallengeMethod = params.get("code_challenge_method");
    const resource = params.get("resource");

    // Validate required parameters
    if (
      !clientId ||
      responseType !== "code" ||
      !redirectUri ||
      !state ||
      !codeChallenge ||
      codeChallengeMethod !== "S256" ||
      !resource
    ) {
      const error = new URL(redirectUri || "");
      error.searchParams.set("error", "invalid_request");
      error.searchParams.set("error_description", "Missing required parameters");
      error.searchParams.set("state", state || "");

      return new Response(null, {
        status: 302,
        headers: { Location: error.toString() },
      });
    }

    // Validate redirect_uri format
    try {
      new URL(redirectUri);
    } catch {
      return new Response("Invalid redirect_uri", { status: 400 });
    }

    // Validate resource matches expected value
    const baseUrl =
      process.env.NEXT_PUBLIC_URL || "https://srv659934.hstgr.cloud";
    if (resource !== baseUrl) {
      const error = new URL(redirectUri);
      error.searchParams.set("error", "invalid_resource");
      error.searchParams.set("error_description", "Resource mismatch");
      error.searchParams.set("state", state);

      return new Response(null, {
        status: 302,
        headers: { Location: error.toString() },
      });
    }

    // Generate authorization code
    const code = OAuthService.generateAuthorizationCode(
      clientId,
      codeChallenge,
      "S256",
      redirectUri,
      scope,
      resource
    );

    // Redirect back with authorization code
    const redirectUrl = new URL(redirectUri);
    redirectUrl.searchParams.set("code", code);
    redirectUrl.searchParams.set("state", state);
    redirectUrl.searchParams.set("iss", baseUrl);

    return new Response(null, {
      status: 302,
      headers: { Location: redirectUrl.toString() },
    });
  } catch (error) {
    console.error("Authorization error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
