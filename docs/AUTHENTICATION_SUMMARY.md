# Authentication System - Quick Reference

## ✅ Status: Fully Configured and Tested

### What's Working

✅ **Database Connection**
- Neon PostgreSQL database connected
- All 7 tables created and verified:
  - `User` - User accounts
  - `Chat` - Chat sessions
  - `Message_v2` - Chat messages
  - `Vote_v2` - Message votes
  - `Document` - Artifacts/documents
  - `Suggestion` - Document suggestions
  - `Stream` - Streaming sessions

✅ **Authentication System**
- NextAuth configured with email/password
- Guest mode enabled for anonymous users
- Password hashing with bcrypt (10 rounds)
- Session management with HTTP-only cookies
- All tests passed

✅ **Local Development**
- `.env.local` configured with:
  - `POSTGRES_URL` ✅
  - `AUTH_SECRET` ✅
  - Boomi credentials ✅
  - OpenRouter API key ✅

---

## How It Works

### User Types

1. **Guest Users** (Default)
   - Automatically created when visiting the chat
   - Format: `guest-1234567890`
   - Temporary session via cookies
   - Full access to chat and Boomi tools
   - Chat history saved to guest account

2. **Registered Users**
   - Create account at `/register`
   - Login at `/login`
   - Permanent chat history
   - Multi-device sync
   - Can make chats public/private

### Authentication Flow

```
User visits homepage
     ↓
Guest session created automatically
     ↓
User can chat immediately
     ↓
Optional: Register/Login for permanent account
     ↓
Chat history persists across devices
```

### Chat Integration

**Yes, chat works fully with authentication!**

- ✅ Every chat is linked to a user (guest or registered)
- ✅ Chat history saved to database
- ✅ Messages persist across sessions
- ✅ Boomi MCP tools work for all users
- ✅ Sidebar shows all user's chats
- ✅ Public/private chat visibility
- ✅ Message voting (thumbs up/down)
- ✅ Document/artifact creation per user

---

## Local Testing

### Test Guest Mode
```bash
# Start dev server
pnpm dev

# Visit http://localhost:3000
# Chat immediately - guest account created automatically
```

### Test Registration
```bash
# Visit http://localhost:3000/register
# Enter email and password
# Create account
# Start chatting with permanent account
```

### Test Login
```bash
# Visit http://localhost:3000/login
# Enter registered email/password
# Login and see previous chat history
```

### Test Authentication System
```bash
# Run automated tests
pnpm tsx scripts/test-auth.ts

# Expected output: All tests pass ✅
```

---

## Vercel Deployment

### Step 1: Add Environment Variables

#### Option A: Manual (Vercel Dashboard)
1. Go to: https://vercel.com/waltgraces-projects/ai-chatbot/settings/environment-variables
2. Add for Production, Preview, Development:
   - `POSTGRES_URL` (from `.env.local`)
   - `AUTH_SECRET` (from `.env.local`)
   - `BOOMI_ACCOUNT_ID` (from `.env.local`)
   - `BOOMI_USERNAME` (from `.env.local`)
   - `BOOMI_API_TOKEN` (from `.env.local`)
   - `BOOMI_PROFILE_NAME` (from `.env.local`)
   - `OPENROUTER_API_KEY` (from `.env.local`)

#### Option B: Automated Script
```bash
# Run the update script
./scripts/update-vercel-env.sh

# Follow prompts to add all variables
```

### Step 2: Deploy to Production
```bash
vercel --prod
```

### Step 3: Test on Production
```bash
# Visit your production URL
# Test registration: /register
# Test login: /login
# Test guest mode: /
# Test Boomi tools: "List all my Boomi processes"
```

---

## Troubleshooting

### Issue: "Database connection refused"
**Fix:**
```bash
# Check POSTGRES_URL is set
cat .env.local | grep POSTGRES_URL

# If empty, add it:
echo "POSTGRES_URL=postgresql://neondb_owner:npg_VIXqfN8P5wEx@ep-quiet-star-ah0pr94c-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" >> .env.local
```

### Issue: "Invalid credentials" on login
**Fix:**
- User might not exist → Register first at `/register`
- Password incorrect → Use "Forgot password" (if implemented)
- Try creating a new test account

### Issue: "Session expired" constantly
**Fix:**
- Ensure `AUTH_SECRET` is the same in `.env.local` and Vercel
- Clear browser cookies and try again
- Check that cookies are enabled

