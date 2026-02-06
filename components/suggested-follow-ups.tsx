"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import type { ChatMessage } from "@/lib/types";

type SuggestedFollowUpsProps = {
  chatId: string;
  message: ChatMessage;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
};

interface FollowUp {
  text: string;
  icon: string;
}

/**
 * Extracts Boomi entity names from message text for dynamic prompt generation.
 */
function extractEntities(text: string) {
  const entities: {
    processNames: string[];
    atomNames: string[];
    folderNames: string[];
    environmentNames: string[];
    connectionNames: string[];
    offlineAtoms: boolean;
    hasErrors: boolean;
    processIds: string[];
    tradingPartners: string[];
    executionIds: string[];
  } = {
    processNames: [],
    atomNames: [],
    folderNames: [],
    environmentNames: [],
    connectionNames: [],
    offlineAtoms: false,
    hasErrors: false,
    processIds: [],
    tradingPartners: [],
    executionIds: [],
  };

  // Detect offline atoms
  if (/offline|inactive|not running|stopped/i.test(text)) {
    entities.offlineAtoms = true;
  }

  // Detect errors
  if (/error|fail|exception|issue|problem|warning/i.test(text)) {
    entities.hasErrors = true;
  }

  // Extract UUIDs (Boomi process/component IDs)
  const uuidMatches = text.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
  );
  if (uuidMatches) {
    entities.processIds = [...new Set(uuidMatches)].slice(0, 3);
  }

  // Extract folder names from common patterns like "Frank_Dev", "000_Satish_Test"
  const folderMatches = text.match(
    /(?:folder|directory)[:\s]*["']?([A-Za-z0-9_/-]+)["']?/gi
  );
  if (folderMatches) {
    for (const match of folderMatches) {
      const name = match.replace(/(?:folder|directory)[:\s]*["']?/i, "").replace(/["']$/, "");
      if (name.length > 2) {
        entities.folderNames.push(name);
      }
    }
  }

  // Extract from table-like data (| Name | or ** Name **)
  const boldNames = text.match(/\*\*([^*]+)\*\*/g);
  if (boldNames) {
    for (const match of boldNames) {
      const name = match.replace(/\*\*/g, "").trim();
      if (name.length > 2 && name.length < 60) {
        // Classify based on context around the match
        const idx = text.indexOf(match);
        const context = text.substring(Math.max(0, idx - 80), idx + match.length + 80).toLowerCase();

        if (context.includes("atom") || context.includes("runtime")) {
          entities.atomNames.push(name);
        } else if (context.includes("environment")) {
          entities.environmentNames.push(name);
        } else if (context.includes("connection") || context.includes("connector")) {
          entities.connectionNames.push(name);
        } else if (context.includes("process")) {
          entities.processNames.push(name);
        } else if (context.includes("partner") || context.includes("trading")) {
          entities.tradingPartners.push(name);
        }
      }
    }
  }

  // Deduplicate
  entities.processNames = [...new Set(entities.processNames)].slice(0, 3);
  entities.atomNames = [...new Set(entities.atomNames)].slice(0, 3);
  entities.folderNames = [...new Set(entities.folderNames)].slice(0, 3);
  entities.environmentNames = [...new Set(entities.environmentNames)].slice(0, 3);
  entities.connectionNames = [...new Set(entities.connectionNames)].slice(0, 3);
  entities.tradingPartners = [...new Set(entities.tradingPartners)].slice(0, 3);

  return entities;
}

/**
 * Determines which MCP tools were called in this message by looking at part types.
 */
function extractToolCalls(message: ChatMessage): string[] {
  const tools: string[] = [];
  for (const part of message.parts) {
    if (part.type.startsWith("tool-")) {
      tools.push(part.type.replace("tool-", ""));
    }
  }
  return [...new Set(tools)];
}

/**
 * Generates contextual follow-up prompts based on the LLM response content and tools used.
 */
function generateFollowUps(message: ChatMessage): FollowUp[] {
  const textParts = message.parts
    .filter((p) => p.type === "text")
    .map((p) => ("text" in p ? p.text : ""))
    .join("\n");

  const toolCalls = extractToolCalls(message);
  const entities = extractEntities(textParts);
  const followUps: FollowUp[] = [];

  // ---- Entity-specific suggestions ----

  // If specific process IDs were found, suggest deep dives
  if (entities.processIds.length > 0) {
    followUps.push({
      text: `Break down process ${entities.processIds.at(0)} — explain its components, connectors, and data flow`,
      icon: "🔍",
    });
  }

  // If process names were mentioned
  if (entities.processNames.length > 0) {
    const name = entities.processNames.at(0);
    followUps.push({
      text: `Show me the full structure and configuration of "${name}"`,
      icon: "📋",
    });
  }

  // If offline atoms detected
  if (entities.offlineAtoms) {
    followUps.push({
      text: "Which atoms are offline? Help me troubleshoot why they're not running",
      icon: "🔧",
    });
  }

  // If specific atoms were mentioned
  if (entities.atomNames.length > 0) {
    const name = entities.atomNames.at(0);
    followUps.push({
      text: `Get the detailed status and configuration of atom "${name}"`,
      icon: "⚙️",
    });
  }

  // If folders were mentioned
  if (entities.folderNames.length > 0) {
    const name = entities.folderNames.at(0);
    followUps.push({
      text: `List all processes in the "${name}" folder with their details`,
      icon: "📁",
    });
  }

  // If environments were found
  if (entities.environmentNames.length > 0) {
    const name = entities.environmentNames.at(0);
    followUps.push({
      text: `Show me all deployments in the "${name}" environment`,
      icon: "🌍",
    });
  }

  // If connections were found
  if (entities.connectionNames.length > 0) {
    followUps.push({
      text: "Show me all connections and their types — which ones are actively used?",
      icon: "🔗",
    });
  }

  // If errors were detected
  if (entities.hasErrors) {
    followUps.push({
      text: "Show me recent execution records and highlight any failures or errors",
      icon: "⚠️",
    });
  }

  // If trading partners were mentioned
  if (entities.tradingPartners.length > 0) {
    followUps.push({
      text: "List all trading partners with their connection details and status",
      icon: "🤝",
    });
  }

  // ---- Content-pattern based suggestions ----

  const lowerText = textParts.toLowerCase();

  // Audit/overview response → suggest deeper dives
  if (
    (lowerText.includes("audit") || lowerText.includes("overview") || lowerText.includes("summary")) &&
    followUps.length < 3
  ) {
    followUps.push({
      text: "Create a spreadsheet document summarizing all my Boomi assets with their status",
      icon: "📊",
    });
  }

  // If deployments were discussed
  if (lowerText.includes("deploy") && followUps.length < 4) {
    followUps.push({
      text: "Show me all recent deployments and their status across all environments",
      icon: "🚀",
    });
  }

  // If execution/run was discussed
  if (
    (lowerText.includes("execution") || lowerText.includes("run history")) &&
    followUps.length < 4
  ) {
    followUps.push({
      text: "Show me the last 10 execution records with their success/failure status",
      icon: "📜",
    });
  }

  // If maps were discussed
  if (lowerText.includes("map") && followUps.length < 4) {
    followUps.push({
      text: "List all maps in my account — which ones are used by active processes?",
      icon: "🗺️",
    });
  }

  // If process structure/XML was discussed
  if (
    (lowerText.includes("xml") || lowerText.includes("structure") || lowerText.includes("component")) &&
    followUps.length < 4
  ) {
    followUps.push({
      text: "Can you help me create a new integration process? I need to connect two systems",
      icon: "🏗️",
    });
  }

  // ---- Generic fallbacks if we don't have enough ----

  if (followUps.length === 0) {
    // If the response mentions Boomi at all, suggest general exploration
    if (lowerText.includes("boomi") || toolCalls.length > 0) {
      followUps.push(
        {
          text: "Run a full audit of my Boomi account — list all atoms, environments, processes, and connections",
          icon: "🔎",
        },
        {
          text: "Show me recent execution records to check for any failures",
          icon: "📜",
        },
        {
          text: "Which processes have been modified most recently?",
          icon: "🕐",
        }
      );
    }
  }

  // Cap at 4 suggestions max
  return followUps.slice(0, 4);
}

function PureSuggestedFollowUps({
  chatId,
  message,
  sendMessage,
}: SuggestedFollowUpsProps) {
  const followUps = useMemo(() => generateFollowUps(message), [message]);

  if (followUps.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {followUps.map((followUp, index) => (
        <motion.button
          key={followUp.text}
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index + 0.3 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-foreground hover:shadow-sm cursor-pointer"
          onClick={() => {
            sendMessage({
              role: "user",
              parts: [{ type: "text", text: followUp.text }],
            });
          }}
        >
          <span>{followUp.icon}</span>
          <span className="max-w-[280px] truncate">{followUp.text}</span>
        </motion.button>
      ))}
    </div>
  );
}

export const SuggestedFollowUps = PureSuggestedFollowUps;

