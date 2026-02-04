// Default to Kimi K2.5 via OpenRouter if available (reasoning model with extended thinking)
// Otherwise fallback to OpenAI Direct
export const DEFAULT_CHAT_MODEL =
  typeof process !== "undefined" && process.env.OPENROUTER_API_KEY
    ? "openrouter/moonshotai/kimi-k2.5"
    : "openai-direct/gpt-4o-mini";

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  // OpenRouter Models (Single API Key for 100+ models!)
  {
    id: "openrouter/openai/gpt-4o",
    name: "GPT-4o (OpenRouter)",
    provider: "openrouter",
    description: "Latest GPT-4o via OpenRouter",
  },
  {
    id: "openrouter/openai/gpt-4o-mini",
    name: "GPT-4o Mini (OpenRouter)",
    provider: "openrouter",
    description: "Fast and affordable GPT-4o Mini",
  },
  {
    id: "openrouter/openai/gpt-4-turbo",
    name: "GPT-4 Turbo (OpenRouter)",
    provider: "openrouter",
    description: "High-performance GPT-4 Turbo",
  },
  {
    id: "openrouter/openai/gpt-5-nano",
    name: "GPT-5 Nano (OpenRouter)",
    provider: "openrouter",
    description: "Ultra-fast and efficient GPT-5 Nano",
  },
  {
    id: "openrouter/anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet (OpenRouter)",
    provider: "openrouter",
    description: "Best balance of speed and intelligence",
  },
  {
    id: "openrouter/anthropic/claude-3-opus",
    name: "Claude 3 Opus (OpenRouter)",
    provider: "openrouter",
    description: "Most capable Anthropic model",
  },
  {
    id: "openrouter/google/gemini-pro",
    name: "Gemini Pro (OpenRouter)",
    provider: "openrouter",
    description: "Google's advanced model",
  },
  {
    id: "openrouter/moonshotai/kimi-k2.5",
    name: "Kimi K2.5 (OpenRouter)",
    provider: "openrouter",
    description: "Reasoning model with extended thinking",
  },
  {
    id: "openrouter/xai/grok-beta",
    name: "Grok Beta (OpenRouter)",
    provider: "openrouter",
    description: "xAI's conversational model",
  },
  {
    id: "openrouter/google/gemini-3-flash-preview",
    name: "Gemini 3 Flash Preview (OpenRouter)",
    provider: "openrouter",
    description: "Google's latest fast model",
  },
  {
    id: "openrouter/anthropic/claude-sonnet-4.5",
    name: "Claude Sonnet 4.5 (OpenRouter)",
    provider: "openrouter",
    description: "Latest Claude Sonnet model",
  },
  {
    id: "openrouter/deepseek/deepseek-v3.2",
    name: "DeepSeek V3.2 (OpenRouter)",
    provider: "openrouter",
    description: "DeepSeek's advanced reasoning model",
  },
  // Anthropic
  {
    id: "anthropic/claude-haiku-4.5",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
    description: "Fast and affordable, great for everyday tasks",
  },
  {
    id: "anthropic/claude-sonnet-4.5",
    name: "Claude Sonnet 4.5",
    provider: "anthropic",
    description: "Best balance of speed, intelligence, and cost",
  },
  {
    id: "anthropic/claude-opus-4.5",
    name: "Claude Opus 4.5",
    provider: "anthropic",
    description: "Most capable Anthropic model",
  },
  // OpenAI (via Vercel AI Gateway)
  {
    id: "openai/gpt-4.1-mini",
    name: "GPT-4.1 Mini (Gateway)",
    provider: "openai",
    description: "Fast and cost-effective for simple tasks",
  },
  {
    id: "openai/gpt-5.2",
    name: "GPT-5.2 (Gateway)",
    provider: "openai",
    description: "Most capable OpenAI model",
  },
  // OpenAI Direct (bypasses gateway, uses OPENAI_API_KEY)
  {
    id: "openai-direct/gpt-4o",
    name: "GPT-4o (Direct)",
    provider: "openai",
    description: "OpenAI GPT-4o via direct API",
  },
  {
    id: "openai-direct/gpt-4o-mini",
    name: "GPT-4o Mini (Direct)",
    provider: "openai",
    description: "Fast and affordable GPT-4o Mini",
  },
  {
    id: "openai-direct/gpt-4-turbo",
    name: "GPT-4 Turbo (Direct)",
    provider: "openai",
    description: "High-performance GPT-4 Turbo",
  },
  // Google
  {
    id: "google/gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    provider: "google",
    description: "Ultra fast and affordable",
  },
  {
    id: "google/gemini-3-pro-preview",
    name: "Gemini 3 Pro",
    provider: "google",
    description: "Most capable Google model",
  },
  // xAI
  {
    id: "xai/grok-4.1-fast-non-reasoning",
    name: "Grok 4.1 Fast",
    provider: "xai",
    description: "Fast with 30K context",
  },
  // Reasoning models (extended thinking)
  {
    id: "anthropic/claude-3.7-sonnet-thinking",
    name: "Claude 3.7 Sonnet",
    provider: "reasoning",
    description: "Extended thinking for complex problems",
  },
  {
    id: "xai/grok-code-fast-1-thinking",
    name: "Grok Code Fast",
    provider: "reasoning",
    description: "Reasoning optimized for code",
  },
];

// Group models by provider for UI
export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);
