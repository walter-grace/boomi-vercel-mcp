"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { memo } from "react";
import type { ChatMessage } from "@/lib/types";
import { Suggestion } from "./elements/suggestion";
import type { VisibilityType } from "./visibility-selector";

type SuggestedActionsProps = {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  selectedVisibilityType: VisibilityType;
};

function PureSuggestedActions({ chatId, sendMessage }: SuggestedActionsProps) {
  const suggestedActions = [
    // Demo Actions - Featured
    {
      category: "Demo - Process View",
      text: "Show me the process in Frank_Dev",
      icon: "🎯",
    },
    {
      category: "Demo - Process Breakdown",
      text: "Breakdown the process ID 1e5efba1-d398-4420-97e2-29da11685980 - explain how it works",
      icon: "🔍",
    },
    // Process Management
    {
      category: "Process Management",
      text: "List all Boomi processes in the production profile",
      icon: "📊",
    },
    {
      category: "Process Management",
      text: "Show me processes in the Process Library folder",
      icon: "📁",
    },
    // Trading Partner Management
    {
      category: "Trading Partners",
      text: "Show me all trading partners in Boomi",
      icon: "🤝",
    },
    {
      category: "Trading Partners",
      text: "List all my trading partners",
      icon: "👥",
    },
    // Account & Profile Management
    {
      category: "Account Info",
      text: "Get my Boomi account information",
      icon: "ℹ️",
    },
    {
      category: "Profiles",
      text: "List my Boomi profiles",
      icon: "🔐",
    },
  ];

  return (
    <div
      className="w-full space-y-3 sm:space-y-4"
      data-testid="suggested-actions"
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-xs sm:text-sm font-medium text-muted-foreground"
        exit={{ opacity: 0, y: 20 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.8 }}
      >
        Quick Actions
      </motion.div>
      <div className="grid w-full gap-2 sm:grid-cols-2">
        {suggestedActions.map((action, index) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            initial={{ opacity: 0, y: 20 }}
            key={action.text}
            transition={{ delay: 0.05 * index + 0.85 }}
          >
            <Suggestion
              className="group h-auto w-full whitespace-normal p-3 sm:p-4 text-left border-2 border-border hover:border-primary hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              onClick={(suggestion) => {
                window.history.pushState({}, "", `/chat/${chatId}`);
                sendMessage({
                  role: "user",
                  parts: [{ type: "text", text: suggestion }],
                });
              }}
              suggestion={action.text}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl flex-shrink-0">
                  {action.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-primary mb-0.5 sm:mb-1">
                    {action.category}
                  </div>
                  <div className="text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors">
                    {action.text}
                  </div>
                </div>
              </div>
            </Suggestion>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) {
      return false;
    }
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) {
      return false;
    }

    return true;
  }
);
