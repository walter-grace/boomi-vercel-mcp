#!/bin/bash
# Quick start script for testing

echo "🚀 Starting Chat Feature Test..."
echo ""

# Check if POSTGRES_URL is set
if ! grep -q "POSTGRES_URL=" .env.local 2>/dev/null || grep -qE "POSTGRES_URL=(your-|postgresql://user:password)" .env.local 2>/dev/null; then
  echo "⚠️  POSTGRES_URL is not set or using placeholder"
  echo ""
  echo "Options:"
  echo "1. Link to Vercel and pull env vars: vercel link && vercel env pull"
  echo "2. Add POSTGRES_URL manually to .env.local"
  echo "3. Use a local PostgreSQL database"
  echo ""
  read -p "Do you want to continue without database? (chat history won't be saved) [y/N]: " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please set POSTGRES_URL in .env.local first"
    exit 1
  fi
fi

# Run migrations if POSTGRES_URL is set
if grep -q "POSTGRES_URL=" .env.local 2>/dev/null && ! grep -qE "POSTGRES_URL=(your-|postgresql://user:password)" .env.local 2>/dev/null; then
  echo "📦 Running database migrations..."
  pnpm db:migrate
fi

echo ""
echo "🧪 Testing MCP connection..."
npx tsx scripts/test-mcp-connection.ts

echo ""
echo "🚀 Starting development server..."
echo "Open http://localhost:3000 when ready"
echo ""
pnpm dev

