// All models route through OpenRouter (single API key for all providers)
export const DEFAULT_CHAT_MODEL = "openrouter/moonshotai/kimi-k2.5";

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  // Anthropic
  {
    id: "openrouter/anthropic/claude-opus-4",
    name: "Claude Opus 4",
    provider: "anthropic",
    description: "Most intelligent Anthropic model",
  },
  {
    id: "openrouter/anthropic/claude-opus-4.6",
    name: "Claude Opus 4.6",
    provider: "anthropic",
    description: "Latest and most capable Anthropic model",
  },
  {
    id: "openrouter/anthropic/claude-sonnet-4",
    name: "Claude Sonnet 4",
    provider: "anthropic",
    description: "Best balance of speed, intelligence, and cost",
  },
  {
    id: "openrouter/anthropic/claude-sonnet-4.5",
    name: "Claude Sonnet 4.5",
    provider: "anthropic",
    description: "Latest Claude Sonnet with enhanced capabilities",
  },
  // Google
  {
    id: "openrouter/google/gemini-3-flash-preview",
    name: "Gemini 3 Flash Preview",
    provider: "google",
    description: "Google's latest fast model",
  },
  // Moonshot
  {
    id: "openrouter/moonshotai/kimi-k2.5",
    name: "Kimi K2.5",
    provider: "moonshot",
    description: "Reasoning model with extended thinking",
  },
  // OpenAI
  {
    id: "openrouter/openai/gpt-5.2-chat",
    name: "GPT-5.2 Chat",
    provider: "openai",
    description: "OpenAI's most capable chat model",
  },
  {
    id: "openrouter/openai/gpt-5.2-codex",
    name: "GPT-5.2 Codex",
    provider: "openai",
    description: "OpenAI's coding-optimized model",
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
  {} as Record<string, ChatModel[]>,
);
