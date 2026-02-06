"use client";

import { useState, useEffect } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight, RefreshCw, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

function categorizeTool(name: string): string {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("profile") || lowerName.includes("credential") || lowerName.includes("account")) {
    return "Profile Management";
  }
  // Atom Action tools (new operational tools) - check before generic "atom" match
  if (
    lowerName === "execute_process" ||
    lowerName === "change_listener_status" ||
    lowerName === "cancel_execution" ||
    lowerName === "manage_schedules" ||
    lowerName === "download_atom_logs" ||
    lowerName === "read_atom_logs" ||
    lowerName === "clear_queue_messages"
  ) {
    return "Atom Actions";
  }
  if (lowerName.includes("atom")) {
    return "Atom API";
  }
  if (lowerName.includes("environment")) {
    return "Environment";
  }
  if (lowerName.includes("deploy") || lowerName.includes("package")) {
    return "Deployment";
  }
  if (lowerName.includes("execution") || lowerName.includes("record")) {
    return "Executions";
  }
  if (lowerName.includes("connection") || lowerName.includes("map") || lowerName.includes("component") || lowerName.includes("connector") || lowerName.includes("business") || lowerName.includes("certificate")) {
    return "Components";
  }
  if (lowerName.includes("process")) {
    return "Process Management";
  }
  if (lowerName.includes("trading") || lowerName.includes("organization")) {
    return "Management";
  }
  if (lowerName.includes("listener") || lowerName.includes("schedule") || lowerName.includes("queue")) {
    return "Atom Actions";
  }
  return "Other";
}

