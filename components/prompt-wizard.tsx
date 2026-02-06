"use client";

import { useState } from "react";
import type { UseChatHelpers } from "@ai-sdk/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import type { ChatMessage } from "@/lib/types";

interface PromptWizardProps {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  onComplete: (prompts: Array<{
    title: string;
    description: string;
    prompt: string;
    category: string;
    icon: string;
  }>) => void;
}

interface WizardTestResult {
  category: string;
  success: boolean;
  count?: number;
  error?: string;
}

export function PromptWizard({ chatId, sendMessage, onComplete }: PromptWizardProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<WizardTestResult[] | null>(null);
  const [generatedPrompts, setGeneratedPrompts] = useState<Array<{
    title: string;
    description: string;
    prompt: string;
    category: string;
    icon: string;
  }> | null>(null);
  const [summary, setSummary] = useState<{
    processes: number;
    atoms: number;
    environments: number;
    connections: number;
    maps: number;
    deployments: number;
    executions: number;
  } | null>(null);

  const runWizard = async () => {
    setIsRunning(true);
    setResults(null);
    setGeneratedPrompts(null);
    setSummary(null);

    try {
      const response = await fetch("/api/prompt-wizard", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        // Show the actual error message from the API
        throw new Error(data.error || `Failed to run wizard (${response.status})`);
      }

      if (data.success) {
        setResults(data.tests);
        setGeneratedPrompts(data.generatedPrompts);
        setSummary(data.summary);
        onComplete(data.generatedPrompts);
      } else {
        throw new Error(data.error || "Wizard failed");
      }
    } catch (error) {
      console.error("Wizard error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setResults([
        {
          category: "Error",
          success: false,
          error: errorMessage,
        },
      ]);
      setGeneratedPrompts([]);
      setSummary({
        processes: 0,
        atoms: 0,
        environments: 0,
        connections: 0,
        maps: 0,
        deployments: 0,
        executions: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  if (isRunning) {
    return (
      <Card className="border-[#0073CF]/20 bg-gradient-to-r from-[#0073CF]/5 to-[#00A3E0]/5">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#0073CF]" />
            <div className="text-center">
              <h3 className="font-semibold text-sm mb-1">Running Prompt Wizard</h3>
              <p className="text-xs text-muted-foreground">
                Testing your Boomi environment and generating custom prompts...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results) {
    const hasError = results.some((r) => r.category === "Error");
    const testResults = results.filter((r) => r.category !== "Error");
    const successCount = testResults.filter((r) => r.success).length;
    const totalCount = testResults.length;

    return (
      <Card className="border-[#0073CF]/20 bg-gradient-to-r from-[#0073CF]/5 to-[#00A3E0]/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[#0073CF]" />
              <CardTitle className="text-lg font-semibold">
                Wizard Results
              </CardTitle>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={runWizard}
              className="text-xs"
            >
              Run Again
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary */}
          {summary && (
            <div className="p-4 rounded-lg bg-background/50 border border-[#0073CF]/10">
              <h4 className="font-semibold text-sm mb-3">Environment Summary</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-muted-foreground">Processes</div>
                  <div className="font-semibold text-[#0073CF]">{summary.processes}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Atoms</div>
                  <div className="font-semibold text-[#0073CF]">{summary.atoms}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Environments</div>
                  <div className="font-semibold text-[#0073CF]">{summary.environments}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Connections</div>
                  <div className="font-semibold text-[#0073CF]">{summary.connections}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Maps</div>
                  <div className="font-semibold text-[#0073CF]">{summary.maps}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Deployments</div>
                  <div className="font-semibold text-[#0073CF]">{summary.deployments}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Executions</div>
                  <div className="font-semibold text-[#0073CF]">{summary.executions}</div>
                </div>
              </div>
            </div>
          )}

          {/* Show error message prominently if wizard failed */}
          {hasError && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-red-900 dark:text-red-100 mb-1">
                    Wizard Failed
                  </h4>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    {results.find((r) => r.category === "Error")?.error}
                  </p>
                  {results.find((r) => r.category === "Error")?.error?.includes("credentials") && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                      Please configure your Boomi credentials in Settings first.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Test Results - only show if no error */}
          {!hasError && totalCount > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Test Results ({successCount}/{totalCount} successful)</h4>
              <div className="space-y-1">
                {results.filter((r) => r.category !== "Error").map((result) => (
                  <div
                    key={result.category}
                    className="flex items-center justify-between p-2 rounded bg-background/50 border border-[#0073CF]/5"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {result.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      )}
                      <span className="text-xs font-medium">{result.category}</span>
                      {result.count !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          ({result.count})
                        </span>
                      )}
                    </div>
                    {result.error && (
                      <span className="text-xs text-red-500 truncate max-w-[300px] ml-2" title={result.error}>
                        {result.error}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generated Prompts Count */}
          {generatedPrompts && generatedPrompts.length > 0 && (
            <div className="p-3 rounded-lg bg-[#0073CF]/10 border border-[#0073CF]/20">
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-[#0073CF]" />
                <span className="text-sm font-semibold">
                  Generated {generatedPrompts.length} custom prompt{generatedPrompts.length !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                These prompts have been added to your Prompt Library
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#0073CF]/20 bg-gradient-to-r from-[#0073CF]/5 to-[#00A3E0]/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Wand2 className="h-5 w-5 text-[#0073CF]" />
          <CardTitle className="text-lg font-semibold">Prompt Wizard</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Run a comprehensive test of your Boomi environment to generate personalized prompts
            based on your actual processes, atoms, environments, and components.
          </p>
          <Button
            onClick={runWizard}
            className="w-full bg-[#0073CF] hover:bg-[#005fa3] text-white"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Run Prompt Wizard
          </Button>
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">The wizard will:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Test your Boomi credentials</li>
              <li>Discover your processes, atoms, and environments</li>
              <li>Check your components and deployments</li>
              <li>Generate custom prompts based on your setup</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

