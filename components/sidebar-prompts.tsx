"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronRight,
  Sparkles,
  BarChart3,
  Zap,
  Rocket,
  ListChecks,
  Plug,
  RotateCcw,
} from "lucide-react";

interface SidebarPromptsProps {
  onPromptClick: (prompt: string) => void;
}

const sidebarPrompts = [
  {
    icon: BarChart3,
    label: "System Health Check",
    prompt:
      "Check the status of all my atoms, list environments, and review recent execution records. Give me a summary of system health.",
    color: "text-blue-500",
  },
  {
    icon: Zap,
    label: "List All Atoms",
    prompt: "List all my atoms and show their status.",
    color: "text-amber-500",
  },
  {
    icon: ListChecks,
    label: "List All Processes",
    prompt: "List all my processes and show their details.",
    color: "text-violet-500",
  },
  {
    icon: Rocket,
    label: "Deploy a Process",
    prompt:
      "List all my processes and environments so I can choose which process to deploy.",
    color: "text-emerald-500",
  },
  {
    icon: Plug,
    label: "List Connections",
    prompt: "List all my connections and show what connectors are available.",
    color: "text-pink-500",
  },
  {
    icon: BarChart3,
    label: "Recent Executions",
    prompt:
      "Show me recent execution records and highlight any errors or failures.",
    color: "text-sky-500",
  },
  {
    icon: RotateCcw,
    label: "Restart Listeners",
    prompt: "List my atoms, then restart all listeners on the production atom.",
    color: "text-orange-500",
  },
];

export function SidebarPrompts({ onPromptClick }: SidebarPromptsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="border-[#0073CF]/20 bg-gradient-to-r from-[#0073CF]/5 to-[#00A3E0]/5">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-[#0073CF]/5 transition-colors p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#0073CF]" />
                <CardTitle className="text-sm font-semibold">
                  Quick Prompts
                </CardTitle>
              </div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-2 px-2 space-y-1">
            {sidebarPrompts.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => onPromptClick(item.prompt)}
                className="flex items-center gap-2.5 w-full rounded-lg px-2 py-2 text-left transition-colors hover:bg-[#0073CF]/10 active:scale-[0.98]"
              >
                <item.icon className={`h-4 w-4 shrink-0 ${item.color}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

