import { timingSafeEqual } from "node:crypto";
import type { InstagramPost } from "@/types/instagram-post";
import { getCollection } from "@/app/services/api/_db";
import { FactorySvc } from "@/app/services/api/factory";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { verifyOAuthAccessToken, oauthMetadata } from "@/app/services/api/oauth/runtime";
import {
  ListPostsInput,
  GetPostInput,
  GetInsightsInput,
  GetAccountInsightsInput,
  SearchPostsInput,
} from "@/app/services/api/instagram/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AuthResult {
  valid: boolean;
  method?: "bearer" | "oauth";
  error?: string;
}

/**
 * Verify Bearer token (legacy MCP_READ_TOKEN)
 */
function verifyBearerToken(authHeader: string | null): boolean {
  const secret = process.env.MCP_READ_TOKEN;
  if (!secret || !authHeader) return false;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return false;

  const bearerToken = parts[1];
  const expected = Buffer.from(secret);
  const received = Buffer.from(bearerToken);

  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    return false;
  }

  return true;
}

/**
 * Authenticate requests using the existing MCP token.
 */
async function authenticate(authHeader: string | null): Promise<AuthResult> {
  if (!authHeader) {
    return {
      valid: false,
      error: "Missing Authorization header",
    };
  }

  // Fall back to Bearer token (legacy)
  if (verifyBearerToken(authHeader)) {
    return { valid: true, method: "bearer" };
  }
  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0] === "Bearer" &&
      process.env.MCP_OAUTH_ISSUER && process.env.MCP_OAUTH_COOKIE_KEY &&
      process.env.MCP_OAUTH_JWKS && await verifyOAuthAccessToken(parts[1])) {
    return { valid: true, method: "oauth" };
  }

  return {
    valid: false,
    error: "Invalid token",
  };
}

/**
 * Send SSE message
 */
function sendSSE(message: Record<string, unknown>): string {
  return `data: ${JSON.stringify(message)}\n\n`;
}

/**
 * Build WWW-Authenticate header for 401 responses
 */
function getWWWAuthenticateHeader(): string {
  if (process.env.MCP_OAUTH_ISSUER && process.env.MCP_OAUTH_COOKIE_KEY && process.env.MCP_OAUTH_JWKS) {
    try {
      return `Bearer resource_metadata="${oauthMetadata().metadata}", scope="instagram:read"`;
    } catch (error) {
      console.error("[MCP] OAuth configuration unavailable", error instanceof Error ? error.name : "unknown error");
    }
  }
  return 'Bearer realm="Instagram MCP"';
}

/**
 * Main MCP POST handler - processes tool calls
 */
