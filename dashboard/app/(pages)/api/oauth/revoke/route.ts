/**
 * OAuth 2.1 Token Revocation Endpoint (RFC 7009)
 * Allows clients to revoke access tokens
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

    // Revoke the token
    OAuthService.revokeToken(token);

    // RFC 7009: Return 200 OK even if token was already revoked or invalid
    return new Response(null, {
      status: 200,
      headers: { "Cache-Control": "no-store", Pragma: "no-cache" },
    });
  } catch (error) {
    console.error("Revocation error:", error);
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
