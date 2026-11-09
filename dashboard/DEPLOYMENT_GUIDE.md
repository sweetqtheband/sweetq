# Instagram MCP Deployment Guide

## Resumen de Cambios Implementados

### ✅ Completado

#### 1. **Tipos TypeScript Extendidos**
   - Archivo: `/types/instagram-post.d.ts`
   - Cambios:
     - Tipos media: `IMAGE | VIDEO | CAROUSEL_ALBUM | REELS`
     - Interfaz `InstagramMediaChild` para carruseles
     - Interfaz `InstagramInsights` para métricas
     - Interfaz `StoredInstagramPost` para persistencia

#### 2. **Modelos MongoDB**
   - Nuevo: `/app/models/instagramPost.ts`
   - Almacena posts con campos completos: caption, media_type, timestamp, URL, children
   - Fechas automáticas: synced_at, created_at, updated_at

#### 3. **Servicios de API**
   - Extendido: `/app/services/api/instagram/media.ts`
     - `listInstagramPosts()` con filtros de tipo y rango de fechas
     - `getInstagramPost()` para posts individuales con carruseles
     - `getPostInsights()` con métricas adaptadas por tipo
     - `getAccountInsights()` para estadísticas de cuenta
     - `getAccountInfo()` para información de la cuenta
   
   - Nuevo: `/app/services/api/instagramPosts.ts`
     - Servicio MongoDB con métodos reutilizables
     - `findByCaption()` búsqueda de texto
     - `findByDateRange()` filtro temporal
     - `findByMediaType()` filtro por tipo
     - `upsert()` inserción/actualización sin duplicados
     - `ensureIndexes()` para optimización
     - `getRecent()` publicaciones recientes
   
   - Nuevo: `/app/services/api/instagram/sync.ts`
     - `importFromAPI()` sincronización con paginación
     - `syncPostById()` sincronización de post individual
     - `getStats()` estadísticas del almacenamiento
     - `clearOldData()` mantenimiento de datos antiguos

#### 4. **Herramientas MCP**
   - Archivo: `/app/(pages)/api/mcp/route.ts` (completamente reescrito)
   - 5 herramientas implementadas:
     1. `instagram_list_posts` - Listar con paginación y filtros
     2. `instagram_get_post` - Detalles de post
     3. `instagram_get_insights` - Métricas de post
     4. `instagram_get_account_insights` - Estadísticas de cuenta
     5. `instagram_search_posts` - Búsqueda por texto en MongoDB

#### 5. **Endpoint de Sincronización**
   - Nuevo: `/app/(pages)/api/instagram/sync/route.ts`
   - POST para operaciones:
     - `action: "import"` - Sincronizar histórico
     - `action: "sync-post"` - Sincronizar un post
     - `action: "stats"` - Ver estadísticas
     - `action: "clear-old"` - Limpiar datos antiguos
   - GET para ver estadísticas
   - Autenticación con Bearer token separado

#### 6. **Validadores Zod**
   - Nuevo: `/app/services/api/instagram/validators.ts`
   - Esquemas para cada herramienta MCP
   - Validación de rangos y tipos de entrada

#### 7. **Tests Unitarios**
   - Nuevos en `/__tests__/services/instagram/`
   - `validators.test.ts` - Tests de validadores Zod
   - `model.test.ts` - Tests del modelo MongoDB
   - Excluidos del build de TypeScript

#### 8. **Factory y Registros**
   - Actualizado: `/app/services/api/factory.ts`
   - Registrado servicio `instagramPostsSvc`

#### 9. **Documentación**
   - Nuevo: `/INSTAGRAM_MCP.md` (documentación completa)
   - Guías de instalación, uso, despliegue y solución de problemas

## Archivos Creados

```
dashboard/
├── app/
│   ├── models/
│   │   └── instagramPost.ts                    [NUEVO]
│   ├── services/api/
│   │   ├── instagramPosts.ts                   [NUEVO]
│   │   └── instagram/
│   │       ├── media.ts                        [MODIFICADO]
│   │       ├── sync.ts                         [NUEVO]
│   │       └── validators.ts                   [NUEVO]
│   └── (pages)/api/
│       ├── mcp/route.ts                        [MODIFICADO]
│       └── instagram/sync/route.ts             [NUEVO]
│
├── types/
│   └── instagram-post.d.ts                     [MODIFICADO]
│
├── __tests__/services/instagram/
│   ├── validators.test.ts                      [NUEVO]
│   └── model.test.ts                           [NUEVO]
│
├── INSTAGRAM_MCP.md                            [NUEVO]
└── tsconfig.json                               [MODIFICADO - excluir tests]
```

## Archivos Modificados

1. **types/instagram-post.d.ts**
   - Extendidos tipos y añadidas nuevas interfaces

2. **app/services/api/factory.ts**
   - Importado y registrado `instagramPostsSvc`

