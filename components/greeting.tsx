"use client";

import { motion } from "framer-motion";
import type { UseChatHelpers } from "@ai-sdk/react";
import {
  Zap,
  BarChart3,
  Rocket,
  ListChecks,
  Plug,
  Menu,
} from "lucide-react";
import { BoomiConnectBanner } from "./boomi-connect-banner";
import { AvailableTools } from "./available-tools";
import { PromptLibrary } from "./prompt-library";
import { useSidebar } from "./ui/sidebar";
import type { ChatMessage } from "@/lib/types";
import { Button } from "./ui/button";

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
  const { setOpenMobile } = useSidebar();

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
      className="mx-auto flex size-full max-w-3xl flex-col px-4 pt-4 pb-6 md:mt-16 md:justify-center md:px-8"
      key="overview"
    >
      {/* ── Title ──────────────────────────────────────────────── */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="font-bold text-2xl md:text-4xl bg-gradient-to-r from-[#0073CF] to-[#00A3E0] bg-clip-text text-transparent"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.3 }}
      >
        Welcome to Boomi Assistant
      </motion.div>

      {/* ── Subtitle ───────────────────────────────────────────── */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-sm md:text-xl text-muted-foreground mt-1 md:mt-2"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.4 }}
      >
        {/* Short on mobile, full on desktop */}
        <span className="md:hidden">AI-powered integration management</span>
        <span className="hidden md:inline">
          Manage your integrations, processes, and trading partners with
          AI-powered assistance
        </span>
      </motion.div>

      {/* ── Connect banner ─────────────────────────────────────── */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 md:mt-6 md:mb-4"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.45 }}
      >
        <BoomiConnectBanner />
      </motion.div>

      {/* ── Quick Actions (mobile only) ────────────────────────── */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-5 mb-3 md:hidden"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Quick Actions
        </h3>
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-2 md:hidden"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.55 }}
      >
        {quickActions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => handleQuickAction(action.prompt)}
            className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/80 p-3 text-left transition-all active:scale-[0.97] hover:border-[#0073CF]/30 hover:bg-[#0073CF]/5"
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${action.color}`}
            >
              <action.icon className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-medium leading-tight">
              {action.label}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Sidebar hint (mobile only) */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-5 md:hidden"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.65 }}
      >
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2 text-xs text-muted-foreground border-dashed"
          onClick={() => setOpenMobile(true)}
        >
          <Menu className="h-4 w-4" />
          Open menu for Tools, Prompts & Settings
        </Button>
      </motion.div>

      {/* ── Desktop-only content (Available Tools + Prompt Library) ─ */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="hidden md:block mt-4 mb-4"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.75 }}
      >
        <AvailableTools />
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="hidden md:block mt-4 mb-4"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.8 }}
      >
        <PromptLibrary chatId={chatId} sendMessage={sendMessage} />
      </motion.div>

      {/* ── Connected indicator ────────────────────────────────── */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center md:justify-start gap-2 text-xs md:text-sm text-muted-foreground mt-4"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.7 }}
      >
        <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-[#0073CF] animate-pulse" />
        <span>Connected to Boomi Platform</span>
      </motion.div>
    </div>
  );
};
