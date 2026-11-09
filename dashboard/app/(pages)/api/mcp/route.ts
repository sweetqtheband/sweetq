import { timingSafeEqual } from "node:crypto";
import type { AuthInfo } from "@modelcontextprotocol/server";
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod";
import { getCollection } from "@/app/services/api/_db";
import { FactorySvc } from "@/app/services/api/factory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createMcpHandler((server) => {
  server.registerTool(
    "instagram_list_posts",
    {
      title: "Publicaciones de Sweet Q",
      description:
        "Consulta publicaciones y reels de Sweet Q. " +
        "Úsala para analizar textos, fechas y contenido " +
        "del Instagram de la banda.",
      inputSchema: z.object({
        limit: z.number().int().min(1).max(50).default(25),
        cursor: z.string().optional(),
      }),
    },
    async ({ limit, cursor }) => {
      try {
        const collection = await getCollection("instagram");
        const instagramSvc = FactorySvc("instagram", collection);

        const tokenData = await instagramSvc.getAccessToken(instagramSvc);
        if (!tokenData) {
          throw new Error("No Instagram token found");
        }

        const data = await instagramSvc.listInstagramPosts(
          tokenData.long_live_access_token,
          limit,
          cursor
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data),
            },
          ],
        };
      } catch (error) {
        console.error(
          "[MCP] Error consultando Instagram:",
          error instanceof Error ? error.message : "Error desconocido"
        );

        return {
          isError: true,
          content: [
            {
              type: "text",
              text: "Error al consultar Instagram. Revisa la consola de Next.js.",
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
