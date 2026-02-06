import { getUserBoomiCredentials } from "@/lib/db/queries";
import { auth } from "@/app/(auth)/auth";
import { setUserBoomiCredentials } from "@/lib/ai/mcp-client";

function getMCPServerURL(): string {
  if (typeof process !== "undefined" && process.env?.BOOMI_MCP_SERVER_URL) {
    return process.env.BOOMI_MCP_SERVER_URL;
  }
  return "https://boomi-mcp-server-replitzip.replit.app/mcp";
}

async function callMCPTool(toolName: string, args: Record<string, unknown>): Promise<string> {
  const MCP_SERVER_URL = getMCPServerURL();
  
  const response = await fetch(MCP_SERVER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`MCP server returned ${response.status}`);
  }

  const data = await response.json() as {
    jsonrpc: string;
    result?: { content: Array<{ type: string; text: string }> };
    error?: { code: number; message: string };
    id: number;
  };

  if (data.error) {
    throw new Error(data.error.message || "MCP server error");
  }

  if (data.result?.content?.[0]?.text) {
    return data.result.content[0].text;
  }

  return "";
}

interface WizardTestResult {
  category: string;
  success: boolean;
  data: any;
  error?: string;
  count?: number;
}

interface WizardResult {
  success: boolean;
  tests: WizardTestResult[];
  generatedPrompts: Array<{
    title: string;
    description: string;
    prompt: string;
    category: string;
    icon: string;
  }>;
  summary: {
    processes: number;
    atoms: number;
    environments: number;
    connections: number;
    maps: number;
    deployments: number;
    executions: number;
  };
}

