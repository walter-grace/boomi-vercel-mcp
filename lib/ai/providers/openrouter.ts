import { customProvider } from "ai";
import type { LanguageModel } from "ai";

function getOpenRouterAPIKey(): string {
  const apiKey =
    typeof process !== "undefined" && process.env?.OPENROUTER_API_KEY
      ? process.env.OPENROUTER_API_KEY
      : null;
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY environment variable is required for OpenRouter models"
    );
  }
  return apiKey;
}

/**
 * Convert AI SDK messages to OpenRouter format
 */
function convertMessagesToOpenRouterFormat(
  messages: Array<{ role: string; content: unknown }>
): Array<{ role: string; content: string; reasoning_details?: unknown }> {
  return messages.map((msg) => {
    const content =
      typeof msg.content === "string"
        ? msg.content
        : Array.isArray(msg.content)
          ? msg.content
              .map((part) =>
                typeof part === "string"
                  ? part
                  : part.type === "text"
                    ? part.text
                    : ""
              )
              .join("")
          : String(msg.content);

    const result: {
      role: string;
      content: string;
      reasoning_details?: unknown;
    } = {
      role: msg.role,
      content,
    };

    // Preserve reasoning_details if present
    if (
      msg.role === "assistant" &&
      "reasoning_details" in msg &&
      msg.reasoning_details
    ) {
      result.reasoning_details = msg.reasoning_details;
    }

    return result;
  });
}

/**
 * Create an OpenRouter language model with reasoning support
 * Supports models like moonshotai/kimi-k2.5 with reasoning capabilities
 */
export function createOpenRouterModel(modelId: string): LanguageModel {
  const apiKey = getOpenRouterAPIKey();

  return {
    specificationVersion: "v1",
    provider: "openrouter",
    modelId,
    defaultObjectGenerationMode: "json",
    doStream: async (options) => {
      // Convert messages to OpenRouter format
      const openRouterMessages = convertMessagesToOpenRouterFormat(
        options.prompt as Array<{ role: string; content: unknown }>
      );

      // Check if reasoning should be enabled
      const enableReasoning =
        options.experimental_reasoning?.enabled ||
        openRouterMessages.some(
          (msg) => msg.role === "assistant" && msg.reasoning_details
        );

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer":
              (typeof process !== "undefined" &&
                process.env?.OPENROUTER_HTTP_REFERER) ||
              "",
            "X-Title":
              (typeof process !== "undefined" &&
                process.env?.OPENROUTER_APP_NAME) ||
              "Vercel Chatbot",
          },
          body: JSON.stringify({
            model: modelId,
            messages: openRouterMessages,
            temperature: options.temperature,
            max_tokens: options.maxTokens,
            top_p: options.topP,
            frequency_penalty: options.frequencyPenalty,
            presence_penalty: options.presencePenalty,
            // Enable reasoning for models that support it
            ...(enableReasoning ? { reasoning: { enabled: true } } : {}),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${error}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      return {
        stream: new ReadableStream({
          async pull(controller) {
            try {
              const { done, value } = await reader.read();

              if (done) {
                controller.close();
                return;
              }

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6);
                  if (data === "[DONE]") {
                    controller.close();
                    return;
                  }

                  try {
                    const parsed = JSON.parse(data);
                    const choice = parsed.choices?.[0];

                    if (choice?.delta?.content) {
                      controller.enqueue({
                        type: "text-delta",
                        textDelta: choice.delta.content,
                      });
                    }

                    // Handle reasoning details if present
                    if (choice?.delta?.reasoning_details) {
                      controller.enqueue({
                        type: "reasoning",
                        reasoning: choice.delta.reasoning_details,
                      });
                    }

                    if (choice?.finish_reason) {
                      // Include reasoning_details in the final message if available
                      if (choice.message?.reasoning_details) {
                        controller.enqueue({
                          type: "reasoning",
                          reasoning: choice.message.reasoning_details,
                        });
                      }
                      controller.close();
                      return;
                    }
                  } catch {
                    // Ignore parse errors for incomplete JSON
                  }
                }
              }
            } catch (error) {
              controller.error(error);
            }
          },
        }),
        rawCall: { rawPrompt: options.prompt, rawSettings: {} },
      };
    },
  } as LanguageModel;
}

