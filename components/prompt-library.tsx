"use client";

import { useState, useMemo } from "react";
import type { UseChatHelpers } from "@ai-sdk/react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight, Sparkles, Copy, Check, Loader2, Wand2 } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useBoomiData } from "@/hooks/use-boomi-data";
import { PromptWizard } from "./prompt-wizard";

interface PromptLibraryProps {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
}

interface Prompt {
  title: string;
  description: string;
  prompt: string;
  category: string;
  icon: string;
}

// Function to generate dynamic prompts based on real Boomi data
function generateDynamicPrompts(data: {
  processes: Array<{ id: string; name: string }>;
  atoms: Array<{ id: string; name: string }>;
  environments: Array<{ id: string; name: string }>;
  connections: Array<{ id: string; name: string }>;
  maps: Array<{ id: string; name: string }>;
}): Record<string, Prompt[]> {
  const firstProcess = data.processes[0];
  const firstAtom = data.atoms[0];
  const firstEnv = data.environments[0];
  const firstConnection = data.connections[0];
  const firstMap = data.maps[0];
  const secondProcess = data.processes[1];
  const secondEnv = data.environments[1];

  return {
  "Deployment Workflows": [
    {
      title: "Deploy Process to Production",
      description: "Complete deployment workflow: package and deploy a process to production environment",
      prompt: firstProcess
        ? `List all my processes, then deploy the process called '${firstProcess.name}' (ID: ${firstProcess.id}) to the production environment. Show me the deployment status after it completes.`
        : "List all my processes, then deploy a process to the production environment. Show me the deployment status after it completes.",
      category: "Deployment",
      icon: "🚀",
    },
    {
      title: "Multi-Environment Deployment",
      description: "Deploy the same process to multiple environments",
      prompt: firstProcess && firstEnv && secondEnv
        ? `List all environments, then deploy process '${firstProcess.name}' (${firstProcess.id}) to both '${firstEnv.name}' and '${secondEnv.name}' environments. Check the status of both deployments.`
        : firstProcess
        ? `List all environments, then deploy process '${firstProcess.name}' (${firstProcess.id}) to multiple environments. Check the status of both deployments.`
        : "List all environments, then deploy a process to multiple environments. Check the status of both deployments.",
      category: "Deployment",
      icon: "🌍",
    },
    {
      title: "Deploy to Specific Atom",
      description: "Deploy a process to a specific atom",
      prompt: firstProcess && firstAtom
        ? `Deploy process '${firstProcess.name}' (${firstProcess.id}) to atom '${firstAtom.name}' (${firstAtom.id}). Check the deployment status.`
        : "Deploy a process to a specific atom and check the deployment status.",
      category: "Deployment",
      icon: "🎯",
    },
  ],
  "Monitoring & Analytics": [
    {
      title: "Comprehensive System Health",
      description: "Get a complete overview of your Boomi infrastructure",
      prompt: data.atoms.length > 0
        ? `List all my atoms and show their status. Check the health of ${data.atoms.length > 1 ? `${data.atoms.length} atoms` : `atom '${data.atoms[0].name}'`}. Then list all environments and check recent execution records. Give me a summary of system health.`
        : "List all my atoms and show their status. Then list all environments and check recent execution records. Give me a summary of system health.",
      category: "Monitoring",
      icon: "📊",
    },
    {
      title: "Atom Status Check",
      description: "Check the status of your atoms",
      prompt: firstAtom
        ? `Check the status and health of atom '${firstAtom.name}' (${firstAtom.id}). Get detailed information about its capabilities and current state.`
        : "List all atoms and check their status and health.",
      category: "Monitoring",
      icon: "⚡",
    },
    {
      title: "Process Execution Monitoring",
      description: "Monitor executions for a specific process",
      prompt: firstProcess
        ? `Get execution records for process '${firstProcess.name}' (${firstProcess.id}). Show me recent executions, their status, and any errors.`
        : "List all processes, then get execution records for the most recent process. Show me recent executions and their status.",
      category: "Monitoring",
      icon: "🔍",
    },
  ],
  "Component Discovery": [
    {
      title: "Build Process Inventory",
      description: "Discover all available components for building processes",
      prompt: data.connections.length > 0 || data.maps.length > 0
        ? `List all connections, maps, and connector operations. I have ${data.connections.length} connections and ${data.maps.length} maps available. Show me what components I can use to build a new integration process.`
        : "List all connections, maps, and connector operations available in production. Show me what components I can use to build a new integration process.",
      category: "Discovery",
      icon: "🔧",
    },
    {
      title: "Review Specific Connection",
      description: "Get details about a specific connection",
      prompt: firstConnection
        ? `Get details for connection '${firstConnection.name}' (${firstConnection.id}). Show me its configuration and what it's used for.`
        : "List all connections and get details for the first one.",
      category: "Discovery",
      icon: "🔌",
    },
    {
      title: "Review Specific Map",
      description: "Get details about a specific map",
      prompt: firstMap
        ? `Get details for map '${firstMap.name}' (${firstMap.id}). Show me its structure and transformations.`
        : "List all maps and get details for the first one.",
      category: "Discovery",
      icon: "🗺️",
    },
  ],
  "Process Management": [
    {
      title: "Process Lifecycle Management",
      description: "Complete process management workflow",
      prompt: firstProcess && firstEnv
        ? `List all processes, get details for '${firstProcess.name}' (${firstProcess.id}), then deploy it to '${firstEnv.name}' environment. After deployment, check the execution records for that process.`
        : firstProcess
        ? `Get details for process '${firstProcess.name}' (${firstProcess.id}), then deploy it to staging. After deployment, check the execution records.`
        : "List all processes, get details for a process, then deploy it to staging. After deployment, check the execution records.",
      category: "Process",
      icon: "🔄",
    },
    {
      title: "Compare Two Processes",
      description: "Compare details of two processes",
      prompt: firstProcess && secondProcess
        ? `Get details for process '${firstProcess.name}' (${firstProcess.id}) and process '${secondProcess.name}' (${secondProcess.id}). Compare their configurations and purposes.`
        : "List all processes and compare the details of the first two processes.",
      category: "Process",
      icon: "⚖️",
    },
    {
      title: "Process Deployment Pipeline",
      description: "Deploy multiple processes",
      prompt: data.processes.length > 1
        ? `List all processes. Deploy '${firstProcess?.name || "the first process"}' and '${secondProcess?.name || "the second process"}' to the staging environment. Show me the deployment status for both.`
        : "List all processes and deploy them to the staging environment. Show me the deployment status.",
      category: "Process",
      icon: "⚙️",
    },
  ],
  "Trading Partner Management": [
    {
      title: "Trading Partner Audit",
      description: "Complete audit of all trading partners",
      prompt: "List all trading partners, get detailed information for each one, and create a summary report of all active trading partner configurations.",
      category: "Trading Partners",
      icon: "🤝",
    },
    {
      title: "B2B Integration Setup",
      description: "Set up new trading partner integration",
      prompt: "List all trading partners to see existing configurations, then help me understand what's needed to create a new trading partner for EDI integration.",
      category: "Trading Partners",
      icon: "📡",
    },
  ],
  "Advanced Workflows": [
    {
      title: "End-to-End Integration Check",
      description: "Complete system check from atoms to processes to executions",
      prompt: data.atoms.length > 0 && data.processes.length > 0
        ? `Check the status of ${data.atoms.length} atom${data.atoms.length > 1 ? "s" : ""}, list all environments, review ${data.processes.length} process${data.processes.length > 1 ? "es" : ""}, check recent deployments, and review execution records. Give me a comprehensive system status report.`
        : "Check the status of all atoms, list all environments, list all processes, check recent deployments, and review execution records. Give me a comprehensive system status report.",
      category: "Advanced",
      icon: "🎯",
    },
    {
      title: "Deploy and Monitor Workflow",
      description: "Deploy a process and monitor its executions",
      prompt: firstProcess && firstAtom
        ? `Deploy process '${firstProcess.name}' (${firstProcess.id}) to atom '${firstAtom.name}' (${firstAtom.id}). Then monitor execution records for this process and check for any errors.`
        : firstProcess
        ? `Deploy process '${firstProcess.name}' (${firstProcess.id}) to an atom. Then monitor execution records and check for any errors.`
        : "Deploy a process to an atom, then monitor execution records and check for any errors.",
      category: "Advanced",
      icon: "🔄",
    },
    {
      title: "Environment and Deployment Audit",
      description: "Audit all environments and their deployments",
      prompt: data.environments.length > 0
        ? `List all ${data.environments.length} environment${data.environments.length > 1 ? "s" : ""} (${data.environments.map(e => e.name).join(", ")}). For each environment, check recent deployments and their status.`
        : "List all environments. For each environment, check recent deployments and their status.",
      category: "Advanced",
      icon: "🛡️",
    },
  ],
};
}

