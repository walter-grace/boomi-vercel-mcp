# Authentication & Database Setup Guide

## Overview
Your Boomi chatbot uses **NextAuth** for authentication with **Neon PostgreSQL** as the database. The authentication system supports:
- ✅ Email/password login
- ✅ User registration
- ✅ Guest mode (anonymous users)
- ✅ Session management
- ✅ Chat history tied to user accounts

## Current Status

### ❌ Missing Environment Variables
Your application needs the following environment variables configured:

1. **`POSTGRES_URL`** - Neon database connection string
2. **`AUTH_SECRET`** - NextAuth secret for session encryption

Without these, the login feature **will not work**.

---

## Setup Instructions

### Step 1: Configure Database Connection

You already have a Neon database. Add this to your **`.env.local`** file:

```bash
# Neon Database Connection (from earlier setup)
POSTGRES_URL=postgresql://neondb_owner:npg_VIXqfN8P5wEx@ep-quiet-star-ah0pr94c-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Step 2: Generate and Set AUTH_SECRET

The `AUTH_SECRET` is used by NextAuth to encrypt sessions and tokens.

**Generate a secure secret:**
```bash
openssl rand -base64 32
```

Or use this Node.js command:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Add it to `.env.local`:**
```bash
AUTH_SECRET=your-generated-secret-here
```

### Step 3: Run Database Migrations

The migrations will create the necessary tables (`User`, `Chat`, `Message_v2`, `Vote_v2`, `Document`, `Suggestion`, `Stream`).

```bash
cd /Users/bigneek/Desktop/ai-chatbot
pnpm tsx lib/db/migrate.ts
```

You should see:
```
⏳ Running migrations...
✅ Migrations completed in XXX ms
```

### Step 4: Verify Database Tables

Check that the tables were created in your Neon dashboard:
- `User` - Stores user accounts
- `Chat` - Stores chat sessions
- `Message_v2` - Stores chat messages
- `Vote_v2` - Stores message votes (thumbs up/down)
- `Document` - Stores artifacts/documents
- `Suggestion` - Stores suggestions for documents
- `Stream` - Stores streaming session data

### Step 5: Update Vercel Environment Variables

Add these environment variables to your **Vercel project**:

1. Go to: https://vercel.com/waltgraces-projects/ai-chatbot/settings/environment-variables
2. Add:
   - `POSTGRES_URL` (use the pooled connection string)
   - `AUTH_SECRET` (same value from `.env.local`)

**Important**: Make sure to add them for:
- ✅ Production
- ✅ Preview
- ✅ Development

### Step 6: Redeploy to Vercel

```bash
cd /Users/bigneek/Desktop/ai-chatbot
vercel --prod
```

---

## How Authentication Works

### User Flow

#### 1. **Guest Mode (Default)**
When users visit your chatbot **without logging in**:
- A temporary guest account is created automatically
- Guest email format: `guest-1234567890`
- They can use the chat immediately
- Chat history is saved to their guest account
- Guest sessions persist via cookies

#### 2. **Register New Account**
Users can click "Sign up for free" to create a permanent account:
- Navigate to: `/register`
- Enter email and password
- Password is hashed using bcrypt
- After registration, they're logged in automatically

#### 3. **Login with Existing Account**
Users with accounts can sign in:
- Navigate to: `/login`
- Enter email and password
- Password is verified against the hashed version
- Session cookie is created
- Previous chat history is restored

#### 4. **Session Management**
- Sessions are managed by NextAuth
- Session cookies last for 30 days by default
- Users stay logged in across page refreshes
- Logout available in the sidebar

### Database Schema

```sql
-- Users table
CREATE TABLE "User" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" varchar(64) NOT NULL,
  "password" varchar(64)  -- Hashed with bcrypt
);

