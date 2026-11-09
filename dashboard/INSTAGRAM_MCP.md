# Instagram MCP Integration - Sweet Q

Integración completa de Instagram con ChatGPT mediante un servidor MCP privado. Permite que ChatGPT consulte publicaciones de Sweet Q, analice contenido, recupere estadísticas y ayude a planificar la estrategia de redes sociales.

## Características

### Herramientas MCP Disponibles

1. **`instagram_list_posts`** — Listar publicaciones
   - Paginación mediante cursores
   - Filtro por tipo de contenido (IMAGE, VIDEO, CAROUSEL_ALBUM, REELS)
   - Filtro por rango de fechas
   - Límite configurable (1-50)

2. **`instagram_get_post`** — Obtener una publicación específica
   - Incluye todos los campos disponibles
   - Recupera elementos de carruseles
   - Verifica pertenencia a cuenta autorizada

3. **`instagram_get_insights`** — Métricas de una publicación
   - Alcance, visualizaciones, reproducciones
   - Likes, comentarios, guardados, compartidos
   - Adaptación automática por tipo de contenido
   - Indica métricas no disponibles sin valores ficticios

4. **`instagram_get_account_insights`** — Estadísticas de la cuenta
   - Seguidores y métricas globales
   - Rangos temporales configurables (day, week, month)
   - Distingue estadísticas actuales de históricas

5. **`instagram_search_posts`** — Buscar por texto
   - Búsqueda textual en captions mediante MongoDB
   - Filtro combinado con tipo de contenido y fechas
   - Búsqueda limitada a nuestra cuenta

### Sincronización e Histórico

- **Importación**: Descargar histórico accesible de publicaciones
- **Upserts**: Almacenar sin duplicar, actualizar existentes
- **Sincronización por demanda**: Sincronizar publicaciones individuales
- **Estadísticas**: Snapshots de métricas con fecha de captura
- **Mantenimiento**: Limpieza de datos antiguos (opcional)

## Estructura

```
dashboard/app/
├── services/api/
│   ├── instagram/
│   │   ├── media.ts           # Funciones de API (list, get, insights)
│   │   ├── sync.ts            # Servicio de sincronización
│   │   ├── validators.ts      # Esquemas Zod para validación
│   │   └── __tests__/         # Tests unitarios
│   ├── instagramPosts.ts      # Servicio MongoDB para posts
│   └── factory.ts             # Factory actualizado con instagramPosts
│
├── models/
│   ├── instagram.ts           # Token de Instagram
│   └── instagramPost.ts       # Modelo StoredInstagramPost
│
├── (pages)/api/
│   ├── mcp/route.ts           # Endpoint MCP con todas las herramientas
│   └── instagram/sync/route.ts  # Endpoint privado de sincronización
│
└── types/
    └── instagram-post.d.ts    # Tipos TypeScript extendidos
```

## Variables de Entorno

```bash
# Instagram OAuth (requerido)
INSTAGRAM_CLIENT_ID=your_client_id
INSTAGRAM_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI=https://yourdomain.com/callback

# API endpoints (requerido)
API_INSTAGRAM=https://graph.instagram.com/v18.0
GRAPH_INSTAGRAM=https://graph.instagram.com/v18.0

# MCP Authentication (requerido)
MCP_READ_TOKEN=your_secure_bearer_token_here

# Sincronización (opcional pero recomendado)
INSTAGRAM_SYNC_ADMIN_TOKEN=your_admin_token_for_sync

# Base de datos (requerido)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/sweetq
```

## Instalación y Configuración

### 1. Autorizar Instagram

```bash
# Ir a la interfaz web de tu dashboard
# Navegar a Settings > Instagram > Authorize
# Seguir el flujo OAuth de Instagram
# Se guardará automáticamente el long-lived access token
```

### 2. Crear índices en MongoDB

```bash
# Los índices se crean automáticamente en la primera sincronización:
# - Índice único en `id`
# - Índice en `timestamp` (descendente)
# - Índice en `media_type`
# - Índice de texto en `caption`
# - Índice en `synced_at`
```

### 3. Sincronizar publicaciones iniciales

```bash
# Mediante el endpoint privado de sincronización
curl -X POST http://localhost:3000/api/instagram/sync \
  -H "Authorization: Bearer $INSTAGRAM_SYNC_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "import",
    "options": {
      "limit": 25,
      "maxPages": 10
    }
  }'
```

### 4. Configurar el MCP en ChatGPT

#### Opción A: MCP Inspector (Desarrollo)

```bash
# Descargar MCP Inspector
# En MCP Inspector, configurar nuevo servidor
# URL: http://localhost:3000/api/mcp
# Token: $MCP_READ_TOKEN
# Método: Bearer Token

# Probar herramientas directamente en la interfaz
```