/**
 * POST /api/prompt-wizard
 * Runs comprehensive tests of the user's Boomi environment and generates custom prompts
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's Boomi credentials
    const credentials = await getUserBoomiCredentials(session.user.id);
    if (!credentials) {
      return Response.json(
        { error: "No Boomi credentials found. Please configure your credentials first." },
        { status: 400 }
      );
    }

    const profile = credentials.profileName || "production";
    
    // Set credentials in MCP server
    await setUserBoomiCredentials({
      accountId: credentials.accountId,
      username: credentials.username,
      apiToken: credentials.apiToken,
      profileName: profile,
    });

    const tests: WizardTestResult[] = [];
    const summary = {
      processes: 0,
      atoms: 0,
      environments: 0,
      connections: 0,
      maps: 0,
      deployments: 0,
      executions: 0,
    };

    // Test 1: List Processes
    try {
      const result = await callMCPTool("manage_process", {
        action: "list",
        profile,
      });
      const processes = result ? JSON.parse(result) : [];
      const processCount = Array.isArray(processes) ? processes.length : 0;
      summary.processes = processCount;
      tests.push({
        category: "Processes",
        success: true,
        data: Array.isArray(processes) ? processes.slice(0, 5) : [],
        count: processCount,
      });
    } catch (error) {
      tests.push({
        category: "Processes",
        success: false,
        data: [],
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Test 2: List Atoms
    try {
      const result = await callMCPTool("list_atoms", { profile });
      const atoms = result ? JSON.parse(result) : [];
      const atomCount = Array.isArray(atoms) ? atoms.length : 0;
      summary.atoms = atomCount;
      tests.push({
        category: "Atoms",
        success: true,
        data: Array.isArray(atoms) ? atoms.slice(0, 5) : [],
        count: atomCount,
      });
    } catch (error) {
      tests.push({
        category: "Atoms",
        success: false,
        data: [],
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Test 3: List Environments
    try {
      const result = await callMCPTool("list_environments", { profile });
      const environments = result ? JSON.parse(result) : [];
      const envCount = Array.isArray(environments) ? environments.length : 0;
      summary.environments = envCount;
      tests.push({
        category: "Environments",
        success: true,
        data: Array.isArray(environments) ? environments.slice(0, 5) : [],
        count: envCount,
      });
    } catch (error) {
      tests.push({
        category: "Environments",
        success: false,
        data: [],
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Test 4: List Connections
    try {
      const result = await callMCPTool("list_connections", { profile });
      const connections = result ? JSON.parse(result) : [];
      const connCount = Array.isArray(connections) ? connections.length : 0;
      summary.connections = connCount;
      tests.push({
        category: "Connections",
        success: true,
        data: Array.isArray(connections) ? connections.slice(0, 5) : [],
        count: connCount,
      });
    } catch (error) {
      tests.push({
        category: "Connections",
        success: false,
        data: [],
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Test 5: List Maps
    try {
      const result = await callMCPTool("list_maps", { profile });
      const maps = result ? JSON.parse(result) : [];
      const mapCount = Array.isArray(maps) ? maps.length : 0;
      summary.maps = mapCount;
      tests.push({
        category: "Maps",
        success: true,
        data: Array.isArray(maps) ? maps.slice(0, 5) : [],
        count: mapCount,
      });
    } catch (error) {
      tests.push({
        category: "Maps",
        success: false,
        data: [],
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Test 6: List Deployments
    try {
      const result = await callMCPTool("list_deployments", { profile });
      const deployments = result ? JSON.parse(result) : [];
      const deployCount = Array.isArray(deployments) ? deployments.length : 0;
      summary.deployments = deployCount;
      tests.push({
        category: "Deployments",
        success: true,
        data: Array.isArray(deployments) ? deployments.slice(0, 5) : [],
        count: deployCount,
      });
    } catch (error) {
      tests.push({
        category: "Deployments",
        success: false,
        data: [],
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Test 7: List Execution Records
    try {
      const result = await callMCPTool("list_execution_records", { profile });
      const executions = result ? JSON.parse(result) : [];
      const execCount = Array.isArray(executions) ? executions.length : 0;
      summary.executions = execCount;
      tests.push({
        category: "Executions",
        success: true,
        data: Array.isArray(executions) ? executions.slice(0, 5) : [],
        count: execCount,
      });
    } catch (error) {
      tests.push({
        category: "Executions",
        success: false,
        data: [],
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Generate custom prompts based on test results
    const generatedPrompts = generateCustomPrompts(tests, summary);

    const wizardResult: WizardResult = {
      success: true,
      tests,
      generatedPrompts,
      summary,
    };

    return Response.json(wizardResult);
  } catch (error) {
    console.error("Error in prompt wizard:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        tests: [],
        generatedPrompts: [],
        summary: {
          processes: 0,
          atoms: 0,
          environments: 0,
          connections: 0,
          maps: 0,
          deployments: 0,
          executions: 0,
        },
      },
      { status: 500 }
    );
  }
}

function generateCustomPrompts(
  tests: WizardTestResult[],
  summary: WizardResult["summary"]
): WizardResult["generatedPrompts"] {
  const prompts: WizardResult["generatedPrompts"] = [];

  // Get actual data from successful tests
  const processesTest = tests.find((t) => t.category === "Processes");
  const atomsTest = tests.find((t) => t.category === "Atoms");
  const environmentsTest = tests.find((t) => t.category === "Environments");
  const connectionsTest = tests.find((t) => t.category === "Connections");
  const mapsTest = tests.find((t) => t.category === "Maps");
  const deploymentsTest = tests.find((t) => t.category === "Deployments");
  const executionsTest = tests.find((t) => t.category === "Executions");

  const processes = processesTest?.success && Array.isArray(processesTest.data) ? processesTest.data : [];
  const atoms = atomsTest?.success && Array.isArray(atomsTest.data) ? atomsTest.data : [];
  const environments = environmentsTest?.success && Array.isArray(environmentsTest.data) ? environmentsTest.data : [];
  const connections = connectionsTest?.success && Array.isArray(connectionsTest.data) ? connectionsTest.data : [];
  const maps = mapsTest?.success && Array.isArray(mapsTest.data) ? mapsTest.data : [];

  // Process-specific prompts
  if (processes.length > 0) {
    const firstProcess = processes[0];
    const processName = firstProcess.name || "your process";
    const processId = firstProcess.id || "";

    if (environments.length > 0) {
      const firstEnv = environments[0];
      const envName = firstEnv.name || "production";
      prompts.push({
        title: `Deploy ${processName} to ${envName}`,
        description: `Deploy your process '${processName}' to the ${envName} environment`,
        prompt: `Deploy process '${processName}' (${processId}) to the '${envName}' environment. Show me the deployment status.`,
        category: "Deployment",
        icon: "🚀",
      });
    }

    if (processes.length > 1) {
      const secondProcess = processes[1];
      prompts.push({
        title: `Compare ${processes[0].name} and ${secondProcess.name}`,
        description: `Compare two of your processes side by side`,
        prompt: `Get details for process '${processes[0].name}' (${processes[0].id}) and process '${secondProcess.name}' (${secondProcess.id}). Compare their configurations and purposes.`,
        category: "Process Management",
        icon: "⚖️",
      });
    }

    prompts.push({
      title: `Monitor ${processName} Executions`,
      description: `Track execution records for your process`,
      prompt: `Get execution records for process '${processName}' (${processId}). Show me recent executions, their status, and any errors.`,
      category: "Monitoring",
      icon: "📊",
    });
  }

  // Atom-specific prompts
  if (atoms.length > 0) {
    const firstAtom = atoms[0];
    const atomName = firstAtom.name || "your atom";
    const atomId = firstAtom.id || "";

    prompts.push({
      title: `Check Health of ${atomName}`,
      description: `Monitor the health and status of your atom`,
      prompt: `Check the status and health of atom '${atomName}' (${atomId}). Get detailed information about its capabilities and current state.`,
      category: "Monitoring",
      icon: "⚡",
    });

    if (atoms.length > 1) {
      prompts.push({
        title: "Compare All Atoms",
        description: `Compare all ${atoms.length} of your atoms`,
        prompt: `List all atoms and get detailed information about each one. Compare their capabilities, versions, and health status. Which atoms need attention?`,
        category: "Monitoring",
        icon: "🔍",
      });
    }
  }

  // Environment-specific prompts
  if (environments.length > 1) {
    const envNames = environments.map((e: any) => e.name).join(", ");
    prompts.push({
      title: "Multi-Environment Deployment",
      description: `Deploy to multiple environments (${envNames})`,
      prompt: `List all environments. Deploy a process to multiple environments and check the deployment status for each.`,
      category: "Deployment",
      icon: "🌍",
    });
  }

  // Component-specific prompts
  if (connections.length > 0 && maps.length > 0) {
    prompts.push({
      title: "Build Process with Available Components",
      description: `Use your ${connections.length} connections and ${maps.length} maps to build a process`,
      prompt: `List all connections and maps. Show me what components I can use to build a new integration process. Create a process that uses these components.`,
      category: "Process Management",
      icon: "🔧",
    });
  }

  // Deployment-specific prompts
  if (deploymentsTest?.success && summary.deployments > 0) {
    prompts.push({
      title: "Review Recent Deployments",
      description: `Review your ${summary.deployments} recent deployments`,
      prompt: `List all deployments and check the status of each. Identify any failed deployments and show me the error details.`,
      category: "Deployment",
      icon: "📋",
    });
  }

  // Execution-specific prompts
  if (executionsTest?.success && summary.executions > 0) {
    prompts.push({
      title: "Analyze Execution Patterns",
      description: `Analyze your ${summary.executions} execution records`,
      prompt: `List execution records from the last 24 hours. Identify patterns, find failed executions, and analyze common error types.`,
      category: "Monitoring",
      icon: "📈",
    });
  }

  // Comprehensive system check
  if (summary.processes > 0 || summary.atoms > 0 || summary.environments > 0) {
    prompts.push({
      title: "Complete System Health Check",
      description: "Get a comprehensive overview of your Boomi infrastructure",
      prompt: `Check the status of all ${summary.atoms} atom${summary.atoms !== 1 ? "s" : ""}, list all ${summary.environments} environment${summary.environments !== 1 ? "s" : ""}, review ${summary.processes} process${summary.processes !== 1 ? "es" : ""}, check recent deployments, and review execution records. Give me a comprehensive system status report.`,
      category: "Advanced",
      icon: "🎯",
    });
  }

  // If no data found, suggest setup prompts
  if (summary.processes === 0 && summary.atoms === 0) {
    prompts.push({
      title: "Set Up Your Boomi Environment",
      description: "Get started with your Boomi integration",
      prompt: "Find a process in my Boomi account. Once you find one, show me its process ID and give me a detailed breakdown of its structure, components, configuration, and purpose. If no processes are found, help me understand what I need to set up first.",
      category: "Setup",
      icon: "🛠️",
    });
  }

  return prompts;
}

