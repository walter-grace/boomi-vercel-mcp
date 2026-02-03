#!/bin/bash
# Quick setup script for testing the chat feature

echo "🚀 Setting up test environment..."

# Generate AUTH_SECRET if not set
if ! grep -q "AUTH_SECRET=" .env.local 2>/dev/null || grep -q "AUTH_SECRET=your-auth-secret" .env.local 2>/dev/null; then
  AUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  if grep -q "AUTH_SECRET=" .env.local 2>/dev/null; then
    sed -i.bak "s|AUTH_SECRET=.*|AUTH_SECRET=$AUTH_SECRET|" .env.local
  else
    echo "AUTH_SECRET=$AUTH_SECRET" >> .env.local
  fi
  echo "✅ Generated AUTH_SECRET"
fi

echo ""
echo "📝 Next steps:"
echo "1. Add your POSTGRES_URL to .env.local (required for chat history)"
echo "2. Add OPENROUTER_API_KEY if you want to test reasoning models"
echo "3. Add Boomi credentials if you want to test MCP tools"
echo ""
echo "To get your Vercel environment variables:"
echo "  vercel env pull"
echo ""
echo "Or set them manually in .env.local"