#### Opción B: ChatGPT con MCP (Producción)

Para conectar a ChatGPT como plugin privado:

1. **Preparar OAuth 2.1**:
   - Discovery endpoint configurado
   - PKCE habilitado
   - Validación de tokens

2. **Registrar en ChatGPT**:
   - Ir a Settings > Integrations
   - Agregar servidor MCP privado
   - Proporcionar URL de descubrimiento
   - Completar autenticación OAuth

3. **Verificar conexión**:
   ```
   En ChatGPT: "Listar mis últimas publicaciones de Instagram"
   ChatGPT debería usar `instagram_list_posts` automáticamente
   ```

## Uso

### Desde MCP Inspector

```
Tool: instagram_list_posts
Input: {"limit": 10, "media_type": "REELS"}
```

### Desde ChatGPT

```
"Muéstrame mis últimos 5 reels y analiza su engagement"
"Busca publicaciones sobre 'conciertos' en nuestro Instagram"
"¿Cuál fue el reel con más visualizaciones en los últimos 30 días?"
"Planifica la estrategia de Instagram para el próximo mes"
```

### Desde cURL

```bash
# Listar posts
curl -X POST http://localhost:3000/api/mcp \
  -H "Authorization: Bearer $MCP_READ_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/call",
    "params": {
      "name": "instagram_list_posts",
      "arguments": {"limit": 10}
    }
  }'

# Buscar posts
curl -X POST http://localhost:3000/api/mcp \
  -H "Authorization: Bearer $MCP_READ_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/call",
    "params": {
      "name": "instagram_search_posts",
      "arguments": {"query": "concierto", "limit": 25}
    }
  }'
```

## Manejo de Errores

### Tokens

- **Token expirado**: Se auto-renueva automáticamente si es long-lived
- **Token inválido**: Requiere re-autorización en la interfaz
- **Permiso insuficiente**: Verificar permisos en Meta Business Suite

### API Instagram

- **401 Unauthorized**: Token inválido o expirado
- **403 Forbidden**: Permisos insuficientes en la cuenta
- **429 Too Many Requests**: Rate limit excedido (implementa backoff)
- **500 Server Error**: Error temporal de Instagram

### Insights

- **No disponibles**: Se devuelven vacíos sin error
- **Métricas específicas**: Instagram solo retorna las disponibles por tipo de post

## Seguridad

### Principios

- ✅ MCP privado con Bearer token
- ✅ Autenticación requerida para todas las operaciones
- ✅ Tokens nunca se devuelven a ChatGPT
- ✅ Lectura exclusiva (sin publicar)
- ✅ Límites de paginación y resultados
- ✅ Registro sin exposición de credenciales

### Antes de Producción

1. **Rotar tokens**
   ```bash
   # Generar nuevo MCP_READ_TOKEN
   openssl rand -base64 32
   
   # Generar nuevo INSTAGRAM_SYNC_ADMIN_TOKEN
   openssl rand -base64 32
   ```

2. **Configurar HTTPS**
   ```nginx
   # En nginx.conf
   server {
       listen 443 ssl http2;
       ssl_certificate /etc/ssl/certs/domain.crt;
       ssl_certificate_key /etc/ssl/private/domain.key;
       
       location /api/mcp {
           proxy_pass http://app:3000;
           proxy_set_header Authorization "";
       }
   }
   ```

3. **Limitar acceso**
   - Firewall: Permitir solo IPs conocidas de OpenAI
   - Rate limiting: Máximo de requests por IP/hora
   - Auditoría: Registrar todas las llamadas

4. **Validar permisos de Instagram**
   - Verificar `instagram_business_manage_insights` para estadísticas
   - Usar cuenta de servicio dedicada (no personal)
   - Auditar acceso regularmente en Meta

## Despliegue

### Docker

```dockerfile
# Dockerfile existente - no cambios necesarios
# La aplicación usa runtime: "nodejs" en el endpoint MCP
```

### Nginx

```nginx
location /api/mcp {
    proxy_pass http://app:3000;
    proxy_http_version 1.1;
    proxy_set_header Connection "upgrade";
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Timeout para sincronizaciones largas
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
}

location /api/instagram/sync {
    proxy_pass http://app:3000;
    # Permitir body más grande para operaciones de batch
    client_max_body_size 10M;
}
```

### Environment (.env.production)

```bash
# Copiar desde .env.local y actualizar para producción
INSTAGRAM_CLIENT_ID=production_client_id
INSTAGRAM_CLIENT_SECRET=production_client_secret
MCP_READ_TOKEN=production_mcp_token
INSTAGRAM_SYNC_ADMIN_TOKEN=production_sync_token
```

## Testing