-- Chats table (linked to User)
CREATE TABLE "Chat" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "createdAt" timestamp NOT NULL,
  "title" text NOT NULL,
  "userId" uuid NOT NULL REFERENCES "User"("id"),
  "visibility" varchar DEFAULT 'private'
);

-- Messages table (linked to Chat)
CREATE TABLE "Message_v2" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "chatId" uuid NOT NULL REFERENCES "Chat"("id"),
  "role" varchar NOT NULL,  -- 'user' or 'assistant'
  "parts" json NOT NULL,    -- Message content
  "attachments" json NOT NULL,
  "createdAt" timestamp NOT NULL
);
```

---

## Testing Authentication

### Test 1: Guest Mode (No Login)
1. Open: http://localhost:3000
2. Start chatting immediately
3. Check browser DevTools → Application → Cookies
4. You should see `next-auth.session-token`
5. Refresh the page - chat history should persist

### Test 2: Register New User
1. Navigate to: http://localhost:3000/login
2. Click "Sign up for free"
3. Enter: `test@example.com` / `password123`
4. Submit the form
5. You should be redirected to the homepage
6. Your chat history starts fresh

### Test 3: Login Existing User
1. Navigate to: http://localhost:3000/login
2. Enter your registered email/password
3. Submit the form
4. You should be redirected to the homepage
5. Previous chat history should load in the sidebar

### Test 4: Chat History Persistence
1. Login as a user
2. Start a new chat and send a message
3. Refresh the page
4. The chat should appear in the sidebar history
5. Logout and login again - history should still be there

### Test 5: Boomi MCP Tools with Authentication
1. Login (guest or registered user)
2. Ask: "List all my Boomi processes"
3. The MCP server should respond with your processes
4. Check that the chat is saved to the database

---

## Common Issues & Fixes

### Issue 1: "Database connection refused"
**Symptom:** Error when running migrations or starting the app

**Fix:**
```bash
# Check that POSTGRES_URL is set
echo $POSTGRES_URL

# If empty, load from .env.local
export $(cat .env.local | grep POSTGRES_URL)

# Run migrations again
pnpm tsx lib/db/migrate.ts
```

### Issue 2: "Invalid credentials" on login
**Symptom:** Login form shows error even with correct password

**Possible Causes:**
- User doesn't exist (try registering first)
- Password was changed directly in DB (needs to be re-hashed)
- `AUTH_SECRET` is different between sessions

**Fix:**
```bash
# Create a test user via the register page
# OR manually in the database (use bcrypt to hash password)
```

### Issue 3: "Session expired" or constant logouts
**Symptom:** Users get logged out frequently

**Fix:**
1. Ensure `AUTH_SECRET` is the same in `.env.local` and Vercel
2. Check that cookies are enabled in the browser
3. Verify the domain matches (localhost vs production URL)

### Issue 4: No chat history in sidebar
**Symptom:** Chats don't appear in the sidebar after refresh

**Possible Causes:**
- User is in guest mode and cookies were cleared
- Database query is failing (check server logs)
- `userId` mismatch in the database

**Fix:**
```bash
# Check server logs for errors
pnpm dev

# Verify user ID matches in the database
# Navigate to Neon dashboard → SQL Editor:
SELECT * FROM "Chat" WHERE "userId" = 'your-user-id';
```

### Issue 5: "AUTH_SECRET environment variable is not set"
**Symptom:** Error when starting the app

**Fix:**
```bash
# Generate a new secret
openssl rand -base64 32

# Add to .env.local
echo "AUTH_SECRET=your-generated-secret" >> .env.local

