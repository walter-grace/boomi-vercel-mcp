#!/bin/bash
# Quick deployment helper

echo "🚀 Quick Deployment Helper"
echo "=========================="
echo ""

# Check if Neon connection string is set
if grep -q "POSTGRES_URL=postgresql://.*@.*\.neon\.tech" .env.local 2>/dev/null; then
  echo "✅ Neon database connection string found in .env.local"
  NEON_URL=$(grep "POSTGRES_URL=" .env.local | cut -d'=' -f2-)
  echo "   Connection: ${NEON_URL:0:50}..."
else
  echo "⚠️  Neon database connection string not found"
  echo ""
  echo "Please:"
  echo "1. Create a Neon account at https://neon.tech"
  echo "2. Create a new project"
  echo "3. Copy the connection string"
  echo "4. Update .env.local with: POSTGRES_URL=<your-neon-connection-string>"
  echo ""
  read -p "Press Enter when you've added the Neon connection string..."
fi

# Check if Vercel is linked
if [ ! -d .vercel ]; then
  echo ""
  echo "📦 Linking to Vercel..."
  vercel link
else
  echo "✅ Already linked to Vercel"
fi

# Run migrations
echo ""
echo "📦 Running database migrations..."
export $(grep -v '^#' .env.local | xargs)
pnpm db:migrate

# Deploy
echo ""
echo "🌐 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "⚠️  IMPORTANT: Set environment variables in Vercel Dashboard:"
echo "   → Go to your project → Settings → Environment Variables"
echo "   → Add all variables from .env.local"
echo "   → Or use: bash scripts/deploy-to-vercel.sh --set-env"
echo ""