export function PromptLibrary({ chatId, sendMessage }: PromptLibraryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [customPrompts, setCustomPrompts] = useState<Prompt[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const boomiData = useBoomiData();

  // Generate dynamic prompts based on real Boomi data
  const sophisticatedPrompts = useMemo(() => {
    return generateDynamicPrompts(boomiData);
  }, [boomiData]);

  // Merge custom prompts with sophisticated prompts
  const allPrompts = useMemo(() => {
    const base = { ...sophisticatedPrompts };
    if (customPrompts.length > 0) {
      base["My Custom Prompts"] = customPrompts;
    }
    return base;
  }, [sophisticatedPrompts, customPrompts]);

  const [activeTab, setActiveTab] = useState<string>(
    Object.keys(allPrompts)[0] || "Deployment Workflows"
  );

  const handlePromptClick = (prompt: string) => {
    window.history.pushState({}, "", `/chat/${chatId}`);
    sendMessage({
      role: "user",
      parts: [{ type: "text", text: prompt }],
    });
  };

  const handleCopy = (prompt: string, title: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(title);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  return (
    <Card className="border-[#0073CF]/20 bg-gradient-to-r from-[#0073CF]/5 to-[#00A3E0]/5">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-[#0073CF]/5 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-[#0073CF]" />
                <CardTitle className="text-lg font-semibold">
                  Prompt Library
                </CardTitle>
              </div>
              {isOpen ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Prompt Wizard */}
            {showWizard ? (
              <PromptWizard
                chatId={chatId}
                sendMessage={sendMessage}
                onComplete={(prompts) => {
                  setCustomPrompts(prompts);
                  setShowWizard(false);
                  if (prompts.length > 0) {
                    setActiveTab("My Custom Prompts");
                  }
                }}
              />
            ) : (
              <div className="flex justify-between items-center pb-2 border-b border-[#0073CF]/10">
                <p className="text-xs text-muted-foreground">
                  Generate personalized prompts based on your Boomi environment
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowWizard(true)}
                  className="text-xs"
                >
                  <Wand2 className="h-3 w-3 mr-1" />
                  Run Wizard
                </Button>
              </div>
            )}

            {boomiData.loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-[#0073CF] mr-2" />
                <span className="text-sm text-muted-foreground">
                  Loading your Boomi data to personalize prompts...
                </span>
              </div>
            )}
            
            {!boomiData.loading && boomiData.error && (
              <div className="text-sm text-muted-foreground py-4 text-center">
                Using default prompts. Connect your Boomi account for personalized prompts.
              </div>
            )}

            {!boomiData.loading && !showWizard && (
              <>
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-[#0073CF]/10">
                  {Object.keys(allPrompts).map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveTab(category)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        activeTab === category
                          ? "bg-[#0073CF] text-white"
                          : "bg-background text-muted-foreground hover:bg-[#0073CF]/10 hover:text-[#0073CF]"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Prompts for active tab */}
                <div className="space-y-3">
                  {allPrompts[activeTab]?.map((promptItem) => (
                <div
                  key={promptItem.title}
                  className="p-4 rounded-lg bg-background/50 border border-[#0073CF]/10 hover:border-[#0073CF]/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="text-2xl flex-shrink-0 mt-0.5">
                        {promptItem.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-foreground mb-1">
                          {promptItem.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {promptItem.description}
                        </p>
                        <div className="text-xs font-mono text-[#0073CF]/80 bg-[#0073CF]/5 p-2 rounded border border-[#0073CF]/10 break-words">
                          {promptItem.prompt}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => handlePromptClick(promptItem.prompt)}
                      className="flex-1 bg-[#0073CF] hover:bg-[#005fa3] text-white"
                    >
                      Use Prompt
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(promptItem.prompt, promptItem.title)}
                      className="flex items-center gap-1"
                    >
                      {copiedPrompt === promptItem.title ? (
                        <>
                          <Check className="h-3 w-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