async function legacyPost(request: Request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    const auth = await authenticate(authHeader);

    if (!auth.valid) {
      return new Response(
        sendSSE({
          jsonrpc: "2.0",
          error: { code: -32600, message: "Unauthorized" },
          id: null,
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "text/event-stream",
            "WWW-Authenticate": getWWWAuthenticateHeader(),
          },
        }
      );
    }

    const body = (await request.json()) as any;
    const { jsonrpc, method, params, id } = body;

    // Handle tools/call RPC method
    if (method === "tools/call") {
      const { name, arguments: args } = params;

      try {
        const collection = await getCollection("instagram");
        const instagramSvc = FactorySvc("instagram", collection);
        const tokenData = await instagramSvc.getAccessToken(instagramSvc);

        if (!tokenData?.long_live_access_token) {
          return new Response(
            sendSSE({
              jsonrpc,
              result: {
                content: [
                  {
                    type: "text",
                    text: "Error: No Instagram token found",
                  },
                ],
                isError: true,
              },
              id,
            }),
            {
              status: 200,
              headers: { "Content-Type": "text/event-stream" },
            }
          );
        }

        let result: unknown;

        switch (name) {
          case "instagram_list_posts": {
            const input = ListPostsInput.parse(args);
            const posts = await instagramSvc.listInstagramPosts(
              tokenData.long_live_access_token,
              tokenData.user_id,
              input.limit,
              input.cursor,
              input.media_type
            );

            let filteredPosts = posts.posts;
            if (input.start_date || input.end_date) {
              const startDate = input.start_date
                ? new Date(input.start_date)
                : null;
              const endDate = input.end_date ? new Date(input.end_date) : null;

              filteredPosts = filteredPosts.filter((post: InstagramPost) => {
                const postDate = new Date(post.timestamp);
                if (startDate && postDate < startDate) return false;
                if (endDate && postDate > endDate) return false;
                return true;
              });
            }

            result = {
              posts: filteredPosts,
              paging: {
                next_cursor: posts.nextCursor,
                has_more: posts.hasMore,
              },
            };
            break;
          }

          case "instagram_get_post": {
            const input = GetPostInput.parse(args);
            const post = await instagramSvc.getInstagramPost(
              tokenData.long_live_access_token,
              input.post_id
            );
            result = post;
            break;
          }

          case "instagram_get_insights": {
            const input = GetInsightsInput.parse(args);
            const metrics = input.metrics || [
              "engagement",
              "impressions",
              "reach",
            ];
            const insights = await instagramSvc.getPostInsights(
              tokenData.long_live_access_token,
              input.post_id,
              metrics
            );
            result = insights;
            break;
          }

          case "instagram_get_account_insights": {
            const input = GetAccountInsightsInput.parse(args);
            const insights = await instagramSvc.getAccountInsights(
              tokenData.long_live_access_token,
              tokenData.user_id,
              input.period || "lifetime"
            );
            result = insights;
            break;
          }

          case "instagram_search_posts": {
            const input = SearchPostsInput.parse(args);
            const posts = await instagramSvc.searchPosts(
              input.query,
              input.limit || 50,
              input.skip || 0,
              input.media_type
            );
            result = {
              posts: posts.posts,
              count: posts.count,
            };
            break;
          }

          default:
            return new Response(
              sendSSE({
                jsonrpc,
                error: { code: -32601, message: `Unknown method: ${name}` },
                id,
              }),
              {
                status: 200,
                headers: { "Content-Type": "text/event-stream" },
              }
            );
        }

        return new Response(
          sendSSE({
            jsonrpc,
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result, null, 2),
                },
              ],
            },
            id,
          }),
          {
            status: 200,
            headers: { "Content-Type": "text/event-stream" },
          }
        );
      } catch (error) {
        console.error("[MCP] Instagram tool request failed", error instanceof Error ? error.name : "unknown error");
        return new Response(
          sendSSE({
            jsonrpc,
            result: {
              content: [
                {
                  type: "text",
                  text: "Error: Instagram request failed",
                },
              ],
              isError: true,
            },
            id,
          }),
          {
            status: 200,
            headers: { "Content-Type": "text/event-stream" },
          }
        );
      }
    }

    // Handle tools/list RPC method (discovery)
    if (method === "tools/list") {
      return new Response(
        sendSSE({
          jsonrpc,
          result: {
            tools: [
              {
                name: "instagram_list_posts",
                description:
                  "List Instagram posts with pagination and optional filtering by media type and date range",
                inputSchema: {
                  type: "object",
                  properties: {
                    limit: {
                      type: "number",
                      description: "Number of posts to return (1-50)",
                      default: 20,
                    },
                    cursor: {
                      type: "string",
                      description: "Cursor for pagination",
                    },
                    media_type: {
                      type: "string",
                      enum: ["IMAGE", "VIDEO", "CAROUSEL_ALBUM", "REELS"],
                      description: "Filter by media type",
                    },
                    start_date: {
                      type: "string",
                      description: "Filter posts from this date (ISO 8601)",
                    },
                    end_date: {
                      type: "string",
                      description: "Filter posts until this date (ISO 8601)",
                    },
                  },
                  required: [],
                },
              },
              {
                name: "instagram_get_post",
                description:
                  "Get detailed information about a specific Instagram post",
                inputSchema: {
                  type: "object",
                  properties: {
                    post_id: {
                      type: "string",
                      description: "The Instagram post ID",
                    },
                  },
                  required: ["post_id"],
                },
              },
              {
                name: "instagram_get_insights",
                description:
                  "Get metrics and insights for a specific Instagram post",
                inputSchema: {
                  type: "object",
                  properties: {
                    post_id: {
                      type: "string",
                      description: "The Instagram post ID",
                    },
                    metrics: {
                      type: "array",
                      items: { type: "string" },
                      description:
                        "Specific metrics to retrieve (engagement, impressions, reach, etc.)",
                    },
                  },
                  required: ["post_id"],
                },
              },
              {
                name: "instagram_get_account_insights",
                description: "Get account-level metrics and statistics",
                inputSchema: {
                  type: "object",
                  properties: {
                    period: {
                      type: "string",
                      enum: ["lifetime", "day"],
                      description: "Time period for the insights",
                      default: "lifetime",
                    },
                  },
                  required: [],
                },
              },
              {
                name: "instagram_search_posts",
                description: "Search Instagram posts by text in captions",
                inputSchema: {
                  type: "object",
                  properties: {
                    query: {
                      type: "string",
                      description: "Search term or phrase",
                    },
                    limit: {
                      type: "number",
                      description: "Max results (default 50)",
                      default: 50,
                    },
                    skip: {
                      type: "number",
                      description: "Skip results (for pagination)",
                      default: 0,
                    },
                    media_type: {
                      type: "string",
                      enum: ["IMAGE", "VIDEO", "CAROUSEL_ALBUM", "REELS"],
                      description: "Filter by media type (optional)",
                    },
                  },
                  required: ["query"],
                },
              },
            ],
          },
          id,
        }),
        {
          status: 200,
          headers: { "Content-Type": "text/event-stream" },
        }
      );
    }

    return new Response(
      sendSSE({
        jsonrpc,
        error: {
          code: -32601,
          message: `Method not implemented: ${method}`,
        },
        id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      }
    );
  } catch (error) {
    console.error("[MCP Error]", error);
    return new Response(
      `data: ${JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal error",
        },
        id: null,
      })}\n\n`,
      {
        status: 500,
        headers: { "Content-Type": "text/event-stream" },
      }
    );
  }
}