```bash
# Ejecutar tests
pnpm test

# Tests incluidos:
# ✓ Validadores Zod (ListPostsInput, GetPostInput, etc.)
# ✓ Modelo InstagramPost (creación, mapeo de campos)
# ✓ Almacenamiento StoredInstagramPost

# Tests pendientes (requieren BD real o mocks de MongoDB):
# - instagramPostsSvc (findByCaption, upsert, etc.)
# - instagramSyncSvc (importFromAPI, syncPostById)
# - Endpoint MCP (autenticación, herramientas)
```

## Verificación Post-Despliegue

```bash
# 1. Verificar endpoint MCP
curl -X GET http://localhost:3000/api/mcp \
  -H "Authorization: Bearer $MCP_READ_TOKEN"
# Debería retornar discovery del MCP

# 2. Verificar sincronización
curl -X GET http://localhost:3000/api/instagram/sync \
  -H "Authorization: Bearer $INSTAGRAM_SYNC_ADMIN_TOKEN"
# Debería retornar estadísticas

# 3. Probar en MCP Inspector
# - Crear conexión
# - Listar herramientas disponibles
# - Ejecutar instagram_list_posts con limit=5

# 4. Verificar en ChatGPT (si está configurado)
# - Pedirle que liste publicaciones
# - Pedirle que busque contenido específico
# - Verificar que no expone tokens
```

## Maintenance

### Sincronización Regular

Configurar sincronización automática (opcional):

```bash
# Cron job para sincronización nocturna
0 2 * * * curl -X POST http://localhost:3000/api/instagram/sync \
  -H "Authorization: Bearer $INSTAGRAM_SYNC_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "import", "options": {"maxPages": 20}}'
```

### Limpiar datos antiguos

```bash
# Eliminar posts más antiguos de 90 días
curl -X POST http://localhost:3000/api/instagram/sync \
  -H "Authorization: Bearer $INSTAGRAM_SYNC_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "clear-old",
    "options": {"daysOld": 90}
  }'
```

## Solución de Problemas

### "No Instagram token found"

```
Causa: Instagram no fue autorizado
Solución: Ir a dashboard > Settings > Instagram > Authorize
```

### "instagram_search_posts devuelve vacío"

```
Causa: Las publicaciones no han sido sincronizadas
Solución: Ejecutar POST /api/instagram/sync con action=import
```

### "Token expirado"

```
Causa: El token actual ha expirado
Solución: Los long-lived tokens se auto-renuevan
         Si falla, re-autorizar en la interfaz
```

### Rate limit de Instagram (429)

```
Causa: Demasiadas requests en poco tiempo
Solución: El servicio implementa delays entre páginas
         Reducir maxPages en sincronización
         Esperar antes de reintentar
```

### HTTPS required (ChatGPT)

```
Causa: ChatGPT requiere HTTPS
Solución: Configurar certificado SSL en Nginx
         Usar ngrok o túnel si está en local
```

## Documentación Referencias

- [Instagram Graph API](https://developers.facebook.com/docs/instagram-graph-api)
- [Instagram Insights Metrics](https://developers.facebook.com/docs/instagram-api/reference/ig-media/insights)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [mcp-handler package](https://www.npmjs.com/package/mcp-handler)
- [ChatGPT MCP Integration](https://platform.openai.com/docs/guides/mcp)

## Cambios Realizados

### Archivos Nuevos
- `types/instagram-post.d.ts` — Tipos extendidos
- `models/instagramPost.ts` — Modelo MongoDB
- `services/api/instagramPosts.ts` — Servicio de posts
- `services/api/instagram/media.ts` — Funciones de API (extendido)
- `services/api/instagram/sync.ts` — Sincronización
- `services/api/instagram/validators.ts` — Validadores Zod
- `(pages)/api/instagram/sync/route.ts` — Endpoint de sincronización
- Tests en `__tests__/`

### Archivos Modificados
- `(pages)/api/mcp/route.ts` — Todas las herramientas MCP
- `services/api/factory.ts` — Registro de instagramPostsSvc

### Sin cambios
- Autenticación existente de Instagram (preservada)
- Modelos y servicios existentes (intactos)
- Configuración de Docker/Nginx (compatible)

## Próximos Pasos

1. **OAuth 2.1 completo** (antes de integración ChatGPT)
   - Implementar discovery endpoint
   - PKCE en token refresh
   - Validación de tokens en MCP

2. **Scheduled sync** (opcional)
   - Usar node-cron o similar
   - Sincronizar nuevas publicaciones automáticamente

3. **Webhook de Instagram** (opcional)
   - Recibir notificaciones en tiempo real
   - Sync inmediato de nuevas publicaciones

4. **Analytics dashboard**
   - Mostrar estadísticas en interfaz web
   - Gráficos de evolución de métricas