# Restart the dev server
pnpm dev
```

---

## Security Best Practices

### 1. Password Hashing
- ✅ Passwords are hashed using `bcrypt-ts`
- ✅ Never store plain-text passwords
- ✅ Hash strength: 10 rounds (default)

### 2. Session Security
- ✅ Sessions encrypted with `AUTH_SECRET`
- ✅ HTTP-only cookies (not accessible via JavaScript)
- ✅ Secure cookies in production (HTTPS only)

### 3. Database Security
- ✅ Use Neon's pooled connection for better performance
- ✅ Connection strings use SSL (`sslmode=require`)
- ✅ Neon handles connection encryption

### 4. Environment Variables
- ✅ Never commit `.env.local` to Git (in `.gitignore`)
- ✅ Use Vercel's environment variable encryption
- ✅ Rotate `AUTH_SECRET` periodically

### 5. Guest User Cleanup
Guest users accumulate over time. Consider periodic cleanup:

```sql
-- Delete guest users older than 30 days
DELETE FROM "User" 
WHERE email LIKE 'guest-%' 
AND id NOT IN (
  SELECT DISTINCT "userId" FROM "Chat" 
  WHERE "createdAt" > NOW() - INTERVAL '30 days'
);
```

---

## Quick Setup Script

Run this script to set up everything automatically:

```bash
#!/bin/bash
cd /Users/bigneek/Desktop/ai-chatbot

echo "🔧 Setting up authentication & database..."

# Check if POSTGRES_URL is set
if [ -z "$POSTGRES_URL" ]; then
  echo "⚠️  POSTGRES_URL not found in environment"
  echo "📝 Please add to .env.local:"
  echo "POSTGRES_URL=postgresql://neondb_owner:npg_VIXqfN8P5wEx@ep-quiet-star-ah0pr94c-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
  exit 1
fi

# Check if AUTH_SECRET is set
if [ -z "$AUTH_SECRET" ]; then
  echo "🔑 Generating AUTH_SECRET..."
  AUTH_SECRET=$(openssl rand -base64 32)
  echo "AUTH_SECRET=$AUTH_SECRET" >> .env.local
  echo "✅ AUTH_SECRET added to .env.local"
else
  echo "✅ AUTH_SECRET already set"
fi

# Run migrations
echo "📦 Running database migrations..."
pnpm tsx lib/db/migrate.ts

# Check if successful
if [ $? -eq 0 ]; then
  echo "✅ Database setup complete!"
  echo ""
  echo "🎉 Authentication is ready!"
  echo ""
  echo "Next steps:"
  echo "1. Start the dev server: pnpm dev"
  echo "2. Visit: http://localhost:3000/login"
  echo "3. Register a new account or use guest mode"
else
  echo "❌ Migration failed. Check the error above."
  exit 1
fi
```

Save as `scripts/setup-auth.sh` and run:
```bash
chmod +x scripts/setup-auth.sh
./scripts/setup-auth.sh
```

---

## Summary

### What You Need to Do
1. ✅ Add `POSTGRES_URL` to `.env.local`
2. ✅ Generate and add `AUTH_SECRET` to `.env.local`
3. ✅ Run migrations: `pnpm tsx lib/db/migrate.ts`
4. ✅ Add both variables to Vercel
5. ✅ Redeploy: `vercel --prod`
6. ✅ Test login at: `/login`

### Does Chat Work with Authentication?
**Yes!** The chat feature is fully integrated with authentication:
- ✅ Chat history is saved per user
- ✅ Chats can be public or private
- ✅ Message votes are tracked
- ✅ Documents/artifacts are user-specific
- ✅ Boomi MCP tools work for all users (guest or registered)

### Guest Mode vs Registered Users
| Feature | Guest Mode | Registered User |
|---------|-----------|-----------------|
| Chat immediately | ✅ Yes | ✅ Yes |
| Chat history | ✅ Temporary | ✅ Permanent |
| Use Boomi tools | ✅ Yes | ✅ Yes |
| Share chats | ❌ No | ✅ Yes (if public) |
| Multi-device sync | ❌ No | ✅ Yes |
| Password protected | ❌ No | ✅ Yes |

---

**Last Updated:** February 4, 2026  
**Status:** Pending setup of `POSTGRES_URL` and `AUTH_SECRET`

