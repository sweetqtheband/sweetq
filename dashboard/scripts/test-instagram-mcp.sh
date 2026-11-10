#!/bin/bash

# Instagram MCP Test Script
# Usage: ./test-instagram-mcp.sh [token] [base_url]

MCP_TOKEN="${1:-$MCP_READ_TOKEN}"
SYNC_TOKEN="${2:-$INSTAGRAM_SYNC_ADMIN_TOKEN}"
BASE_URL="${3:-http://localhost:3000}"

if [ -z "$MCP_TOKEN" ]; then
  echo "❌ Error: MCP_READ_TOKEN not provided"
  echo "Usage: ./test-instagram-mcp.sh <mcp_token> [sync_token] [base_url]"
  exit 1
fi

echo "🧪 Testing Instagram MCP Integration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Base URL: $BASE_URL"
echo "MCP Token: ${MCP_TOKEN:0:10}..."
echo ""

# Test 1: Check MCP endpoint exists
echo "1️⃣ Checking MCP endpoint..."
if curl -s "$BASE_URL/api/mcp" -H "Authorization: Bearer $MCP_TOKEN" > /dev/null 2>&1; then
  echo "✅ MCP endpoint accessible"
else
  echo "❌ MCP endpoint not accessible"
  exit 1
fi

# Test 2: List posts
echo ""
echo "2️⃣ Testing instagram_list_posts..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/mcp" \
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
  }')

if echo "$RESPONSE" | grep -q "posts"; then
  echo "✅ instagram_list_posts working"
  echo "Response preview:"
  echo "$RESPONSE" | head -c 200
  echo "..."
else
  echo "⚠️ instagram_list_posts returned:"
  echo "$RESPONSE" | head -c 300
fi

# Test 3: Sync status (if admin token provided)
if [ -n "$SYNC_TOKEN" ]; then
  echo ""
  echo "3️⃣ Checking sync status..."
  SYNC_RESPONSE=$(curl -s -X GET "$BASE_URL/api/instagram/sync" \
    -H "Authorization: Bearer $SYNC_TOKEN")
  
  if echo "$SYNC_RESPONSE" | grep -q "stats"; then
    echo "✅ Sync endpoint accessible"
    echo "Response:"
    echo "$SYNC_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SYNC_RESPONSE"
  else
    echo "⚠️ Sync endpoint returned:"
    echo "$SYNC_RESPONSE"
  fi
else
  echo ""
  echo "3️⃣ Skipping sync tests (no INSTAGRAM_SYNC_ADMIN_TOKEN provided)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Test complete!"
