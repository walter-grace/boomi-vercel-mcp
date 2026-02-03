#!/bin/bash
# Deployment script for Vercel + Neon

set -e

echo "🚀 Vercel Deployment Script"
echo "============================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "❌ Vercel CLI not found. Installing..."
  npm install -g vercel
fi

# Check if git repo is initialized
if [ ! -d .git ]; then
  echo "⚠️  Git repository not initialized"
  echo "Initializing git repository..."
  git init
  git add .
  git commit -m "Initial commit: AI Chatbot with MCP integration"
fi

# Check if linked to Vercel
if [ ! -d .vercel ]; then
  echo "📦 Linking project to Vercel..."
  vercel link
else
  echo "✅ Project already linked to Vercel"
fi

echo ""
echo "📝 Environment Variables Setup"
echo "=============================="
echo ""
echo "You need to set these environment variables in Vercel:"
echo ""
echo "Required:"
echo "  - POSTGRES_URL (from Neon database)"
echo "  - AUTH_SECRET"
echo "  - OPENROUTER_API_KEY"
echo "  - BOOMI_ACCOUNT_ID"
echo "  - BOOMI_USERNAME"
echo "  - BOOMI_API_TOKEN"
echo "  - BOOMI_PROFILE_NAME"
echo ""
echo "Options:"
echo "  1. Set via Vercel Dashboard (recommended)"
echo "  2. Set via CLI (run this script with --set-env flag)"
echo ""

if [ "$1" == "--set-env" ]; then
  echo "Setting environment variables via CLI..."
  echo ""
  
  # Read from .env.local
  if [ -f .env.local ]; then
    source .env.local
    
    echo "Setting POSTGRES_URL..."
    echo "$POSTGRES_URL" | vercel env add POSTGRES_URL production
    
    echo "Setting AUTH_SECRET..."
    echo "$AUTH_SECRET" | vercel env add AUTH_SECRET production
    
    echo "Setting OPENROUTER_API_KEY..."
    echo "$OPENROUTER_API_KEY" | vercel env add OPENROUTER_API_KEY production
    
    echo "Setting BOOMI_ACCOUNT_ID..."
    echo "$BOOMI_ACCOUNT_ID" | vercel env add BOOMI_ACCOUNT_ID production
    
    echo "Setting BOOMI_USERNAME..."
    echo "$BOOMI_USERNAME" | vercel env add BOOMI_USERNAME production
    
    echo "Setting BOOMI_API_TOKEN..."
    echo "$BOOMI_API_TOKEN" | vercel env add BOOMI_API_TOKEN production
    
    echo "Setting BOOMI_PROFILE_NAME..."
    echo "$BOOMI_PROFILE_NAME" | vercel env add BOOMI_PROFILE_NAME production
    
    echo ""
    echo "✅ Environment variables set!"
  else
    echo "❌ .env.local not found. Please create it first."
    exit 1
  fi
fi

echo ""
echo "🌐 Deploying to Vercel..."
echo ""

# Deploy to production
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Run database migrations: pnpm db:migrate (with Neon POSTGRES_URL)"
echo "2. Visit your Vercel deployment URL"
echo "3. Test the chat feature and MCP tools"
echo ""

