"use server";

import { generateText, type UIMessage } from "ai";
import { cookies } from "next/headers";
import type { VisibilityType } from "@/components/visibility-selector";
import { titlePrompt } from "@/lib/ai/prompts";
import { getTitleModel } from "@/lib/ai/providers";
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisibilityById,
} from "@/lib/db/queries";
import { getTextFromMessage } from "@/lib/utils";

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set("chat-model", model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  try {
    console.log("[Title] Generating title for message...");
    const { text } = await generateText({
      model: getTitleModel(),
      system: titlePrompt,
      prompt: getTextFromMessage(message),
    });

    const cleanedText = text
      .replace(/^[#*"\s]+/, "")
      .replace(/["]+$/, "")
      .trim();

    console.log("[Title] Title generated:", cleanedText);
    return cleanedText;
  } catch (error) {
    console.error("[Title] Error generating title:", error);
    // Return a fallback title instead of throwing
    const fallbackTitle =
      getTextFromMessage(message).slice(0, 50) || "New chat";
    console.log("[Title] Using fallback title:", fallbackTitle);
    return fallbackTitle;
  }
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisibilityById({ chatId, visibility });
}
