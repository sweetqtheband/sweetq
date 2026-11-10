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

### 📊 Archivos Modificados

- Nuevos: 14 archivos
- Modificados: 2 archivos
- Documentación: 4 archivos
- Tests: 2 archivos

### 🎯 Status

✅ Build: Compilación exitosa
✅ Endpoints: /api/mcp y /api/instagram/sync
✅ Tests: 20+ casos
✅ Documentación: Completa
✅ Listo: Producción
