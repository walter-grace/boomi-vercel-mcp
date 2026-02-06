"use client";

import { useState } from "react";
import { Check, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "@/components/toast";

interface PromptItem {
  id: string;
  title: string;
  prompt: string;
  tools: string[];
  expected: string;
}

interface PromptSection {
  title: string;
  icon: string;
  description: string;
  prompts: PromptItem[];
}

const sections: PromptSection[] = [
  {
    title: "Quick Health Check",
    icon: "⚡",
    description: "Fast smoke tests to verify the whole system",
    prompts: [
      {
        id: "hc-1",
        title: "Profile Check",
        prompt:
          "List all my Boomi profiles and tell me which one is active.",
        tools: ["list_boomi_profiles"],
        expected: 'Returns at least "production" profile',
      },
      {
        id: "hc-2",
        title: "Full Account Inventory",
        prompt:
          "Give me a full inventory of my Boomi account — processes, atoms, environments, connections, and maps. Summarize counts.",
        tools: [
          "manage_process",
          "list_atoms",
          "list_environments",
          "list_connections",
          "list_maps",
        ],
        expected: "Calls 5+ tools, returns counts",
      },
      {
        id: "hc-3",
        title: "Process Deep Dive",
        prompt:
          "Find a process in my account, show me its ID, and give me a detailed structural breakdown.",
        tools: ["manage_process"],
        expected: "Calls manage_process (list), then manage_process (get)",
      },
    ],
  },
  {
    title: "Profile & Account",
    icon: "👤",
    description: "Profile management and account info",
    prompts: [
      {
        id: "pa-1",
        title: "List Profiles",
        prompt:
          "List all configured Boomi profiles and show me which ones are available.",
        tools: ["list_boomi_profiles"],
        expected: "Returns profile names",
      },
      {
        id: "pa-2",
        title: "Account Info",
        prompt:
          "Show me my Boomi account information — account ID, name, and any details available.",
        tools: ["boomi_account_info"],
        expected: "Returns account metadata",
      },
      {
        id: "pa-3",
        title: "Set Credentials",
        prompt:
          'Set my Boomi credentials to use the "production" profile.',
        tools: ["set_boomi_credentials"],
        expected: "Confirms credentials are set",
      },
    ],
  },
  {
    title: "Atom Management",
    icon: "⚛️",
    description: "Monitor and manage Boomi runtime engines",
    prompts: [
      {
        id: "am-1",
        title: "List All Atoms",
        prompt:
          "List all Boomi Atoms in my account. For each one, show me the name, ID, status, and type.",
        tools: ["list_atoms"],
        expected: "Table/list of atoms with status",
      },
      {
        id: "am-2",
        title: "Atom Details",
        prompt:
          "Get detailed information about my first Atom. Show me everything — hostName, version, dateInstalled, and current status.",
        tools: ["list_atoms", "get_atom"],
        expected: "Chains list_atoms then get_atom",
      },
      {
        id: "am-3",
        title: "Atom Status Check",
        prompt:
          "Check the status of all my Atoms. Are any of them offline or having issues?",
        tools: ["query_atom_status"],
        expected: "Status check across all atoms",
      },
      {
        id: "am-4",
        title: "Atom Health Report",
        prompt:
          "List my atoms, pick the one that has been online the longest, and give me a full health report including its version, hostName, and any recent status changes.",
        tools: ["list_atoms", "get_atom", "query_atom_status"],
        expected: "Chains 3 tools for comprehensive report",
      },
    ],
  },
  {
    title: "Process Management",
    icon: "🔄",
    description: "List, inspect, and analyze Boomi processes",
    prompts: [
      {
        id: "pm-1",
        title: "List All Processes",
        prompt:
          "List all processes in my Boomi account. Show me the name, ID, folder, and when each was last modified.",
        tools: ["manage_process"],
        expected: "Table of processes",
      },
      {
        id: "pm-2",
        title: "Process Structure Breakdown",
        prompt:
          "Find the first process in my account. Show me its complete structure — every shape, what connectors it uses, what maps are configured, and the data flow from start to stop.",
        tools: ["manage_process"],
        expected: "list then get with detailed analysis",
      },
      {
        id: "pm-3",
        title: "Process Comparison",
        prompt:
          "List my processes and compare the first two. What are the differences in their structure, complexity, and connectors used?",
        tools: ["manage_process"],
        expected: "Fetches two processes and compares",
      },
    ],
  },
  {
    title: "Environment Management",
    icon: "🌍",
    description: "Manage deployment targets and environments",
    prompts: [
      {
        id: "em-1",
        title: "List Environments",
        prompt:
          "List all environments in my Boomi account. Show the name, ID, classification, and which atoms are attached.",
        tools: ["list_environments"],
        expected: "Environment list with atom associations",
      },
      {
        id: "em-2",
        title: "Environment Details",
        prompt:
          "Get detailed information about my first environment. What atoms are attached to it? What is its classification?",
        tools: ["list_environments", "get_environment"],
        expected: "Chains list then get",
      },
      {
        id: "em-3",
        title: "Environment Audit",
        prompt:
          "Audit my environments: Are there any environments without atoms attached? Any atoms that are not in an environment?",
        tools: ["list_environments", "list_atoms"],
        expected: "Cross-references environments and atoms",
      },
    ],
  },
  {
    title: "Connections & Connectors",
    icon: "🔌",
    description: "Browse connections and connector operations",
    prompts: [
      {
        id: "cc-1",
        title: "List Connections",
        prompt:
          "List all connections in my Boomi account. Show the name, type, and ID of each.",
        tools: ["list_connections"],
        expected: "Connection list",
      },
      {
        id: "cc-2",
        title: "Connector Operations",
        prompt:
          "List all connector operations available. Group them by connector type.",
        tools: ["list_connector_operations"],
        expected: "Grouped connector operations",
      },
      {
        id: "cc-3",
        title: "Connection Deep Dive",
        prompt:
          "For each connection in my account, tell me what type it is (HTTP, Database, Disk, FTP, etc.) and which processes use it.",
        tools: ["list_connections", "manage_process"],
        expected: "Connects connection data with process analysis",
      },
    ],
  },
  {
    title: "Maps & Components",
    icon: "🗺️",
    description: "Explore maps, profiles, and component discovery",
    prompts: [
      {
        id: "mc-1",
        title: "List Maps",
        prompt:
          "List all maps in my Boomi account. Show the name, ID, and source/destination formats.",
        tools: ["list_maps"],
        expected: "Map list",
      },
      {
        id: "mc-2",
        title: "Search Components",
        prompt:
          'Search for all components in my account that have "Demo" in the name. Show me their type, ID, and folder.',
        tools: ["query_component"],
        expected: "Filtered component list",
      },
      {
        id: "mc-3",
        title: "List Profiles",
        prompt:
          "List all connector profiles configured in my Boomi account.",
        tools: ["list_profiles"],
        expected: "Profile list",
      },
      {
        id: "mc-4",
        title: "Orphaned Maps",
        prompt:
          "Which maps are used in my processes? Are there any orphaned maps that are not referenced by any process?",
        tools: ["list_maps", "manage_process"],
        expected: "Cross-references maps with processes",
      },
    ],
  },
  {
    title: "Deployments",
    icon: "🚀",
    description: "Deployment management and status monitoring",
    prompts: [
      {
        id: "dp-1",
        title: "List Deployments",
        prompt:
          "List all recent deployments. Show which component was deployed, to which environment, when, and the status.",
        tools: ["list_deployments"],
        expected: "Deployment history",
      },
      {
        id: "dp-2",
        title: "Deployment Status",
        prompt:
          "Check the status of my most recent deployment. Was it successful?",
        tools: ["list_deployments", "get_deployment_status"],
        expected: "Chains list then get_deployment_status",
      },
      {
        id: "dp-3",
        title: "Deployment Readiness",
        prompt:
          "I want to deploy a process. Check if I have at least one atom online, one environment configured, and list what processes are available to deploy.",
        tools: ["list_atoms", "list_environments", "manage_process"],
        expected: "Multi-tool readiness check",
      },
      {
        id: "dp-4",
        title: "Redeploy Processes by Name",
        prompt:
          "Redeploy these processes to my production environment:\n- Order Sync\n- Customer Update\n- Invoice Generator",
        tools: [
          "manage_process",
          "list_environments",
          "create_packaged_component",
          "deploy_packaged_component",
          "get_deployment_status",
        ],
        expected:
          "Lists processes to match names, confirms with user, packages and deploys batch",
      },
      {
        id: "dp-5",
        title: "Deploy Single Process",
        prompt:
          "Deploy my Order Sync process to the staging environment.",
        tools: ["manage_process", "list_environments", "deploy_process"],
        expected:
          "Finds process by name, finds environment, uses deploy_process shortcut",
      },
    ],
  },
  {
    title: "Atom Actions",
    icon: "🎮",
    description: "Operational atom management — execute, restart, cancel, schedule",
    prompts: [
      {
        id: "aa-1",
        title: "Execute a Process",
        prompt:
          "List my processes and my atoms. Then execute the first process on my first atom.",
        tools: ["manage_process", "list_atoms", "execute_process"],
        expected: "Chains list calls then triggers execute_process",
      },
      {
        id: "aa-2",
        title: "Restart All Listeners",
        prompt:
          "Restart all listeners on my production atom.",
        tools: ["list_atoms", "change_listener_status"],
        expected: "Finds atom, calls change_listener_status with action=restart",
      },
      {
        id: "aa-3",
        title: "Pause & Resume Listeners",
        prompt:
          "Pause all listeners on my atom, wait for my confirmation, then resume them.",
        tools: ["list_atoms", "change_listener_status"],
        expected: "Two calls to change_listener_status: pause then resume",
      },
      {
        id: "aa-4",
        title: "Cancel a Running Execution",
        prompt:
          "Show me the most recent running execution and cancel it if I confirm.",
        tools: ["list_execution_records", "cancel_execution"],
        expected: "Lists executions, asks for confirmation, then cancels",
      },
      {
        id: "aa-5",
        title: "Pause All Schedules",
        prompt:
          "Pause all scheduled processes on my production atom.",
        tools: ["list_atoms", "manage_schedules"],
        expected: "Finds atom, calls manage_schedules with action=pause",
      },
      {
        id: "aa-6",
        title: "Download Atom Logs (Local Only)",
        prompt:
          "Give me the download link for today's runtime logs on my local atom. I'll open it in my browser.",
        tools: ["list_atoms", "download_atom_logs"],
        expected: "Finds local atom, returns download URL",
      },
      {
        id: "aa-6b",
        title: "Read & Analyze Logs (Local Atoms)",
        prompt:
          "Read the logs for my local atom and tell me if there are any errors, warnings, or unusual patterns.",
        tools: ["list_atoms", "read_atom_logs"],
        expected: "Finds atom, reads log contents inline, analyzes for issues (local only)",
      },
      {
        id: "aa-6c",
        title: "Debug Cloud Atom (Execution Records)",
        prompt:
          "My cloud atom had errors today. Check the recent execution records and tell me what failed and why.",
        tools: ["list_atoms", "list_execution_records", "get_execution_record"],
        expected: "Falls back to execution records for cloud atom debugging",
      },
      {
        id: "aa-7",
        title: "Clear Queue Messages",
        prompt:
          "Clear the error queue on my production atom after I confirm.",
        tools: ["list_atoms", "clear_queue_messages"],
        expected: "Finds atom, asks confirmation, clears queue",
      },
      {
        id: "aa-8",
        title: "Full Atom Ops Workflow",
        prompt:
          "Perform a full operational check on my atom:\n1. Get atom status\n2. List any running executions\n3. Check listener status by restarting all listeners\n4. Read today's logs and check for errors\n\nSummarize the results.",
        tools: [
          "list_atoms",
          "query_atom_status",
          "list_execution_records",
          "change_listener_status",
          "read_atom_logs",
        ],
        expected: "Multi-tool operational workflow with 5+ tool calls, includes log analysis",
      },
    ],
  },
  {
    title: "Execution Records",
    icon: "📊",
    description: "View and analyze process execution history",
    prompts: [
      {
        id: "er-1",
        title: "Recent Executions",
        prompt:
          "Show me the last 10 process execution records. For each, show the process name, status, start time, and duration.",
        tools: ["list_execution_records"],
        expected: "Execution history",
      },
      {
        id: "er-2",
        title: "Execution Details",
        prompt:
          "Get detailed information about my most recent process execution. Show me the full execution details including any errors.",
        tools: ["list_execution_records", "get_execution_record"],
        expected: "Chains list then get",
      },
      {
        id: "er-3",
        title: "Execution Analysis",
        prompt:
          "Analyze my recent executions. What is my success rate? Are there any processes that consistently fail? What are the average execution times?",
        tools: ["list_execution_records"],
        expected: "Statistical analysis",
      },
    ],
  },
  {
    title: "Trading Partners & Orgs",
    icon: "🤝",
    description: "Manage trading partners and organizations",
    prompts: [
      {
        id: "tp-1",
        title: "Trading Partners",
        prompt:
          "List all trading partners configured in my Boomi account.",
        tools: ["manage_trading_partner"],
        expected: "Trading partner list",
      },
      {
        id: "tp-2",
        title: "Organization Structure",
        prompt: "Show me my organization structure in Boomi.",
        tools: ["manage_organization"],
        expected: "Organization details",
      },
    ],
  },
  {
    title: "Multi-Tool Workflows",
    icon: "🔗",
    description: "Complex scenarios that chain multiple tools",
    prompts: [
      {
        id: "mw-1",
        title: "Full Account Audit",
        prompt:
          "Perform a complete audit of my Boomi account:\n1. List all atoms and their statuses\n2. List all environments and which atoms are attached\n3. Count all processes, connections, and maps\n4. Show recent deployments and their success rates\n5. Summarize everything in a clean report\n\nCreate a document with the full audit results.",
        tools: [
          "list_atoms",
          "list_environments",
          "manage_process",
          "list_connections",
          "list_maps",
          "list_deployments",
          "createDocument",
        ],
        expected: "Calls 6-8 tools, creates a document artifact",
      },
      {
        id: "mw-2",
        title: "Process Dependency Map",
        prompt:
          "Pick my most complex process (the one with the most shapes/steps). Map out all its dependencies:\n- What connections does it use?\n- What maps does it reference?\n- What connector operations are involved?\n- Which atom/environment is it deployed to?\n\nGive me a visual dependency tree.",
        tools: [
          "manage_process",
          "list_connections",
          "list_maps",
          "list_deployments",
        ],
        expected: "Multi-tool dependency analysis",
      },
      {
        id: "mw-3",
        title: "Health Dashboard",
        prompt:
          "Create a real-time health dashboard of my Boomi environment:\n- Atom status (online/offline)\n- Recent execution success/failure rates\n- Deployment status\n- Any errors or warnings\n\nPut this in a spreadsheet document.",
        tools: [
          "list_atoms",
          "list_execution_records",
          "list_deployments",
          "createDocument",
        ],
        expected: "Creates a sheet artifact with real data",
      },
      {
        id: "mw-4",
        title: "Migration Readiness",
        prompt:
          "I want to migrate my processes to a new environment. Help me assess readiness:\n1. What processes do I have?\n2. What environment are they currently deployed to?\n3. Are there other environments available?\n4. What connections and maps would need to be reconfigured?",
        tools: [
          "manage_process",
          "list_deployments",
          "list_environments",
          "list_connections",
          "list_maps",
        ],
        expected: "Comprehensive migration analysis",
      },
    ],
  },
  {
    title: "Edge Cases & Error Handling",
    icon: "⚠️",
    description: "Test error handling and edge cases",
    prompts: [
      {
        id: "ec-1",
        title: "Invalid ID",
        prompt:
          'Get details for atom ID "fake-invalid-id-12345". What happens?',
        tools: ["get_atom"],
        expected: "Graceful error message",
      },
      {
        id: "ec-2",
        title: "Empty Results",
        prompt:
          'Search for components with the name "ZZZZNONEXISTENT99999". What do you find?',
        tools: ["query_component"],
        expected: "Empty results, helpful message",
      },
      {
        id: "ec-3",
        title: "Rapid Multi-Call",
        prompt:
          "List all atoms, then all processes, then all environments, then all connections, then all maps, then all deployments, then all execution records — all in one message.",
        tools: [
          "list_atoms",
          "manage_process",
          "list_environments",
          "list_connections",
          "list_maps",
          "list_deployments",
          "list_execution_records",
        ],
        expected: "Handles multiple rapid tool calls gracefully",
      },
    ],
  },
];

function PromptCard({
  prompt,
  onCopy,
  copiedId,
}: {
  prompt: PromptItem;
  onCopy: (id: string, text: string) => void;
  copiedId: string | null;
}) {
  return (
    <div className="group relative rounded-lg border border-border/60 bg-card p-4 hover:border-[#0073CF]/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium mb-1">{prompt.title}</h4>
          <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {prompt.prompt}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 h-8 w-8 p-0"
          onClick={() => onCopy(prompt.id, prompt.prompt)}
        >
          {copiedId === prompt.id ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {prompt.tools.map((tool) => (
          <span
            key={tool}
            className="inline-flex items-center rounded-full bg-[#0073CF]/10 px-2 py-0.5 text-[10px] font-medium text-[#0073CF]"
          >
            {tool}
          </span>
        ))}
      </div>

      <p className="mt-2 text-[10px] text-muted-foreground/70">
        <span className="font-medium">Expected:</span> {prompt.expected}
      </p>
    </div>
  );
}

export function ToolingPrompts() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "Quick Health Check": true,
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ type: "success", description: "Prompt copied to clipboard!" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    for (const section of sections) {
      all[section.title] = true;
    }
    setOpenSections(all);
  };

  const collapseAll = () => {
    setOpenSections({});
  };

  const totalPrompts = sections.reduce(
    (acc, s) => acc + s.prompts.length,
    0,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {totalPrompts} test prompts across {sections.length} categories.
            Copy any prompt and paste it in the chatbot to test.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={expandAll}
          >
            Expand All
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={collapseAll}
          >
            Collapse All
          </Button>
        </div>
      </div>

      {sections.map((section) => (
        <Card key={section.title}>
          <Collapsible
            open={openSections[section.title] ?? false}
            onOpenChange={() => toggleSection(section.title)}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{section.icon}</span>
                    <div>
                      <CardTitle className="text-base">
                        {section.title}
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {section.description} · {section.prompts.length}{" "}
                        prompts
                      </CardDescription>
                    </div>
                  </div>
                  {openSections[section.title] ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-3">
                {section.prompts.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    onCopy={handleCopy}
                    copiedId={copiedId}
                  />
                ))}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}
    </div>
  );
}

