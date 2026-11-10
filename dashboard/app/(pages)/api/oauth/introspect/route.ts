/**
 * OAuth 2.1 Token Introspection Endpoint (RFC 7662)
 * Allows clients to query token validity and metadata
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

    const token = body.token;

    if (!token) {
      return new Response(
        JSON.stringify({
          error: "invalid_request",
          error_description: "Token parameter is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const oauthToken = OAuthService.verifyToken(token);

    if (!oauthToken) {
      return new Response(
        JSON.stringify({
          active: false,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        active: true,
        scope: oauthToken.scope,
        resource: oauthToken.resource,
        client_id: oauthToken.client_id,
        token_type: oauthToken.token_type,
        exp: Math.floor(oauthToken.expires_at / 1000),
        iat: Math.floor(oauthToken.issued_at / 1000),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Introspection error:", error);
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
