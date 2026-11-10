import { timingSafeEqual } from "node:crypto";
import type { AuthInfo } from "@modelcontextprotocol/server";
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod";
import type { InstagramPost } from "@/types/instagram-post";
import { getCollection } from "@/app/services/api/_db";
import { FactorySvc } from "@/app/services/api/factory";
import {
  ListPostsInput,
  GetPostInput,
  GetInsightsInput,
  GetAccountInsightsInput,
  SearchPostsInput,
} from "@/app/services/api/instagram/validators";
import {
  listInstagramPosts,
  getInstagramPost,
  getPostInsights,
  getAccountInsights,
} from "@/app/services/api/instagram/media";
import { instagramSyncSvc } from "@/app/services/api/instagram/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createMcpHandler((server) => {
  /**
   * List Instagram posts with pagination and optional filtering
   */
  server.registerTool(
    "instagram_list_posts",
    {
      title: "Publicaciones de Sweet Q",
      description:
        "Consulta publicaciones y reels de Sweet Q. " +
        "Úsala para analizar textos, fechas y contenido del Instagram de la banda. " +
        "Soporta paginación mediante cursor y filtrado por tipo de contenido.",
      inputSchema: ListPostsInput,
    },
    async (input) => {
      try {
        const parsed = ListPostsInput.parse(input);
        const collection = await getCollection("instagram");
        const instagramSvc = FactorySvc("instagram", collection);

        const tokenData = await instagramSvc.getAccessToken(instagramSvc);
        if (!tokenData) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: "No Instagram token found. Please authorize Instagram first.",
              },
            ],
          };
        }

        if (!tokenData.user_id) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: "No Instagram User ID found. Please re-authorize.",
              },
            ],
          };
        }

        // Filter posts by date range if provided
        let posts = await instagramSvc.listInstagramPosts(
          tokenData.long_live_access_token,
          tokenData.user_id,
          parsed.limit,
          parsed.cursor,
          parsed.media_type
        );

        // Apply date filtering if specified
        if (parsed.start_date || parsed.end_date) {
          const startDate = parsed.start_date ? new Date(parsed.start_date) : null;
          const endDate = parsed.end_date ? new Date(parsed.end_date) : null;

          posts.posts = posts.posts.filter((post: InstagramPost) => {
            const postDate = new Date(post.timestamp);
            if (startDate && postDate < startDate) return false;
            if (endDate && postDate > endDate) return false;
            return true;
          });
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(posts, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error("[MCP] instagram_list_posts error:", error);

        return {
          isError: true,
          content: [
            {
              type: "text",
              text:
                error instanceof Error
                  ? `Error: ${error.message}`
                  : "Error listing posts. Check server logs.",
            },
          ],
        };
      }
    }
  );

  /**
   * Get a specific Instagram post by ID
   */
  server.registerTool(
    "instagram_get_post",
    {
      title: "Obtener una publicación",
      description:
        "Recupera los detalles completos de una publicación específica de Instagram. " +
        "Incluye información de carruseles si aplica.",
      inputSchema: GetPostInput,
    },
    async (input) => {
      try {
        const parsed = GetPostInput.parse(input);
        const collection = await getCollection("instagram");
        const instagramSvc = FactorySvc("instagram", collection);

        const tokenData = await instagramSvc.getAccessToken(instagramSvc);
        if (!tokenData) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: "No Instagram token found.",
              },
            ],
          };
        }

        const post = await getInstagramPost(tokenData.long_live_access_token, parsed.post_id);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(post, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error("[MCP] instagram_get_post error:", error);

        return {
          isError: true,
          content: [
            {
              type: "text",
              text:
                error instanceof Error
                  ? `Error: ${error.message}`
                  : "Error retrieving post. Check server logs.",
            },
          ],
        };
      }
    }
  );

  /**
   * Get insights for a specific post
   */
  server.registerTool(
    "instagram_get_insights",
    {
      title: "Métricas de una publicación",
      description:
        "Recupera las métricas disponibles de una publicación específica. " +
        "Las métricas varían según el tipo de contenido (imagen, video, reel). " +
        "Incluye alcance, visualizaciones, likes, comentarios, etc.",
      inputSchema: GetInsightsInput,
    },
    async (input) => {
      try {
        const parsed = GetInsightsInput.parse(input);
        const collection = await getCollection("instagram");
        const instagramSvc = FactorySvc("instagram", collection);

        const tokenData = await instagramSvc.getAccessToken(instagramSvc);
        if (!tokenData) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: "No Instagram token found.",
              },
            ],
          };
        }

        const insights = await getPostInsights(tokenData.long_live_access_token, parsed.post_id);

        if (insights.error) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `Could not retrieve insights: ${insights.error}. This post may not have insights available.`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  post_id: parsed.post_id,
                  available_metrics: insights.available,
                  data: insights.data,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        console.error("[MCP] instagram_get_insights error:", error);

        return {
          isError: true,
          content: [
            {
              type: "text",
              text:
                error instanceof Error
                  ? `Error: ${error.message}`
                  : "Error retrieving insights.",
            },
          ],
        };
      }
    }
  );

  /**
   * Get account-level insights
   */
  server.registerTool(
    "instagram_get_account_insights",
    {
      title: "Métricas de la cuenta",
      description:
        "Recupera las estadísticas generales de la cuenta de Instagram de Sweet Q. " +
        "Incluye seguidores, alcance, visualizaciones de perfil y otros datos globales.",
      inputSchema: GetAccountInsightsInput,
    },
    async (input) => {
      try {
        const parsed = GetAccountInsightsInput.parse(input);
        const collection = await getCollection("instagram");
        const instagramSvc = FactorySvc("instagram", collection);

        const tokenData = await instagramSvc.getAccessToken(instagramSvc);
        if (!tokenData || !tokenData.user_id) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: "No Instagram token or user ID found.",
              },
            ],
          };
        }

        const insights = await getAccountInsights(
          tokenData.long_live_access_token,
          tokenData.user_id,
          parsed.period
        );

        if (insights.error) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `Could not retrieve account insights: ${insights.error}. Make sure the account has the required permissions.`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  period: parsed.period,
                  available_metrics: insights.available,
                  data: insights.data,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        console.error("[MCP] instagram_get_account_insights error:", error);

        return {
          isError: true,
          content: [
            {
              type: "text",
              text:
                error instanceof Error
                  ? `Error: ${error.message}`
                  : "Error retrieving account insights.",
            },
          ],
        };
      }
    }
  );

  /**
   * Search posts by caption
   */
  server.registerTool(
    "instagram_search_posts",
    {
      title: "Buscar publicaciones",
      description:
        "Busca publicaciones por palabras clave en sus captions. " +
        "Permite combinar búsqueda con filtros de tipo de contenido. " +
        "Nota: Los resultados provienen de publicaciones ya sincronizadas en la base de datos.",
      inputSchema: SearchPostsInput,
    },
    async (input) => {
      try {
        const parsed = SearchPostsInput.parse(input);
        const collection = await getCollection("instagramPosts");
        const postsSvc = FactorySvc("instagramPosts", collection);

        let results = await postsSvc.findByCaption(parsed.query, parsed.limit, parsed.skip);

        // Additional media type filter if specified
        if (parsed.media_type) {
          results.posts = results.posts.filter((post: any) => post.media_type === parsed.media_type);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  query: parsed.query,
                  limit: parsed.limit,
                  skip: parsed.skip,
                  total: results.total,
                  results: results.posts,
                  hasMore: results.hasMore,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        console.error("[MCP] instagram_search_posts error:", error);

        return {
          isError: true,
          content: [
            {
              type: "text",
              text:
                error instanceof Error
                  ? `Error: ${error.message}`
                  : "Error searching posts. Make sure posts are synced.",
            },
          ],
        };
      }
    }
  );
});

const verifyToken = async (
  _request: Request,
  bearerToken?: string
): Promise<AuthInfo | undefined> => {
  const secret = process.env.MCP_READ_TOKEN;

  if (!secret || !bearerToken) return undefined;

  const expected = Buffer.from(secret);
  const received = Buffer.from(bearerToken);

  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    return undefined;
  }

  return {
    token: bearerToken,
    clientId: "sweet-q-private",
    scopes: ["instagram:read"],
  };
};

const protectedHandler = withMcpAuth(
  handler,
  verifyToken,
  {
    required: true,
    requiredScopes: ["instagram:read"],
  }
);

export {
  protectedHandler as GET,
  protectedHandler as POST,
};
