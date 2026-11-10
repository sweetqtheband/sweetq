/**
 * OAuth Authorization Server Metadata (.well-known/oauth-authorization-server)
 * Implements RFC 8414 OAuth 2.0 Authorization Server Metadata
 */

import type { OAuthAuthorizationServerMetadata } from "@/types/oauth";

export async function GET(request: Request) {
  const baseUrl =
    process.env.NEXT_PUBLIC_URL || "https://srv659934.hstgr.cloud";

  const metadata: OAuthAuthorizationServerMetadata = {
    issuer: baseUrl,
    authorization_response_iss_parameter_supported: true,
    authorization_endpoint: `${baseUrl}/api/oauth/authorize`,
    token_endpoint: `${baseUrl}/api/oauth/token`,
    client_id_metadata_document_supported: false,
    token_endpoint_auth_methods_supported: ["none"],
    code_challenge_methods_supported: ["S256"],
    scopes_supported: [
      "instagram:read",
      "instagram:insights",
      "instagram:search",
    ],
    introspection_endpoint: `${baseUrl}/api/oauth/introspect`,
    revocation_endpoint: `${baseUrl}/api/oauth/revoke`,
  };

  return new Response(JSON.stringify(metadata), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
