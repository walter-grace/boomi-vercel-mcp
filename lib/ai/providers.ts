import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

// Lazy initialization of OpenRouter provider to ensure env vars are loaded
function getOpenRouterProvider() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY not found. All models require an OpenRouter API key. Please set it in your environment variables.",
    );
  }

  return createOpenRouter({
    apiKey,
    headers: {
      "HTTP-Referer":
        process.env.OPENROUTER_HTTP_REFERER || "https://your-app.com",
      "X-Title": process.env.OPENROUTER_APP_NAME || "Boomi Chatbot",
    },
  });
}

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : null;

export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  const openrouter = getOpenRouterProvider();

  // All models should have the openrouter/ prefix
  // Strip it to get the actual model ID for the OpenRouter API
  const openrouterModelId = modelId.startsWith("openrouter/")
    ? modelId.replace("openrouter/", "")
    : modelId;

  // Check if this is a reasoning/thinking model
  const isReasoningModel =
    openrouterModelId.includes("reasoning") ||
    openrouterModelId.endsWith("-thinking");

  if (isReasoningModel) {
    const baseModelId = openrouterModelId.replace(/-thinking$/, "");
    return wrapLanguageModel({
      model: openrouter(baseModelId),
      middleware: extractReasoningMiddleware({ tagName: "thinking" }),
    });
  }

  return openrouter(openrouterModelId);
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }
  const openrouter = getOpenRouterProvider();
  return openrouter("openai/gpt-4o-mini");
}

export function getArtifactModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("artifact-model");
  }
  const openrouter = getOpenRouterProvider();
  return openrouter("anthropic/claude-sonnet-4");
}