function formatToolName(name: string): string {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getRequiredParams(inputSchema: MCPTool["inputSchema"]): string[] {
  return inputSchema.required || [];
}

function formatParamName(param: string): string {
  return param
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getExamplePrompts(toolName: string): string[] {
  const prompts: Record<string, string[]> = {
    // Profile Management
    list_boomi_profiles: [
      "List my Boomi profiles",
      "Show me all my saved profiles",
      "What profiles do I have configured?",
    ],
    set_boomi_credentials: [
      "Set my Boomi credentials for production",
      "Save my Boomi API credentials",
      "Configure Boomi credentials",
    ],
    delete_boomi_profile: [
      "Delete the 'test' profile",
      "Remove my staging profile",
      "Delete profile named production",
    ],
    boomi_account_info: [
      "Show me my Boomi account information",
      "What's my Boomi account details?",
      "Get account info for production profile",
    ],
    // Atom API
    list_atoms: [
      "List all my atoms",
      "Show me all my Boomi runtimes",
      "List all cloud runtimes",
    ],
    get_atom: [
      "Get details for atom xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "Show me information about atom ID abc123",
      "What are the details for my production atom?",
    ],
    query_atom_status: [
      "Check the status of my production atom",
      "What's the health status of atom xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx?",
      "Is my atom running?",
    ],
    // Environment
    list_environments: [
      "List all environments",
      "Show me my Boomi environments",
      "What environments are available?",
    ],
    get_environment: [
      "Get details for environment xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "Show me information about environment ID abc123",
      "What are the details for my production environment?",
    ],
    // Deployment
    list_deployments: [
      "List all deployments",
      "Show me my recent deployments",
      "What deployments have been made?",
    ],
    get_deployment_status: [
      "What's the status of deployment xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx?",
      "Check deployment status for ID abc123",
      "Is my deployment complete?",
    ],
    create_packaged_component: [
      "Create a package for process xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "Package my process for deployment",
      "Create deployment package with process ID abc123",
    ],
    deploy_packaged_component: [
      "Deploy package xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx to production",
      "Deploy my package to environment abc123",
      "Deploy package to staging environment",
    ],
    deploy_process: [
      "Deploy process xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx to production",
      "Deploy my process to staging environment",
      "Redeploy these processes: Order Sync, Customer Update, Invoice Generator",
    ],
    // Components
    query_component: [
      "Query components of type Connection",
      "Find all Process components",
      "Search for components with type Map",
    ],
    list_connections: [
      "List all connections",
      "Show me my Boomi connections",
      "What connections are available?",
    ],
    list_maps: [
      "List all maps",
      "Show me my Boomi maps",
      "What maps are available?",
    ],
    list_connector_operations: [
      "List all connector operations",
      "Show me connector operations",
      "What connector operations are available?",
    ],
    list_profiles: [
      "List all profile components",
      "Show me Boomi profile components",
      "What profile components are available?",
    ],
    // Executions
    list_execution_records: [
      "List execution records",
      "Show me recent process executions",
      "What executions have run?",
    ],
    get_execution_record: [
      "Get details for execution xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "Show me execution record ID abc123",
      "What happened in execution xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx?",
    ],
    // Management
    manage_trading_partner: [
      "List all trading partners",
      "Create a new trading partner",
      "Get trading partner xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    ],
    manage_process: [
      "List all processes",
      "Create a new process",
      "Get process xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    ],
    manage_organization: [
      "List all organizations",
      "Create a new organization",
      "Get organization xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    ],
    // Atom Action Tools
    execute_process: [
      "Run process abc-123 on my production atom",
      "Execute the Order Sync process on atom xyz-456",
      "Trigger a process run on my atom",
    ],
    change_listener_status: [
      "Restart all listeners on my production atom",
      "Pause listener abc-123 on atom xyz-456",
      "Resume all listeners on my atom",
    ],
    cancel_execution: [
      "Cancel execution abc-123",
      "Kill the running process execution",
      "Stop execution ID xyz-456",
    ],
    manage_schedules: [
      "Pause all schedules on my production atom",
      "Resume schedule for process abc-123",
      "Pause schedules on atom xyz-456",
    ],
    download_atom_logs: [
      "Get the download link for my local atom's logs",
      "Give me a log download URL for my production atom",
      "Download logs for atom xyz-456 from 2026-02-01 (local atoms only)",
    ],
    read_atom_logs: [
      "Read the logs for my local atom and find any errors",
      "Analyze today's runtime logs — any warnings or failures? (local atoms only)",
      "What happened on my atom yesterday? Check the logs.",
    ],
    clear_queue_messages: [
      "Clear the error queue on my production atom",
      "Clear all messages from queue 'orders' on atom xyz-456",
      "Empty the retry queue on my atom",
    ],
  };

  return prompts[toolName] || [
    `Use ${toolName} to interact with Boomi`,
    `Try: "Use ${toolName}"`,
  ];
}

export function AvailableTools() {
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  const loadTools = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
        // Invalidate DB cache first
        await fetch("/api/mcp-tools/invalidate", { method: "POST" });
      }
      const response = await fetch("/api/mcp-tools");
      if (response.ok) {
        const data = await response.json();
        setTools(data.tools || []);
        setIsCached(data.cached ?? false);
      }
    } catch (error) {
      console.error("Failed to load tools:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Only fetch tools in the browser (not during SSR/build)
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    loadTools();
  }, []);

  const categorizedTools = tools.reduce(
    (acc, tool) => {
      const category = categorizeTool(tool.name);
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(tool);
      return acc;
    },
    {} as Record<string, MCPTool[]>
  );

  const toggleCategory = (category: string) => {
    const newOpen = new Set(openCategories);
    if (newOpen.has(category)) {
      newOpen.delete(category);
    } else {
      newOpen.add(category);
    }
    setOpenCategories(newOpen);
  };

  if (loading) {
    return (
      <Card className="border-[#0073CF]/20">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Loading tools...</div>
        </CardContent>
      </Card>
    );
  }

  if (tools.length === 0) {
    return null;
  }

  const categoryOrder = [
    "Profile Management",
    "Atom API",
    "Atom Actions",
    "Environment",
    "Deployment",
    "Components",
    "Process Management",
    "Executions",
    "Management",
    "Other",
  ];

  return (
    <Card className="border-[#0073CF]/20 bg-gradient-to-r from-[#0073CF]/5 to-[#00A3E0]/5">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-[#0073CF]/5 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wrench className="h-5 w-5 text-[#0073CF]" />
                <CardTitle className="text-lg font-semibold">
                  Available Tools ({tools.length})
                </CardTitle>
                {isCached && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-500/10 text-green-600">
                    cached
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isOpen && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={refreshing}
                    onClick={(e) => {
                      e.stopPropagation();
                      loadTools(true);
                    }}
                    aria-label="Refresh tools from server"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                  </Button>
                )}
                {isOpen ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {categoryOrder.map((category) => {
              const categoryTools = categorizedTools[category];
              if (!categoryTools || categoryTools.length === 0) {
                return null;
              }

              const isCategoryOpen = openCategories.has(category);

              return (
                <div key={category} className="border rounded-lg border-[#0073CF]/10">
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-3 hover:bg-[#0073CF]/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isCategoryOpen ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium text-sm">{category}</span>
                      <span className="text-xs text-muted-foreground">
                        ({categoryTools.length})
                      </span>
                    </div>
                  </button>
                  {isCategoryOpen && (
                    <div className="px-3 pb-3 space-y-2">
                      {categoryTools.map((tool) => {
                        const requiredParams = getRequiredParams(tool.inputSchema);
                        return (
                          <div
                            key={tool.name}
                            className="p-3 rounded-md bg-background/50 border border-[#0073CF]/5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-mono text-xs font-semibold text-[#0073CF] mb-1">
                                  {tool.name}
                                </div>
                                <div className="text-xs text-muted-foreground mb-2">
                                  {tool.description}
                                </div>
                                {requiredParams.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-[#0073CF]/10">
                                    <div className="text-xs font-medium text-muted-foreground mb-1">
                                      Required Parameters:
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {requiredParams.map((param) => (
                                        <span
                                          key={param}
                                          className="px-2 py-0.5 rounded bg-[#0073CF]/10 text-xs font-mono text-[#0073CF]"
                                        >
                                          {formatParamName(param)}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="mt-2 pt-2 border-t border-[#0073CF]/10">
                                  <div className="text-xs font-medium text-muted-foreground mb-1">
                                    Example Prompts:
                                  </div>
                                  <div className="space-y-1">
                                    {getExamplePrompts(tool.name).map((prompt, idx) => (
                                      <div
                                        key={idx}
                                        className="text-xs text-foreground/80 italic pl-2 border-l-2 border-[#0073CF]/20"
                                      >
                                        "{prompt}"
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

