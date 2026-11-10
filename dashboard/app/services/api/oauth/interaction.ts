import { fetchNodeRequestHandler } from "node-mock-http";
import { getOAuthProvider, oauthMetadata } from "./runtime";
import { MCP_OAUTH_SCOPE } from "./provider";
import { getDb } from "@/app/services/api/_db";
import { userSvc } from "@/app/services/api/user";
import { USER_PROFILES } from "@/app/constants";

const securityHeaders = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "no-store",
  "content-security-policy": "default-src 'none'; style-src 'self'; img-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "same-origin",
};

export async function interactionHandler(request: Request): Promise<Response> {
  try {
    const provider = getOAuthProvider();
    const { issuer, resource } = oauthMetadata();
    if (request.method === "POST" && request.headers.get("origin") !== issuer) {
      return new Response("Invalid origin", { status: 403, headers: securityHeaders });
    }
    if (request.method === "POST" &&
        !request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) {
      return new Response("Invalid content type", { status: 400, headers: securityHeaders });
    }
    const form = request.method === "POST" ? await request.formData() : null;
    const url = new URL(request.url);
    const base = new URL(issuer);
    const headers = new Headers(request.headers);
    headers.set("host", base.host);
    headers.set("x-forwarded-host", base.host);
    headers.set("x-forwarded-proto", "https");
    headers.delete("forwarded");
    return await fetchNodeRequestHandler(async (req, res) => {
      try {
        const details = await provider.interactionDetails(req, res);
        const requestedUid = new URL(request.url).pathname.split("/").pop();
        if (details.uid !== requestedUid) {
          res.writeHead(400, securityHeaders).end("Invalid interaction");
          return;
        }
        if (request.method === "GET") {
          if (details.prompt.name !== "login" && details.prompt.name !== "consent") {
            res.writeHead(400, securityHeaders).end("Interacción no admitida");
            return;
          }
          const login = details.prompt.name === "login";
          const fields = login
            ? `<div class="cds--form-item cds--text-input-wrapper"><label class="cds--label" for="username">Usuario</label><div class="cds--text-input__field-outer-wrapper"><div class="cds--text-input__field-wrapper"><input class="cds--text-input cds--text-input--md cds--layout--size-md" id="username" name="username" placeholder="Usuario" autocomplete="username" required></div></div></div>
              <div class="cds--form-item cds--text-input-wrapper cds--password-input-wrapper"><label class="cds--label" for="password">Contraseña</label><div class="cds--text-input__field-outer-wrapper"><div class="cds--text-input__field-wrapper"><input class="cds--text-input cds--password-input cds--text-input--md cds--layout--size-md" id="password" name="password" type="password" placeholder="Contraseña" autocomplete="current-password" required></div></div></div>`
            : "<p>Autorizar a ChatGPT a consultar Instagram en modo lectura.</p>";
          res.writeHead(200, securityHeaders).end(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Sweet Q - autorización</title><link rel="stylesheet" href="/api/oauth/styles"><link rel="stylesheet" href="/login.css"></head><body class="oauth-login"><main class="login-wrapper"><form class="login" method="post"><header><img src="/logo.svg" alt="Sweet Q" width="200" height="80"></header><section>${fields}</section><footer><button class="cds--btn cds--btn--secondary" type="submit">${login ? "Iniciar sesión" : "Autorizar"}</button></footer></form></main></body></html>`);
          return;
        }
        if (details.prompt.name === "login") {
          const username = form?.get("username");
          const password = form?.get("password");
          if (typeof username !== "string" || typeof password !== "string" ||
              !username || !password || username.length > 200 || password.length > 1024) {
            res.writeHead(400, securityHeaders).end("Credenciales inválidas");
            return;
          }
          const db = await getDb();
          const attempts = db.collection<{ _id: string; count: number; expiresAt: Date }>("mcp_oauth_login_attempts");
          await attempts.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
          const bucket = Math.floor(Date.now() / 900000);
          const record = await attempts.findOneAndUpdate(
            { _id: `global:${bucket}` },
            { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((bucket + 2) * 900000) } },
            { upsert: true, returnDocument: "after" },
          );
          if (!record || record.count > 30) {
            res.writeHead(429, securityHeaders).end("Demasiados intentos. Prueba más tarde.");
            return;
          }
          const user = await userSvc.validatePassword({ username }, password);
          if (!user || (await userSvc.parseUser(user)).profile !== USER_PROFILES.ADMIN) {
            res.writeHead(401, securityHeaders).end("Credenciales inválidas");
            return;
          }
          await provider.interactionFinished(req, res, {
            login: { accountId: user._id.toHexString() },
          }, { mergeWithLastSubmission: false });
          return;
        }
        if (details.prompt.name === "consent" && details.session?.accountId &&
            typeof details.params.client_id === "string") {
          const grant = new provider.Grant({
            accountId: details.session.accountId,
            clientId: details.params.client_id,
          });
          grant.addOIDCScope(["openid", MCP_OAUTH_SCOPE]);
          grant.addResourceScope(resource, MCP_OAUTH_SCOPE);
          await provider.interactionFinished(req, res, { consent: { grantId: await grant.save() } });
          return;
        }
        res.writeHead(400, securityHeaders).end("Interacción no admitida");
      } catch (error) {
        console.error("[MCP OAuth] Interaction failed", error instanceof Error ? error.message : "unknown error");
        if (!res.headersSent) res.writeHead(400, securityHeaders);
        res.end("No se pudo completar la autorización");
      }
    }, `${base.origin}${url.pathname}${url.search}`, { method: request.method, headers });
  } catch (error) {
    console.error("[MCP OAuth] Interaction unavailable", error instanceof Error ? error.message : "unknown error");
    return new Response("Servicio OAuth no disponible", { status: 503, headers: securityHeaders });
  }
}
