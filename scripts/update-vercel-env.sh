#!/bin/bash
# Script to update Vercel environment variables for authentication

cd "$(dirname "$0")/.." || exit 1

echo ""
echo "🔧 Vercel Environment Variables Setup"
echo "======================================"
echo ""

# Load environment variables from .env.local
if [ ! -f .env.local ]; then
  echo "❌ .env.local file not found"
  echo "   Run: ./scripts/setup-auth.sh first"
  exit 1
fi

export $(cat .env.local | grep -v '^#' | xargs)

# Check if variables are set
if [ -z "$POSTGRES_URL" ]; then
  echo "❌ POSTGRES_URL not found in .env.local"
  exit 1
fi

if [ -z "$AUTH_SECRET" ]; then
  echo "❌ AUTH_SECRET not found in .env.local"
  exit 1
fi

echo "✅ Found required environment variables in .env.local"
echo ""
echo "📝 The following variables will be added to Vercel:"
echo "   • POSTGRES_URL"
echo "   • AUTH_SECRET"
echo "   • BOOMI_ACCOUNT_ID"
echo "   • BOOMI_USERNAME"
echo "   • BOOMI_API_TOKEN"
echo "   • BOOMI_PROFILE_NAME"
echo "   • OPENROUTER_API_KEY"
echo ""
echo "⚠️  Note: These will be added to Production, Preview, and Development"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Aborted"
  exit 1
fi

echo ""
echo "🔄 Adding environment variables to Vercel..."
echo ""

# Function to add environment variable
add_env_var() {
  local var_name=$1
  local var_value=$2
  
  if [ -z "$var_value" ]; then
    echo "⏭️  Skipping $var_name (not set)"
    return
  fi
  
  echo "Adding $var_name..."
  
  # Remove existing variable first (ignore errors)
  vercel env rm "$var_name" production --yes 2>/dev/null || true
  vercel env rm "$var_name" preview --yes 2>/dev/null || true
  vercel env rm "$var_name" development --yes 2>/dev/null || true
  
  # Add new variable
  echo "$var_value" | vercel env add "$var_name" production --sensitive
  echo "$var_value" | vercel env add "$var_name" preview --sensitive
  echo "$var_value" | vercel env add "$var_name" development --sensitive
  
  echo "✅ $var_name added"
  echo ""
}

# Add each environment variable
add_env_var "POSTGRES_URL" "$POSTGRES_URL"
add_env_var "AUTH_SECRET" "$AUTH_SECRET"
add_env_var "BOOMI_ACCOUNT_ID" "$BOOMI_ACCOUNT_ID"
add_env_var "BOOMI_USERNAME" "$BOOMI_USERNAME"
add_env_var "BOOMI_API_TOKEN" "$BOOMI_API_TOKEN"
add_env_var "BOOMI_PROFILE_NAME" "$BOOMI_PROFILE_NAME"
add_env_var "OPENROUTER_API_KEY" "$OPENROUTER_API_KEY"
add_env_var "OPENAI_API_KEY" "$OPENAI_API_KEY"

echo ""
echo "======================================"
echo "✅ Vercel environment variables updated!"
echo "======================================"
echo ""
echo "🚀 Next step: Deploy to production"
echo ""
echo "   vercel --prod"
echo ""
echo "📝 After deployment, test at:"
echo "   https://your-app.vercel.app/login"
echo ""

