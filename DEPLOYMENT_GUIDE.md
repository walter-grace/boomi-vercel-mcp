# Deployment Guide - Vercel + Neon Database

## Step 1: Set Up Neon Database

### 1.1 Create Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up or log in
3. Create a new project

### 1.2 Get Connection String
1. In your Neon dashboard, go to your project
2. Click on "Connection Details"
3. Copy the connection string (it looks like: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`)

### 1.3 Test Connection Locally
Add the Neon connection string to your `.env.local`:
```bash
POSTGRES_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

## Step 2: Prepare for Deployment

### 2.1 Commit Your Changes
```bash
git add .
git commit -m "Add MCP integration and OpenRouter support"
```

### 2.2 Push to GitHub
```bash
git push origin main
```

## Step 3: Deploy to Vercel

### 3.1 Link Project to Vercel
```bash
vercel link
```
- Select your Vercel account
- Create a new project or link to existing
- Follow the prompts

### 3.2 Set Environment Variables on Vercel

You can set them via CLI or Dashboard:

**Via CLI:**
```bash
vercel env add POSTGRES_URL
vercel env add AUTH_SECRET
vercel env add OPENROUTER_API_KEY
vercel env add BOOMI_ACCOUNT_ID
vercel env add BOOMI_USERNAME
vercel env add BOOMI_API_TOKEN
vercel env add BOOMI_PROFILE_NAME
```

**Via Dashboard:**
1. Go to your Vercel project
2. Settings → Environment Variables
3. Add each variable for Production, Preview, and Development

### 3.3 Deploy
```bash
vercel --prod
```

## Step 4: Run Database Migrations

After deployment, run migrations on your Neon database:

```bash
# Set the Neon connection string
export POSTGRES_URL="your-neon-connection-string"

# Run migrations
pnpm db:migrate
```

Or use Vercel's CLI to run migrations:
```bash
vercel env pull  # Get production env vars
pnpm db:migrate  # Run migrations locally with production DB
```

## Step 5: Verify Deployment

1. Visit your Vercel deployment URL
2. Test the chat feature
3. Verify MCP tools are working
4. Test with OpenRouter reasoning model

## Environment Variables Checklist

Make sure these are set in Vercel:

- ✅ `POSTGRES_URL` - Neon database connection string
- ✅ `AUTH_SECRET` - Authentication secret
- ✅ `OPENROUTER_API_KEY` - For reasoning models
- ✅ `BOOMI_ACCOUNT_ID` - Boomi integration
- ✅ `BOOMI_USERNAME` - Boomi integration
- ✅ `BOOMI_API_TOKEN` - Boomi integration
- ✅ `BOOMI_PROFILE_NAME` - Boomi integration
- ⚠️ `BOOMI_MCP_SERVER_URL` - Optional (defaults to Replit server)
- ⚠️ `AI_GATEWAY_API_KEY` - Optional (for non-Vercel deployments)
- ⚠️ `REDIS_URL` - Optional (for resumable streams)

## Troubleshooting

### Database Connection Issues
- Verify POSTGRES_URL is correct
- Check Neon database is running
- Ensure SSL mode is set: `?sslmode=require`

### MCP Tools Not Working
- Check MCP server is accessible from Vercel
- Verify environment variables are set
- Check Vercel function logs

### Build Errors
- Check Next.js build logs in Vercel dashboard
- Verify all dependencies are in package.json
- Check for TypeScript errors

