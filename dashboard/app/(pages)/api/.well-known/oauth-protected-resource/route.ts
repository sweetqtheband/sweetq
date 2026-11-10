/**
 * Protected Resource Metadata (.well-known/oauth-protected-resource)
 * MCP Resource Server metadata for OAuth 2.1
 */

import type { ProtectedResourceMetadata } from "@/types/oauth";

export async function GET(request: Request) {
  const baseUrl =
    process.env.NEXT_PUBLIC_URL || "https://srv659934.hstgr.cloud";

  const metadata: ProtectedResourceMetadata = {
    resource: baseUrl,
    authorization_servers: [baseUrl],
    scopes_supported: [
      "instagram:read",
      "instagram:insights",
      "instagram:search",
    ],
    resource_documentation: "https://github.com/sweetqtheband/sweetq",
  };

  return new Response(JSON.stringify(metadata), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
