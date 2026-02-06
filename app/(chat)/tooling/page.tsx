import { auth } from "@/app/(auth)/auth";
import { ToolingPrompts } from "@/components/tooling-prompts";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ToolingPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-4xl py-8 px-4">
          Loading...
        </div>
      }
    >
      <ToolingContent />
    </Suspense>
  );
}

async function ToolingContent() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🧪 Tooling Test Prompts</h1>
        <p className="text-muted-foreground">
          Copy any prompt and paste it in the chatbot to test all 24 Boomi MCP
          tools. Each prompt shows which tools it exercises and what to expect.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Playbook</CardTitle>
          <CardDescription>
            Work through these prompts to verify your Boomi integration is fully
            operational. Start with the Quick Health Check to validate
            connectivity, then explore deeper categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ToolingPrompts />
        </CardContent>
      </Card>
    </div>
  );
}

