"use client";

import { motion } from "framer-motion";
import type { UseChatHelpers } from "@ai-sdk/react";
import {
  Zap,
  BarChart3,
  Rocket,
  ListChecks,
  Plug,
} from "lucide-react";
import { BoomiConnectBanner } from "./boomi-connect-banner";
import { AvailableTools } from "./available-tools";
import { PromptLibrary } from "./prompt-library";
import type { ChatMessage } from "@/lib/types";

type GreetingProps = {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
};

const quickActions = [
  {
    icon: BarChart3,
    label: "System Health",
    prompt:
      "Check the status of all my atoms, list environments, and review recent execution records. Give me a summary of system health.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    label: "List Atoms",
    prompt: "List all my atoms and show their status.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: ListChecks,
    label: "List Processes",
    prompt: "List all my processes and show their details.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Rocket,
    label: "Deploy Process",
    prompt:
      "List all my processes and environments so I can choose which process to deploy.",
    color: "from-emerald-500 to-green-500",
  },
  {
    icon: Plug,
    label: "Connections",
    prompt: "List all my connections and show what connectors are available.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: BarChart3,
    label: "Executions",
    prompt:
      "Show me recent execution records and highlight any errors or failures.",
    color: "from-sky-500 to-indigo-500",
  },
];

export const Greeting = ({ chatId, sendMessage }: GreetingProps) => {
  const handleQuickAction = (prompt: string) => {
    window.history.pushState({}, "", `/chat/${chatId}`);
    sendMessage({
      role: "user",
      parts: [{ type: "text", text: prompt }],
    });
  };

  /*
   * SINGLE DOM tree for both mobile and desktop.
   * Visibility is controlled entirely by Tailwind responsive classes (md:).
   * This avoids hydration mismatches from useIsMobile / useWindowSize.
   */
  return (
    <div
      className="mx-auto flex size-full max-w-3xl flex-col px-3 pt-6 pb-4 md:mt-16 md:justify-center md:px-8"
      key="overview"
    >
      {/* ─────────── Mobile layout ─────────── */}

      {/* Centered hero with icon + title (mobile) */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center md:hidden"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.2 }}
      >
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#0073CF] to-[#00A3E0] flex items-center justify-center shadow-lg shadow-[#0073CF]/20">
          <span className="text-white font-bold text-xl">B</span>
        </div>
        <h1 className="mt-3 font-bold text-xl bg-gradient-to-r from-[#0073CF] to-[#00A3E0] bg-clip-text text-transparent">
          Boomi Assistant
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          AI-powered integration management
        </p>
      </motion.div>

      {/* Quick actions grid (mobile) */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-5 grid grid-cols-2 gap-2 md:hidden"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.35 }}
      >
        {quickActions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => handleQuickAction(action.prompt)}
            className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/80 px-3 py-2.5 text-left transition-all active:scale-[0.97] hover:border-[#0073CF]/30 hover:bg-[#0073CF]/5"
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${action.color}`}
            >
              <action.icon className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-medium leading-tight">
              {action.label}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Connected indicator (mobile) */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground mt-4 md:hidden"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
      >
        <div className="h-1.5 w-1.5 rounded-full bg-[#0073CF] animate-pulse" />
        <span>Connected to Boomi Platform</span>
      </motion.div>

      {/* ─────────── Desktop layout ─────────── */}

      {/* Title */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="hidden md:block font-bold text-4xl bg-gradient-to-r from-[#0073CF] to-[#00A3E0] bg-clip-text text-transparent"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
      >
        Welcome to Boomi Assistant
      </motion.div>

      {/* Subtitle */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="hidden md:block text-xl text-muted-foreground mt-2"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
      >
        Manage your integrations, processes, and trading partners with
        AI-powered assistance
      </motion.div>

      {/* Connect banner (desktop) */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="hidden md:block mt-6 mb-4"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.7 }}
      >
        <BoomiConnectBanner />
      </motion.div>

      {/* Available Tools (desktop) */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="hidden md:block mt-4 mb-4"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.75 }}
      >
        <AvailableTools />
      </motion.div>

      {/* Prompt Library (desktop) */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="hidden md:block mt-4 mb-4"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.8 }}
      >
        <PromptLibrary chatId={chatId} sendMessage={sendMessage} />
      </motion.div>

      {/* Connected indicator (desktop) */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="hidden md:flex items-center gap-2 text-sm text-muted-foreground"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.85 }}
      >
        <div className="h-2 w-2 rounded-full bg-[#0073CF] animate-pulse" />
        <span>Connected to Boomi Platform</span>
      </motion.div>
    </div>
  );
};
