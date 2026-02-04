import { gateway } from "@ai-sdk/gateway";
import { openai } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

const THINKING_SUFFIX_REGEX = /-thinking$/;

// Lazy initialization of OpenRouter provider to ensure env vars are loaded
function getOpenRouterProvider() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.log("[Provider] ⚠️ OPENROUTER_API_KEY not found in environment");
    return null;
  }
  
  // Debug: Log API key status (masked)
  const maskedKey = apiKey.length > 10 
    ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`
    : "***";
  console.log(`[Provider] ✅ OpenRouter API key found: ${maskedKey} (length: ${apiKey.length})`);
  
  return createOpenRouter({
    apiKey,
    headers: {
      "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER || "https://your-app.com",
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

  // Check if it's an OpenRouter model
  // Format: openrouter/openai/gpt-4o or openrouter/anthropic/claude-3.5-sonnet
  if (modelId.startsWith("openrouter/")) {
    const openrouter = getOpenRouterProvider();
    if (!openrouter) {
      console.error("[Provider] ❌ OpenRouter provider not available - API key missing");
      throw new Error(
        "OpenRouter API key not found. Please set OPENROUTER_API_KEY in your environment variables."
      );
    }
    const openrouterModelId = modelId.replace("openrouter/", "");
    console.log(`[Provider] Using OpenRouter model: ${openrouterModelId}`);
    console.log(`[Provider] API key present: ${!!process.env.OPENROUTER_API_KEY}`);
    return openrouter(openrouterModelId);
  }

  // Check if it's a direct OpenAI model (bypasses gateway)
  // Format: openai-direct/gpt-4o or openai-direct/gpt-4-turbo
  if (modelId.startsWith("openai-direct/")) {
    const openaiModelId = modelId.replace("openai-direct/", "");
    console.log(`[Provider] Using direct OpenAI model: ${openaiModelId}`);
    return openai(openaiModelId);
  }

  const isReasoningModel =
    modelId.includes("reasoning") || modelId.endsWith("-thinking");

  if (isReasoningModel) {
    const gatewayModelId = modelId.replace(THINKING_SUFFIX_REGEX, "");

    return wrapLanguageModel({
      model: gateway.languageModel(gatewayModelId),
      middleware: extractReasoningMiddleware({ tagName: "thinking" }),
    });
  }

  // Use gateway for all other models (including openai/gpt-* models)
  return gateway.languageModel(modelId);
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }
  // Use OpenRouter if available, otherwise fallback to gateway
  const openrouter = getOpenRouterProvider();
  if (openrouter) {
    return openrouter("openai/gpt-4o-mini");
  }
  return gateway.languageModel("google/gemini-2.5-flash-lite");
}

export function getArtifactModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("artifact-model");
  }
  // Use OpenRouter if available, otherwise fallback to gateway
  const openrouter = getOpenRouterProvider();
  if (openrouter) {
    return openrouter("anthropic/claude-3.5-sonnet");
  }
  return gateway.languageModel("anthropic/claude-haiku-4.5");
}
