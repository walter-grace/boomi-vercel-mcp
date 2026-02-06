import { auth } from "@/app/(auth)/auth";
import { BoomiCredentialsForm } from "@/components/boomi-credentials-form";
import { SettingsCloseButton } from "@/components/settings-close-button";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Suspense } from "react";

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-2xl py-8 px-4">
          Loading...
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}

async function SettingsContent() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your Boomi integration settings and credentials
          </p>
        </div>
        <SettingsCloseButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Boomi Integration</CardTitle>
          <CardDescription>
            Enter your Boomi API credentials to use Boomi MCP tools in your
            chats. These credentials are stored securely and encrypted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BoomiCredentialsForm />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About Boomi Credentials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Your Boomi credentials allow the AI assistant to interact with your
            Boomi Platform account through the MCP (Model Context Protocol)
            server.
          </p>
          <p>
            <strong>Security:</strong> Your API token is encrypted using
            AES-256-GCM before being stored in the database. Only you can access
            your credentials.
          </p>
          <p>
            <strong>Usage:</strong> Once saved, your credentials will be
            automatically used when you use Boomi-related features in your
            chats.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
