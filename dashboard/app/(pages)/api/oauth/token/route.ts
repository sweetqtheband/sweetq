/**
 * OAuth 2.1 Token Endpoint
 * Exchanges authorization code for access token with PKCE verification
 */

import { OAuthService } from "@/app/services/api/oauth/service";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type");

    let body: Record<string, string> = {};

    if (contentType?.includes("application/json")) {
      body = await request.json();
    } else if (contentType?.includes("application/x-www-form-urlencoded")) {
      const formData = await request.text();
      const params = new URLSearchParams(formData);
      for (const [key, value] of params.entries()) {
        body[key] = value;
      }
    }

    const grantType = body.grant_type;
    const code = body.code;
    const clientId = body.client_id;
    const redirectUri = body.redirect_uri;
    const codeVerifier = body.code_verifier;

    // Validate required parameters
    if (
      grantType !== "authorization_code" ||
      !code ||
      !clientId ||
      !redirectUri ||
      !codeVerifier
    ) {
      return new Response(
        JSON.stringify({
          error: "invalid_request",
          error_description: "Missing required parameters",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Exchange code for token
    const token = OAuthService.exchangeCodeForToken(
      code,
      clientId,
      codeVerifier,
      redirectUri
    );

    if (!token) {
      return new Response(
        JSON.stringify({
          error: "invalid_grant",
          error_description: "Authorization code is invalid or expired",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(token), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error("Token endpoint error:", error);
    return new Response(
      JSON.stringify({
        error: "server_error",
        error_description: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
