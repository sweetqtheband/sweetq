This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

---

## 🎸 Instagram MCP Integration (NEW)

El servidor OAuth autohospedado utiliza la base MongoDB existente y requiere
la configuración siguiente. Sin ella OAuth permanece desactivado; el acceso
mediante `MCP_READ_TOKEN` sigue disponible.

### OAuth para ChatGPT

En GitHub, abre **Settings → Environments → production** y configura:

| Tipo | Nombre | Valor |
| --- | --- | --- |
| Variable | `MCP_OAUTH_ISSUER` | `https://srv659934.hstgr.cloud` |
| Secret | `MCP_OAUTH_COOKIE_KEY` | Clave aleatoria generada una vez |
| Secret | `MCP_OAUTH_JWKS` | JSON de clave privada generado una vez |

Para generar los dos secretos en tu ordenador, desde la raíz de este repositorio:

```bash
OAUTH_FILE=$(mktemp -t sweetq-oauth.XXXXXX)
node dashboard/scripts/create-mcp-oauth-config.mjs "$OAUTH_FILE" https://srv659934.hstgr.cloud
open -e "$OAUTH_FILE"
```

Copia cada valor al secret correspondiente, sin el nombre ni el signo `=`;
para el JSON elimina también las comillas simples exteriores. No compartas
estos valores ni los incluyas en Git. Una vez guardados en GitHub, cierra el
editor y elimina el archivo temporal con `rm "$OAUTH_FILE"`. No vuelvas a
generarlos en cada despliegue: cambiar las claves afecta a sesiones y tokens.

Al subir los cambios a `main`, GitHub Actions desplegará automáticamente la
configuración junto con la base existente y `MCP_READ_TOKEN`. Para aplicar un
cambio posterior de variables, ejecuta manualmente la acción **Actualizar .env
y reiniciar contenedores**; reconstruirá la imagen y reiniciará Next.js. Si
falta alguna de las tres variables OAuth, el flujo fallará antes de cambiar el
servidor; si faltan las tres, OAuth permanece desactivado.

El Dockerfile copia `.env.production` en la imagen: protege el acceso a la
imagen y al archivo del VPS.

Nginx debe servir HTTPS y enviar `Authorization`, y las rutas
`/.well-known/`, `/api/oauth/`, `/jwks` y `/api/mcp` a Next.js. Retira
cualquier bloqueo temporal de `/api/oauth/authorize` o `/api/mcp`. Comprueba:

```bash
curl -i https://srv659934.hstgr.cloud/.well-known/oauth-protected-resource/api/mcp
curl -i https://srv659934.hstgr.cloud/.well-known/oauth-authorization-server
curl -i https://srv659934.hstgr.cloud/api/mcp
```

Las primeras dos respuestas deben ser 200 con JSON; la última debe ser 401
con `WWW-Authenticate` que apunta a la metadata. Después crea la conexión
MCP en ChatGPT con `https://srv659934.hstgr.cloud/api/mcp` y selecciona
OAuth si se solicita. Inicia sesión con un usuario **administrador existente**
del dashboard y confirma el acceso de lectura. La disponibilidad de conectores
privados depende de la cuenta de ChatGPT.

El cliente ChatGPT se identifica con CIMD; solo se aceptan sus documentos
publicados en `chatgpt.com`. Se exige PKCE S256 y se comprueban expiración,
audiencia y scope de los tokens persistidos para el issuer configurado. No
hay una integración ChatGPT real verificada hasta probarla tras el despliegue.

Para probar el intercambio completo con el build de producción de Next.js,
utiliza una instancia MongoDB local aislada sin autenticación y ejecuta desde
`dashboard`:

```bash
npm run build
OAUTH_TEST_MONGO_URI=mongodb://127.0.0.1:37139 node --test __tests__/oauth-production.test.cjs
```

La prueba crea y elimina una base y un usuario de prueba: no apuntes
`OAUTH_TEST_MONGO_URI` a la base de producción. Simula los documentos y
claves del cliente ChatGPT; no sustituye la prueba con ChatGPT real.

### ✨ What's New

La aplicación ahora incluye una integración completa con Instagram mediante un servidor MCP privado que permite a ChatGPT consultar publicaciones, analizar estadísticas y ayudar a planificar la estrategia de redes sociales.

### 🚀 Quick Start

```bash
# 1. Generar tokens
MCP_READ_TOKEN=$(openssl rand -base64 32)
INSTAGRAM_SYNC_ADMIN_TOKEN=$(openssl rand -base64 32)

# 2. Agregar a .env.local
echo "MCP_READ_TOKEN=$MCP_READ_TOKEN" >> .env.local
echo "INSTAGRAM_SYNC_ADMIN_TOKEN=$INSTAGRAM_SYNC_ADMIN_TOKEN" >> .env.local

# 3. Compilar
pnpm build

# 4. Probar
./scripts/test-instagram-mcp.sh $MCP_READ_TOKEN
```

### 📚 Documentación

- **[INSTAGRAM_MCP_SETUP.md](./INSTAGRAM_MCP_SETUP.md)** — Setup en 5 minutos
- **[INSTAGRAM_MCP.md](./INSTAGRAM_MCP.md)** — Guía completa
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** — Producción

### 🔧 Herramientas MCP Disponibles

1. `instagram_list_posts` — Listar publicaciones
2. `instagram_get_post` — Detalles de un post
3. `instagram_get_insights` — Métricas de post
4. `instagram_get_account_insights` — Estadísticas de cuenta
5. `instagram_search_posts` — Buscar en MongoDB

### 🔐 Seguridad

✅ Bearer token authentication
✅ Lectura exclusiva (sin publicación)
✅ Validación con Zod
✅ Rate limiting
✅ Logs sin credenciales

La conexión real con ChatGPT debe comprobarse después del despliegue y de
verificar la configuración de Nginx y las variables de producción.
