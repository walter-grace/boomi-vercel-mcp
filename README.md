# Boomi Assistant

<div align="center">

**AI-Powered Chatbot for Boomi Platform Management**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)

Manage your Boomi integrations, processes, and trading partners with AI-powered assistance.

</div>

---

## 🚀 Features

### Core Capabilities
- **AI-Powered Chat Interface** - Natural language conversations with advanced AI models
- **Boomi Platform Integration** - Direct integration with Boomi API for managing:
  - Trading Partners (B2B/EDI)
  - Process Components
  - Organization Components
  - Account Information
  - Credential Profiles
- **Multiple AI Models** - Support for 100+ models via OpenRouter including:
  - GPT-4o, Claude 3.5 Sonnet
  - Kimi K2.5 (Reasoning models)
  - And many more
- **Responsive Design** - Fully optimized for mobile and desktop
- **Authentication** - Guest mode and registered user accounts
- **Chat History** - Persistent chat sessions with public/private visibility
- **Document Creation** - Create and manage documents/artifacts
- **File Attachments** - Upload and process files in conversations

### Boomi MCP Tools
The app integrates with a Boomi MCP (Model Context Protocol) server providing 7 specialized tools:

1. **`list_boomi_profiles`** - List all saved Boomi credential profiles
2. **`set_boomi_credentials`** - Store Boomi API credentials securely
3. **`delete_boomi_profile`** - Delete a stored credential profile
4. **`boomi_account_info`** - Get Boomi account information
5. **`manage_trading_partner`** - Manage B2B/EDI trading partners (CRUD operations)
6. **`manage_process`** - Manage Boomi process components (CRUD operations)
7. **`manage_organization`** - Manage Boomi organization components (CRUD operations)

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **AI SDK**: [Vercel AI SDK](https://sdk.vercel.ai) for LLM integration
- **UI Components**: [shadcn/ui](https://ui.shadcn.com) with [Radix UI](https://radix-ui.com)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Database**: [Neon PostgreSQL](https://neon.tech) (Serverless)
- **File Storage**: [Vercel Blob](https://vercel.com/storage/blob)
- **Authentication**: [NextAuth.js](https://authjs.dev) (Auth.js)
- **AI Models**: [OpenRouter](https://openrouter.ai) for multi-provider access
- **Type Safety**: TypeScript with strict mode
- **Code Quality**: Biome (formatter & linter)

## 📋 Prerequisites

- Node.js 18+ 
- pnpm 9.12.3+ (or npm/yarn)
- PostgreSQL database (Neon recommended)
- OpenRouter API key (for AI models)
- Boomi API credentials (optional, for Boomi features)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/walter-grace/vercel-boomi.git
cd vercel-boomi
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Database
POSTGRES_URL=your_postgres_connection_string

# Authentication
AUTH_SECRET=your_auth_secret_generate_with_openssl_rand_base64_32

# AI Models (OpenRouter)
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here

# Optional: Boomi MCP Server (defaults to Replit server)
BOOMI_MCP_SERVER_URL=https://boomi-mcp-server-replitzip.replit.app/mcp

# Optional: Vercel Blob (for file storage)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

**Important**: Never commit `.env.local` or any `.env` files. They are already excluded in `.gitignore`.

### 4. Set Up Database

```bash
# Run database migrations
pnpm db:migrate
```

### 5. Run Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 📚 Project Structure

```
vercel-boomi/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (chat)/            # Chat interface routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ai-elements/      # AI-generated UI elements
│   ├── elements/         # Reusable UI elements
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility libraries
│   ├── ai/               # AI SDK integration
│   │   ├── mcp-client.ts # Boomi MCP client
│   │   └── providers.ts  # AI model providers
│   └── db/               # Database schema & migrations
├── hooks/                 # React hooks
├── docs/                  # Documentation
└── public/                # Static assets
```

## 🔧 Configuration

### AI Models

The app uses OpenRouter to access 100+ AI models. Configure your preferred model in the chat interface dropdown.

**Recommended Models:**
- `moonshotai/kimi-k2.5` - Best for reasoning and complex tasks
- `openrouter/openai/gpt-4o` - Fast and capable
- `openrouter/anthropic/claude-3.5-sonnet` - Balanced performance

### Boomi Integration

1. Set up Boomi credentials in the chat:
   ```
   "Set up Boomi credentials for production profile"
   ```

2. Use Boomi tools:
   ```
   "List all trading partners"
   "Create a new process called Order Processing"
   "Show me account information"
   ```

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub** (this repository)
2. **Import to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com)
   - Click "Add New Project"
   - Import from GitHub: `walter-grace/vercel-boomi`
3. **Configure Environment Variables** in Vercel:
   - `POSTGRES_URL`
   - `AUTH_SECRET`
   - `OPENROUTER_API_KEY`
   - `BOOMI_MCP_SERVER_URL` (optional)
   - `BLOB_READ_WRITE_TOKEN` (optional)
4. **Deploy** - Vercel will automatically deploy on every push to `main`

### Manual Deployment

```bash
# Build the project
pnpm build

# Deploy to Vercel
vercel --prod
```

## 📖 Documentation

- [MCP Integration Guide](docs/MCP_INTEGRATION.md) - Boomi MCP server integration
- [OpenRouter Integration](docs/OPENROUTER_INTEGRATION.md) - AI model configuration
- [Authentication Setup](docs/AUTHENTICATION_SETUP.md) - Auth system details
- [UI Improvements](docs/UI_IMPROVEMENTS.md) - UI/UX enhancements

## 🔒 Security

- **Environment Variables**: Never commit `.env` files
- **API Keys**: Store all keys in Vercel Environment Variables for production
- **Authentication**: Uses secure HTTP-only cookies
- **Database**: Connection strings are encrypted in transit

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary. All rights reserved.

## 🙏 Acknowledgments

- Built on [Vercel AI SDK](https://sdk.vercel.ai)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Boomi Platform API integration
- OpenRouter for AI model access

## 📞 Support

For issues or questions, please open an issue in this repository.

---

<div align="center">

**Built with ❤️ for Boomi Platform Management**

</div>