const toolResultSchema = z.object({
  result: z.object({
    content: z.array(z.object({ type: z.literal("text"), text: z.string() })),
    isError: z.boolean().optional(),
  }).optional(),
  error: z.object({ message: z.string() }).optional(),
});

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  let valid = false;
  try {
    valid = !!authorization && (await authenticate(authorization)).valid;
  } catch (error) {
    console.error("[MCP] Authentication unavailable", error instanceof Error ? error.message : "unknown error");
    return Response.json({ error: "Authentication unavailable" }, { status: 503 });
  }
  if (!authorization || !valid) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "WWW-Authenticate": getWWWAuthenticateHeader(),
      },
    });
  }

  const tools = [
    { name: "instagram_list_posts", description: "List Instagram posts with pagination and filters", schema: ListPostsInput },
    { name: "instagram_get_post", description: "Get an Instagram post by ID", schema: GetPostInput },
    { name: "instagram_get_insights", description: "Get insights for an Instagram post", schema: GetInsightsInput },
    { name: "instagram_get_account_insights", description: "Get account-level insights", schema: GetAccountInsightsInput },
    { name: "instagram_search_posts", description: "Search Instagram post captions", schema: SearchPostsInput },
  ];

  const handler = createMcpHandler((server) => {
    for (const tool of tools) {
      server.registerTool(tool.name, {
        description: tool.description,
        inputSchema: tool.schema,
        annotations: { readOnlyHint: true },
      }, async (args: unknown) => {
        const response = await legacyPost(new Request(request.url, {
          method: "POST",
          headers: {
            authorization,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "tools/call",
            params: { name: tool.name, arguments: args },
          }),
        }));
        const event = await response.text();
        const data = event.startsWith("data: ") ? event.slice(6).trim() : event;
        const result = toolResultSchema.parse(JSON.parse(data));
        if (result.result) return result.result;
        return {
          content: [{ type: "text" as const, text: result.error?.message ?? "MCP tool failed" }],
          isError: true,
        };
      });
    }
  }, { serverInfo: { name: "Sweet Q – Instagram", version: "1.0.0" } });

  if (!request.headers.has("accept")) {
    const headers = new Headers(request.headers);
    headers.set("accept", "application/json, text/event-stream");
    return handler(new Request(request, { headers }));
  }
  return handler(request);
}

/**
 * GET request for tool discovery (for direct HTTP clients)
 */
export async function GET(request: Request) {
  // Verify authentication
  const authHeader = request.headers.get("authorization");
  let auth: AuthResult;
  try {
    auth = await authenticate(authHeader);
  } catch (error) {
    console.error("[MCP] Authentication unavailable", error instanceof Error ? error.message : "unknown error");
    return Response.json({ error: "Authentication unavailable" }, { status: 503 });
  }

  if (!auth.valid) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        error_description: auth.error,
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "WWW-Authenticate": getWWWAuthenticateHeader(),
        },
      }
    );
  }

  // Return tool list for discovery
  return new Response(
    JSON.stringify({
      tools: [
        {
          name: "instagram_list_posts",
          description:
            "List Instagram posts with pagination and optional filtering",
        },
        {
          name: "instagram_get_post",
          description:
            "Get detailed information about a specific Instagram post",
        },
        {
          name: "instagram_get_insights",
          description: "Get metrics and insights for a specific Instagram post",
        },
        {
          name: "instagram_get_account_insights",
          description: "Get account-level metrics and statistics",
        },
        {
          name: "instagram_search_posts",
          description: "Search Instagram posts by text in captions",
        },
      ],
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
