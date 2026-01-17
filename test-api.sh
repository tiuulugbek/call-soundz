#!/bin/bash

# API Test Script

echo "=========================================="
echo "PBX System - API Test"
echo "=========================================="
echo ""

BASE_URL="http://localhost:3005"

# Health check
echo "1. Health Check..."
HEALTH=$(curl -s "$BASE_URL/health")
if echo "$HEALTH" | grep -q "ok"; then
    echo "✓ Health check passed"
    echo "  Response: $HEALTH"
else
    echo "✗ Health check failed"
    echo "  Response: $HEALTH"
    exit 1
fi

echo ""

# Login
echo "2. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo "✓ Login successful"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "  Token: ${TOKEN:0:50}..."
else
    echo "✗ Login failed"
    echo "  Response: $LOGIN_RESPONSE"
    exit 1
fi

echo ""

# Get extensions
echo "3. Testing Extensions API..."
EXTENSIONS=$(curl -s "$BASE_URL/api/v1/extensions" \
  -H "Authorization: Bearer $TOKEN")

if echo "$EXTENSIONS" | grep -q "success"; then
    echo "✓ Extensions API working"
    COUNT=$(echo "$EXTENSIONS" | grep -o '"data":\[.*\]' | grep -o '{' | wc -l)
    echo "  Extensions count: $COUNT"
else
    echo "✗ Extensions API failed"
    echo "  Response: $EXTENSIONS"
fi

echo ""

# Get stats
echo "4. Testing Statistics API..."
STATS=$(curl -s "$BASE_URL/api/v1/stats/dashboard" \
  -H "Authorization: Bearer $TOKEN")

if echo "$STATS" | grep -q "success"; then
    echo "✓ Statistics API working"
    echo "  Response: $(echo "$STATS" | head -c 200)..."
else
    echo "✗ Statistics API failed"
    echo "  Response: $STATS"
fi

echo ""
echo "=========================================="
echo "API Tests Completed"
echo "=========================================="
