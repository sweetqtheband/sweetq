import { createServer } from "node:http";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { getOAuthProvider, oauthMetadata } from "./runtime";

let internalServer: Promise<{ port: number; secret: string }> | undefined;

function getInternalServer(): Promise<{ port: number; secret: string }> {
  if (!internalServer) {
    internalServer = new Promise((resolve, reject) => {
      const secret = randomBytes(32).toString("hex");
      const callback = getOAuthProvider().callback();
      const server = createServer((req, res) => {
        const received = req.headers["x-sweetq-internal"];
        const actual = Buffer.from(typeof received === "string" ? received : "");
        const expected = Buffer.from(secret);
        if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
          res.writeHead(403).end();
          return;
        }
        delete req.headers["x-sweetq-internal"];
        callback(req, res);
      });
      server.once("error", reject);
      server.listen(0, "127.0.0.1", () => {
        const address = server.address();
        if (!address || typeof address === "string") {
          reject(new Error("Could not start OAuth provider"));
          return;
        }
        server.unref();
        resolve({ port: address.port, secret });
      });
    });
    internalServer.catch(() => { internalServer = undefined; });
  }
  return internalServer;
}

export async function oauthHandler(request: Request): Promise<Response> {
  try {
    const issuer = new URL(oauthMetadata().issuer);
    const path = new URL(request.url);
    const { port, secret } = await getInternalServer();
    const headers = new Headers(request.headers);
    headers.set("host", issuer.host);
    headers.set("x-forwarded-host", issuer.host);
    headers.set("x-forwarded-proto", "https");
    headers.set("x-sweetq-internal", secret);
    headers.delete("forwarded");
    headers.delete("content-length");
    const body = request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();
    return await fetch(`http://127.0.0.1:${port}${path.pathname}${path.search}`, {
      method: request.method, headers, body, redirect: "manual",
    });
  } catch (error) {
    console.error("[MCP OAuth] Request failed", error instanceof Error ? error.message : "unknown error");
    return Response.json({ error: "server_error" }, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