### Issue: No chat history in sidebar
**Fix:**
- Guest users lose history if cookies are cleared
- Register for permanent account
- Check server logs for database errors

### Issue: Boomi tools not working after login
**Fix:**
- All Boomi credentials should be set in environment
- Auto-configuration should work for all users
- Check server logs: `pnpm dev` and look for MCP errors

---

## Scripts Reference

### Setup Authentication
```bash
./scripts/setup-auth.sh
```
- Checks `POSTGRES_URL`
- Generates `AUTH_SECRET` if missing
- Runs database migrations
- Verifies setup

### Test Authentication
```bash
pnpm tsx scripts/test-auth.ts
```
- Tests database connection
- Tests user creation
- Tests password hashing/verification
- Tests guest user creation
- Cleans up test data

### Update Vercel Environment Variables
```bash
./scripts/update-vercel-env.sh
```
- Reads variables from `.env.local`
- Adds them to Vercel (all environments)
- Prompts for confirmation

### Run Database Migrations
```bash
pnpm tsx lib/db/migrate.ts
```
- Creates all database tables
- Runs any pending migrations
- Safe to run multiple times

---

## Security Checklist

- ✅ Passwords hashed with bcrypt
- ✅ Sessions encrypted with `AUTH_SECRET`
- ✅ HTTP-only cookies (not accessible via JS)
- ✅ Secure cookies in production (HTTPS)
- ✅ Database connections use SSL
- ✅ Environment variables not in Git
- ✅ Vercel encrypts environment variables

---

## Database Schema Quick Reference

```sql
-- Users
CREATE TABLE "User" (
  id UUID PRIMARY KEY,
  email VARCHAR(64) NOT NULL,
  password VARCHAR(64)  -- bcrypt hashed
);

-- Chats (linked to User)
CREATE TABLE "Chat" (
  id UUID PRIMARY KEY,
  createdAt TIMESTAMP,
  title TEXT,
  userId UUID REFERENCES "User"(id),
  visibility VARCHAR DEFAULT 'private'
);

-- Messages (linked to Chat)
CREATE TABLE "Message_v2" (
  id UUID PRIMARY KEY,
  chatId UUID REFERENCES "Chat"(id),
  role VARCHAR,  -- 'user' or 'assistant'
  parts JSON,
  attachments JSON,
  createdAt TIMESTAMP
);
```

---

## API Routes

- `/api/auth/[...nextauth]` - NextAuth authentication
- `/api/auth/guest` - Create guest user
- `/api/chat` - Chat endpoint (requires auth)
- `/api/history` - Get chat history (requires auth)
- `/api/vote` - Vote on messages (requires auth)
- `/api/document` - Document CRUD (requires auth)
- `/api/suggestions` - Suggestion CRUD (requires auth)

---

## Environment Variables Reference

| Variable | Required | Purpose | Where to Get |
|----------|----------|---------|--------------|
| `POSTGRES_URL` | Yes | Database connection | Neon dashboard |
| `AUTH_SECRET` | Yes | Session encryption | Generate with `openssl rand -base64 32` |
| `BOOMI_ACCOUNT_ID` | No* | Boomi API | Boomi dashboard |
| `BOOMI_USERNAME` | No* | Boomi API | Boomi dashboard |
| `BOOMI_API_TOKEN` | No* | Boomi API | Boomi dashboard |
| `BOOMI_PROFILE_NAME` | No | Boomi profile name | Default: "production" |
| `OPENROUTER_API_KEY` | No* | LLM provider | OpenRouter dashboard |
| `OPENAI_API_KEY` | No | Direct OpenAI | OpenAI dashboard |

\* Required for Boomi MCP tools to work

---

## Next Steps

### For Local Development
1. ✅ Database configured
2. ✅ Authentication configured
3. ✅ All tests passed
4. ➡️ Start dev server: `pnpm dev`
5. ➡️ Test at: http://localhost:3000

### For Production Deployment
1. ✅ Local setup complete
2. ➡️ Add environment variables to Vercel
3. ➡️ Deploy: `vercel --prod`
4. ➡️ Test production authentication
5. ➡️ Test Boomi tools on production

---

**Last Updated:** February 4, 2026  
**Status:** ✅ Fully configured and tested  
**Next Action:** Deploy to Vercel with environment variables

