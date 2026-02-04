#!/bin/bash
# Authentication & Database Setup Script

cd "$(dirname "$0")/.." || exit 1

echo ""
echo "🔧 Boomi Assistant - Authentication Setup"
echo "=========================================="
echo ""

# Load environment variables from .env.local
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

# Check if POSTGRES_URL is set
if [ -z "$POSTGRES_URL" ]; then
  echo "❌ POSTGRES_URL not found in environment"
  echo ""
  echo "📝 Please add to .env.local:"
  echo ""
  echo "POSTGRES_URL=postgresql://neondb_owner:npg_VIXqfN8P5wEx@ep-quiet-star-ah0pr94c-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
  echo ""
  echo "Then run this script again."
  exit 1
else
  echo "✅ POSTGRES_URL found"
fi

# Check if AUTH_SECRET is set
if [ -z "$AUTH_SECRET" ]; then
  echo "🔑 AUTH_SECRET not found, generating new secret..."
  
  # Try multiple methods to generate a random secret
  if command -v openssl &> /dev/null; then
    AUTH_SECRET=$(openssl rand -base64 32)
  elif command -v node &> /dev/null; then
    AUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
  else
    # Fallback to a simple random string
    AUTH_SECRET=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
  fi
  
  echo "AUTH_SECRET=$AUTH_SECRET" >> .env.local
  echo "✅ AUTH_SECRET generated and added to .env.local"
  echo "   Value (masked): ${AUTH_SECRET:0:10}...${AUTH_SECRET: -4}"
else
  echo "✅ AUTH_SECRET already set"
  echo "   Value (masked): ${AUTH_SECRET:0:10}...${AUTH_SECRET: -4}"
fi

echo ""
echo "📦 Running database migrations..."
echo ""

# Run migrations
pnpm tsx lib/db/migrate.ts

# Check if successful
if [ $? -eq 0 ]; then
  echo ""
  echo "=========================================="
  echo "✅ Database setup complete!"
  echo "=========================================="
  echo ""
  echo "🎉 Authentication is ready!"
  echo ""
  echo "📋 Summary:"
  echo "  • Database: Connected to Neon"
  echo "  • Tables: User, Chat, Message_v2, Vote_v2, Document, Suggestion, Stream"
  echo "  • Auth: NextAuth configured with email/password + guest mode"
  echo ""
  echo "🚀 Next steps:"
  echo ""
  echo "1. Start the dev server:"
  echo "   pnpm dev"
  echo ""
  echo "2. Test authentication:"
  echo "   • Guest mode: http://localhost:3000"
  echo "   • Register: http://localhost:3000/register"
  echo "   • Login: http://localhost:3000/login"
  echo ""
  echo "3. Update Vercel environment variables:"
  echo "   • Add POSTGRES_URL to Vercel"
  echo "   • Add AUTH_SECRET to Vercel"
  echo "   • Redeploy: vercel --prod"
  echo ""
  echo "📚 Full guide: docs/AUTHENTICATION_SETUP.md"
  echo ""
else
  echo ""
  echo "❌ Migration failed. Check the error above."
  echo ""
  echo "Common fixes:"
  echo "  • Verify POSTGRES_URL is correct"
  echo "  • Check Neon database is accessible"
  echo "  • Ensure network connection is active"
  echo ""
  exit 1
fi

