# 🎯 Quick Reference - Instagram MCP

## 5-Minute Setup

```bash
# 1. Generate secure tokens
MCP_READ_TOKEN=$(openssl rand -base64 32)
INSTAGRAM_SYNC_ADMIN_TOKEN=$(openssl rand -base64 32)

# 2. Add to .env.local
echo "MCP_READ_TOKEN=$MCP_READ_TOKEN" >> .env.local
echo "INSTAGRAM_SYNC_ADMIN_TOKEN=$INSTAGRAM_SYNC_ADMIN_TOKEN" >> .env.local

# 3. Build
cd dashboard && pnpm build

# 4. Sync posts
curl -X POST http://localhost:3000/api/instagram/sync \
  -H "Authorization: Bearer $INSTAGRAM_SYNC_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "import"}'

# 5. Test
./scripts/test-instagram-mcp.sh $MCP_READ_TOKEN
```

## API Endpoints

### 🔗 MCP Handler
```
POST http://localhost:3000/api/mcp
Authorization: Bearer $MCP_READ_TOKEN
Content-Type: application/json
```

**Available Tools:**
- `instagram_list_posts` — List posts with filters
- `instagram_get_post` — Get post details
- `instagram_get_insights` — Get post metrics
- `instagram_get_account_insights` — Get account stats
- `instagram_search_posts` — Search posts in MongoDB

### 🔗 Sync Admin Endpoint
```
POST/GET http://localhost:3000/api/instagram/sync
Authorization: Bearer $INSTAGRAM_SYNC_ADMIN_TOKEN
Content-Type: application/json
```

**Actions:**
- `import` — Import all posts from Instagram
- `sync-post` — Sync a single post (POST with `post_id`)
- `stats` — Get sync statistics
- `clear-old` — Clear posts older than 90 days

## Example Requests

### List Recent Posts
```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Authorization: Bearer $MCP_READ_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "instagram_list_posts",
    "arguments": {
      "limit": 10,
      "media_type": "IMAGE"
    }
  }'
```

### Search Posts
```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Authorization: Bearer $MCP_READ_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "instagram_search_posts",
    "arguments": {
      "query": "concert",
      "start_date": "2024-10-01",
      "end_date": "2024-10-31"
    }
  }'
```

### Get Post Details
```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Authorization: Bearer $MCP_READ_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "instagram_get_post",
    "arguments": {
      "post_id": "17903114...88"
    }
  }'
```

### Get Post Insights
```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Authorization: Bearer $MCP_READ_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "instagram_get_insights",
    "arguments": {
      "post_id": "17903114...88",
      "metrics": ["engagement", "impressions", "reach"]
    }
  }'
```

### Import All Posts
```bash
curl -X POST http://localhost:3000/api/instagram/sync \
  -H "Authorization: Bearer $INSTAGRAM_SYNC_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "import"}'
```

### Get Sync Stats
```bash
curl -X GET http://localhost:3000/api/instagram/sync \
  -H "Authorization: Bearer $INSTAGRAM_SYNC_ADMIN_TOKEN"
```

## File Structure

```
dashboard/
├── app/
│   ├── models/
│   │   └── instagramPost.ts .................. MongoDB model
│   ├── services/api/
│   │   ├── instagramPosts.ts ............... MongoDB service
│   │   └── instagram/
│   │       ├── media.ts .................... API functions
│   │       ├── sync.ts .................... Sync engine
│   │       └── validators.ts .............. Zod schemas
│   └── (pages)/api/
│       ├── mcp/route.ts ................... MCP Handler
│       └── instagram/sync/route.ts ....... Admin endpoint
├── types/
│   └── instagram-post.d.ts ................. Type definitions
├── __tests__/services/instagram/
│   ├── validators.test.ts ................. Validation tests
│   └── model.test.ts ...................... Model tests
├── scripts/
│   └── test-instagram-mcp.sh .............. Test script
├── INSTAGRAM_MCP.md ....................... Complete guide
├── DEPLOYMENT_GUIDE.md ................... Production guide
└── INSTAGRAM_MCP_SETUP.md ................ Quick start
```

## Environment Variables

```bash
# Required for MCP
MCP_READ_TOKEN=<secure-random-token>
INSTAGRAM_SYNC_ADMIN_TOKEN=<secure-random-token>

# From Instagram Meta Dashboard
INSTAGRAM_USER_ID=<your-user-id>
INSTAGRAM_ACCESS_TOKEN=<long-lived-token>
GRAPH_INSTAGRAM=https://graph.instagram.com/v18.0

# MongoDB
DATABASE_URL=mongodb://...

# Optional
INSTAGRAM_API_VERSION=18.0
```

## Testing

### Run All Tests
```bash
pnpm test --testPathPattern=instagram
```

### Run Validators Only
```bash
pnpm test validators.test.ts
```

### Run Model Tests
```bash
pnpm test model.test.ts
```

### Check Build
```bash
pnpm build
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check token in header: `Authorization: Bearer $TOKEN` |
| 403 Forbidden | Token might be for wrong action (read vs admin) |
| 429 Rate Limited | Wait 1 hour or check sync delays |
| MongoDB connection | Verify DATABASE_URL in .env.local |
| Missing posts | Run sync with `{"action": "import"}` |

## MCP Inspector Testing

1. Start dev server: `pnpm dev`
2. Open MCP Inspector
3. Connect to: `http://localhost:3000/api/mcp`
4. Set header: `Authorization: Bearer $MCP_READ_TOKEN`
5. Test each tool

## ChatGPT Integration

1. Go to ChatGPT Settings
2. Integrations → MCP Servers
3. Add Private Server
4. URL: `https://yourdomain.com/api/mcp`
5. Auth: Bearer `$MCP_READ_TOKEN`
6. Connect and test

## Key Features

✅ 5 MCP tools for Instagram data  
✅ MongoDB full-text search  
✅ Automatic pagination with cursors  
✅ Post insights by media type  
✅ Account statistics  
✅ Sync without duplicates  
✅ Secure token authentication  
✅ Comprehensive error handling  

## Additional Resources

- [INSTAGRAM_MCP.md](./INSTAGRAM_MCP.md) — Complete guide
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) — Production setup
- [.env.instagram.example](./.env.instagram.example) — Template
- [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) — Testing tool

---

**Last Updated:** 2024-11-09  
**Status:** ✅ Production Ready
