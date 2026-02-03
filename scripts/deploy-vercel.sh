#!/bin/bash
# Deploy to Vercel with new GitHub repository

set -e

echo "🚀 Vercel Deployment"
echo "===================="
echo ""
echo "Repository: https://github.com/walter-grace/vercel-boomi-chat"
echo ""

# Remove old Vercel link if exists
if [ -d .vercel ]; then
  echo "⚠️  Removing old Vercel link..."
  rm -rf .vercel
fi

# Link to Vercel
echo "📦 Linking project to Vercel..."
echo ""
echo "When prompted:"
echo "  - Select 'Set up and deploy'"
echo "  - Choose your Vercel account"
echo "  - Project name: vercel-boomi-chat (or your choice)"
echo "  - Link to existing project? No (create new)"
echo ""

vercel link

echo ""
echo "✅ Project linked to Vercel!"
echo ""
echo "📝 Next: Set environment variables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "You can set them via:"
echo "  1. Vercel Dashboard (recommended)"
echo "     → Go to your project → Settings → Environment Variables"
echo ""
echo "  2. CLI (run this script with --set-env)"
echo ""

if [ "$1" == "--set-env" ]; then
  echo "Setting environment variables..."
  if [ -f .env.local ]; then
    source .env.local
    
    [ -n "$POSTGRES_URL" ] && echo "$POSTGRES_URL" | vercel env add POSTGRES_URL production
    [ -n "$AUTH_SECRET" ] && echo "$AUTH_SECRET" | vercel env add AUTH_SECRET production
    [ -n "$OPENROUTER_API_KEY" ] && echo "$OPENROUTER_API_KEY" | vercel env add OPENROUTER_API_KEY production
    [ -n "$BOOMI_ACCOUNT_ID" ] && echo "$BOOMI_ACCOUNT_ID" | vercel env add BOOMI_ACCOUNT_ID production
    [ -n "$BOOMI_USERNAME" ] && echo "$BOOMI_USERNAME" | vercel env add BOOMI_USERNAME production
    [ -n "$BOOMI_API_TOKEN" ] && echo "$BOOMI_API_TOKEN" | vercel env add BOOMI_API_TOKEN production
    [ -n "$BOOMI_PROFILE_NAME" ] && echo "$BOOMI_PROFILE_NAME" | vercel env add BOOMI_PROFILE_NAME production
    
    echo "✅ Environment variables set!"
  fi
fi

echo ""
echo "🌐 Deploying to production..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Checklist:"
echo "  ✅ Code pushed to GitHub"
echo "  ✅ Linked to Vercel"
echo "  ⚠️  Set environment variables in Vercel Dashboard"
echo "  ⚠️  Set up Neon database and add POSTGRES_URL"
echo "  ⚠️  Run database migrations after first deployment"
echo ""

