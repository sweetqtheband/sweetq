import { oauthMetadata } from "@/app/services/api/oauth/runtime";
import { MCP_OAUTH_SCOPE } from "@/app/services/api/oauth/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { resource, issuer } = oauthMetadata();
    return Response.json({
      resource,
      authorization_servers: [issuer],
      scopes_supported: [MCP_OAUTH_SCOPE],
      bearer_methods_supported: ["header"],
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "temporarily_unavailable" }, { status: 503 });
  }
}