3. **app/services/api/instagram/media.ts**
   - Función `listInstagramPosts` mejorada con filtros
   - 3 nuevas funciones de API

4. **app/(pages)/api/mcp/route.ts**
   - Completamente reescrito con 5 herramientas
   - Validación con Zod
   - Mejor manejo de errores

5. **tsconfig.json**
   - Agregado `__tests__` a exclude

## Configuración Requerida

### Variables de Entorno

```bash
# Instagram OAuth (ya existentes)
INSTAGRAM_CLIENT_ID=<your_client_id>
INSTAGRAM_CLIENT_SECRET=<your_client_secret>
NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI=https://yourdomain.com/callback

# API Endpoints (ya existentes)
API_INSTAGRAM=https://graph.instagram.com/v18.0
GRAPH_INSTAGRAM=https://graph.instagram.com/v18.0

# MCP Authentication (REQUERIDO NUEVO)
MCP_READ_TOKEN=<generate_secure_token>

# Sincronización Admin (OPCIONAL PERO RECOMENDADO)
INSTAGRAM_SYNC_ADMIN_TOKEN=<generate_separate_token>
```

### Generar Tokens Seguros

```bash
# MCP_READ_TOKEN
openssl rand -base64 32

# INSTAGRAM_SYNC_ADMIN_TOKEN  
openssl rand -base64 32
```

## Instalación Post-Despliegue

### 1. Crear Índices en MongoDB

Los índices se crean automáticamente en la primera sincronización:

```bash
curl -X GET http://localhost:3000/api/instagram/sync \
  -H "Authorization: Bearer $INSTAGRAM_SYNC_ADMIN_TOKEN"
```

### 2. Sincronizar Histórico (Opcional)

```bash
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

### 3. Verificar con MCP Inspector

1. Descargar MCP Inspector
2. Configurar:
   - URL: `http://localhost:3000/api/mcp`
   - Token: `$MCP_READ_TOKEN`
   - Método: Bearer
3. Probar herramientas

## Verificación

### Build

```bash
cd dashboard
pnpm build
# Debe compilar sin errores
# Debe incluir /api/mcp y /api/instagram/sync
```

### Tests (Optional)

Los tests están configurados pero excluidos del build. Para ejecutarlos:

```bash
pnpm test  # Si está configurado Jest/Vitest
```

### Endpoints Funcionales

```bash
# MCP Discovery (sin autenticación, devuelve lista de herramientas)
curl http://localhost:3000/api/mcp

# Get Sync Status
curl -X GET http://localhost:3000/api/instagram/sync \
  -H "Authorization: Bearer $INSTAGRAM_SYNC_ADMIN_TOKEN"

# List Posts via MCP
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
```

## Integración con ChatGPT

### Requisitos Previos

- Certifi cado SSL válido (HTTPS)
- Token MCP válido en variables de entorno
- Instagram autorizado en el dashboard

### Pasos

1. **En ChatGPT**:
   - Settings → Integrations → MCP Servers
   - Agregar servidor privado
   - URL: `https://yourdomain.com/api/mcp`
   - Autenticación: Bearer Token
   - Token: `$MCP_READ_TOKEN`

2. **Verificar conexión**:
   - "Listar mis publicaciones"
   - "Buscar posts sobre conciertos"

3. **Usar en conversaciones**:
   - ChatGPT invocará automáticamente las herramientas
   - Analizará contenido y estrategia

## Limitaciones Conocidas

1. **Instagram API**
   - No expone búsqueda textual directa
   - Solución: Usar MongoDB para búsqueda (implementado)

2. **Insights**
   - Disponibilidad varía por tipo de post
   - Solución: API devuelve solo métricas disponibles

3. **Rate Limiting**
   - 200 requests por hora a Instagram Graph API
   - Solución: Implementar delays y respetar limits

4. **Webhooks**
   - No implementados en esta versión
   - Posible mejora futura

## Próximos Pasos Opcionales

1. **OAuth 2.1 Completo**
   - Discovery endpoint
   - PKCE en renovación de tokens

2. **Scheduled Sync**
   - Usar node-cron para sincronización automática

3. **Webhooks**
   - Notificaciones en tiempo real de nuevas publicaciones

4. **Analytics Dashboard**
   - Visualizaciones de metrics
   - Gráficos de tendencias

## Troubleshooting

Si hay errores durante el build o despliegue:

1. **Verificar Node.js version**
   ```bash
   node --version  # Debe ser >= 22.0.0
   ```

2. **Limpiar dependencias**
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

3. **Verificar types**
   ```bash
   pnpm build --verbose
   ```

4. **Ver logs**
   ```bash
   docker logs -f sweetq_app
   ```

## Soporte

Para preguntas sobre:
- **MCP**: Ver documentación en `/INSTAGRAM_MCP.md`
- **Instagram API**: Consultar Meta Business Suite docs
- **TypeScript/Node.js**: Ver tsconfig.json y package.json
