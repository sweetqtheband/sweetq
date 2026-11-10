# 🎸 Instagram MCP Setup - Sweet Q

## Quick Start

Esta es una guía rápida para poner en funcionamiento la integración Instagram MCP. Para documentación detallada, ver [`INSTAGRAM_MCP.md`](./INSTAGRAM_MCP.md) y [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md).

## 1️⃣ Generar Tokens

```bash
# Generar MCP_READ_TOKEN (para ChatGPT/MCP Inspector)
echo "MCP_READ_TOKEN=$(openssl rand -base64 32)" >> .env.local

# Generar INSTAGRAM_SYNC_ADMIN_TOKEN (para sincronización)
echo "INSTAGRAM_SYNC_ADMIN_TOKEN=$(openssl rand -base64 32)" >> .env.local
```

## 2️⃣ Verificar Compilación

```bash
cd dashboard
pnpm build
# Debe mostrar: ✓ Compiled successfully
```

## 3️⃣ Iniciar Aplicación

```bash
# Desarrollo
pnpm dev

# Producción
pnpm start
```

## 4️⃣ Probar MCP

### Opción A: MCP Inspector (Desarrollo)

1. Descargar [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
2. Configurar nueva conexión:
   - URL: `http://localhost:3000/api/mcp`
   - Token: Valor de `MCP_READ_TOKEN`
   - Método: Bearer
3. Testear herramientas en la UI

### Opción B: cURL

```bash
MCP_TOKEN=$(cat .env.local | grep MCP_READ_TOKEN | cut -d'=' -f2)

curl -X POST http://localhost:3000/api/mcp \
  -H "Authorization: Bearer $MCP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "instagram_list_posts",
      "arguments": {"limit": 5}
    }
  }' | jq .
```

### Opción C: Script

```bash
./scripts/test-instagram-mcp.sh $MCP_TOKEN $SYNC_TOKEN
```

## 5️⃣ Sincronizar Publicaciones (Opcional)

```bash
SYNC_TOKEN=$(cat .env.local | grep INSTAGRAM_SYNC_ADMIN_TOKEN | cut -d'=' -f2)

# Importar histórico
curl -X POST http://localhost:3000/api/instagram/sync \
  -H "Authorization: Bearer $SYNC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "import",
    "options": {
      "limit": 25,
      "maxPages": 10
    }
  }' | jq .

# Ver estadísticas
curl http://localhost:3000/api/instagram/sync \
  -H "Authorization: Bearer $SYNC_TOKEN" | jq .
```

## 6️⃣ Conectar a ChatGPT (Producción)

1. Obtener certificado HTTPS válido
2. En ChatGPT Settings → Integrations:
   - Agregar MCP Server
   - URL: `https://yourdomain.com/api/mcp`
   - Token: `MCP_READ_TOKEN`
3. Pedir a ChatGPT: _"Listar mis publicaciones de Instagram"_

## 📊 Herramientas Disponibles

| Herramienta | Descripción |
|---|---|
| `instagram_list_posts` | Listar con filtros y paginación |
| `instagram_get_post` | Detalles de un post |
| `instagram_get_insights` | Métricas de post |
| `instagram_get_account_insights` | Estadísticas de cuenta |
| `instagram_search_posts` | Buscar en captions |

## ✅ Verificación

Después de desplegar, verificar:

- [ ] `pnpm build` sin errores
- [ ] Endpoints accesibles: `/api/mcp`, `/api/instagram/sync`
- [ ] Tokens en `.env.local` y `.env.production`
- [ ] Instagram autorizado en dashboard
- [ ] Prueba con MCP Inspector o cURL OK
- [ ] MongoDB con colecciones: `instagram`, `instagramPosts`

## 🔧 Solucionar Problemas

| Problema | Solución |
|---|---|
| "No Instagram token found" | Autorizar en Dashboard > Settings > Instagram |
| instagram_search_posts vacío | Ejecutar sync: `/api/instagram/sync` con action=import |
| 401 Unauthorized | Verificar token en Authorization header |
| Build error | Ejecutar `rm -rf node_modules && pnpm install` |

## 📚 Documentación

- [`INSTAGRAM_MCP.md`](./INSTAGRAM_MCP.md) — Guía completa de características
- [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) — Despliegue en producción

## 🆘 Soporte

Para problemas específicos:
1. Ver logs: `docker logs -f sweetq_app`
2. Revisar documentación en `/INSTAGRAM_MCP.md`
3. Verificar Meta Business Suite para permisos
4. Comprobar Instagram API version en `.env`
