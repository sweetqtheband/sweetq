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
del dashboard y confirma el acceso. La disponibilidad de conectores
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

Los seguidores y seguidos con `extracted: true` y `deleted: true` se excluyen
de las consultas MCP y de las listas, métricas e importaciones del dashboard.
Los demás registros siguen siendo visibles según los filtros aplicados.

1. `instagram_list_posts` — Listar publicaciones
2. `instagram_get_post` — Detalles de un post
3. `instagram_get_insights` — Métricas de post
4. `instagram_get_account_insights` — Estadísticas de cuenta
5. `instagram_search_posts` — Buscar en MongoDB
6. `instagram_get_pending_update_users` — Devuelve `{ followers, followings }` con los
   documentos de ambas colecciones que tienen `extracted: false`, independientemente
   de `short_name`. No requiere parámetros ni token de Instagram; sí requiere
   autenticación MCP.
7. `instagram_update_pending_users` — Recibe ese mismo objeto `{ followers, followings }`,
   consulta los perfiles actuales en Instagram con Puppeteer y ejecuta la actualización
   de perfil e imagen existente. Los documentos se identifican por `_id` y se
   vuelven a comprobar en MongoDB; los que ya no están pendientes se omiten.
   Devuelve el estado `updated`, `skipped` o `error` por usuario y marca la
   respuesta MCP como error si falla alguno. Marca `extracted: true` tras una
   actualización correcta, pero no genera ni actualiza `short_name`.
   La operación es secuencial y puede tardar según el número de usuarios.
8. `instagram_get_unnamed_users` — Devuelve `{ followers, followings }` con los
   documentos cuyo `username` y `full_name` son cadenas no vacías (con algún
   carácter distinto de espacio), `extracted: true` y `short_name` `null`, vacío
   o inexistente. No requiere parámetros ni token de Instagram; sí requiere
   autenticación MCP.
9. `instagram_update_users` — Recibe `{ followers?, followings? }`, con uno o ambos
   arrays de objetos. Cada usuario debe incluir `_id` y al menos un campo para
   actualizar. Escribe los campos recibidos sin reemplazar los demás, acepta valores
   `null` y no crea usuarios. Devuelve por colección el estado `updated`,
   `not_found` o `error`; cualquier usuario no actualizado marca la respuesta MCP
   como error. Los `_id` duplicados en una misma colección y los nombres de campo
   con `.` o prefijo `$` se rechazan antes de escribir.
10. `instagram_get_filter_definitions` — Describe los filtros compartidos con el
    dashboard y sus valores fijos. `instagram_search_filter_options` busca IDs
    en los catálogos: `type` es `country`, `state`, `city` o `tag`; acepta
    `query` y, respectivamente para provincias o ciudades, `country_id` o
    `state_id`. Busca nombres en español e inglés. Ante varias coincidencias,
    comprueba el país o provincia antes de elegir.
11. `instagram_get_followers` y `instagram_get_followings` — Aceptan `filters`
    con `country`, `state`, `city`, `tags`, `withoutTags`, `treatment` y `show`,
    y opcionalmente `query` (texto literal en nombre o usuario). Los filtros se
    combinan con AND; las etiquetas incluidas o excluidas coinciden con cualquiera
    de las indicadas. `show` es `"0"` (activos, predeterminado), `"1"`
    (unfollow) o `"2"` (todos). `treatment` admite `1` (persona) y `2`
    (colectivo). Usa los IDs obtenidos de los catálogos, no sus nombres.

Las búsquedas de opciones y usuarios devuelven `{ items, has_more, next_cursor }`;
aceptan `limit` (1–100, predeterminado 50) y `cursor`. Repite la llamada con los
mismos filtros y el `next_cursor` hasta que `has_more` sea `false`. Las páginas
se ordenan por `_id`; no son una instantánea si los datos cambian durante el
recorrido. Los usuarios se devuelven como documentos de MongoDB, sin las
relaciones ni los mensajes calculados del dashboard.

Por ejemplo, busca `type: "country", query: "España"`; usa el `id` devuelto en
`type: "state", query: "Madrid", country_id: "<id>"`; después consulta los
seguidores con `filters: { country: "<id país>", state: "<id provincia>" }`.

12. `instagram_get_users_to_catalog` — Prepara el análisis por ChatGPT sin usar
    Gemini ni modificar usuarios. Con `action: "list"` y `origin: "followers"`
    o `"followings"` devuelve candidatos paginados (`limit` 1–25, por defecto 5,
    y `cursor`): tienen conversación, etiqueta `Responde`, no tienen `catalogued`
    y su provincia no existe o es `NaN`. Con `action: "messages"`, `origin` y
    `user_id` devuelve los mensajes de texto enviados por ese usuario, en orden
    cronológico, tras comprobar que sigue siendo candidato. Se consultan los
    mensajes existentes mediante el servicio de Instagram, incluida su caché;
    no se envían mensajes ni se registra el análisis automáticamente.
    ChatGPT puede buscar los IDs en los catálogos y proponer los cambios para
    `instagram_update_users`, incluido `catalogued: 1` cuando corresponda.
    `country`, `state` y `city` se guardan como números y las etiquetas como
    arrays de IDs de texto. Conservar las etiquetas previas al añadir `fan` o
    `superfan`; no asignar ninguna si no se ha determinado provincia o ciudad.
    No deducir residencia por una visita o un festival. Revisar y confirmar
    antes de guardar; no marcar como catalogado si falló la consulta o falta
    información suficiente para analizar. Esos mensajes pueden incluir
    información privada y no están paginados.

### 🔐 Seguridad

✅ Bearer token authentication
⚠️ El MCP puede modificar datos mediante `instagram_update_pending_users` e
`instagram_update_users`.
Por decisión de configuración, tanto `MCP_READ_TOKEN` como los tokens OAuth actuales
con scope `instagram:read` pueden invocar esta operación de escritura; protege y
revoca esas credenciales en consecuencia. No se publican contenidos.
⚠️ Esas mismas credenciales permiten consultar mensajes privados mediante
`instagram_get_users_to_catalog`; ChatGPT recibirá los textos solicitados.
✅ Validación con Zod
✅ Rate limiting
✅ Logs sin credenciales

La conexión real con ChatGPT debe comprobarse después del despliegue y de
verificar la configuración de Nginx y las variables de producción.
