"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/toast";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface BoomiCredentials {
  accountId: string;
  username: string;
  profileName: string;
}

export function BoomiCredentialsForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    accountId: "",
    username: "",
    apiToken: "",
    profileName: "default",
  });

  // Fetch existing credentials on mount
  useEffect(() => {
    async function fetchCredentials() {
      try {
        const response = await fetch("/api/boomi-credentials");
        if (response.ok) {
          const data = await response.json();
          if (data.credentials) {
            setFormData({
              accountId: data.credentials.accountId || "",
              username: data.credentials.username || "",
              apiToken: "", // Never show the token
              profileName: data.credentials.profileName || "default",
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch credentials:", error);
      } finally {
        setFetching(false);
      }
    }

    fetchCredentials();
  }, []);

  const parseBulkInput = (input: string) => {
    const lines = input.split("\n").filter((line) => line.trim());
    const parsed: Record<string, string> = {};

    for (const line of lines) {
      // Support formats:
      // BOOMI_ACCOUNT_ID=value
      // BOOMI_ACCOUNT_ID = value
      // BOOMI_ACCOUNT_ID: value
      const match = line.match(/^\s*([A-Z_]+)\s*[=:]\s*(.+)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, ""); // Remove quotes
        parsed[key] = value;
      }
    }

    return parsed;
  };

  const handleBulkPaste = () => {
    const parsed = parseBulkInput(bulkInput);
    
    const updates: Partial<typeof formData> = {};
    
    if (parsed.BOOMI_ACCOUNT_ID) {
      updates.accountId = parsed.BOOMI_ACCOUNT_ID;
    }
    if (parsed.BOOMI_USERNAME) {
      updates.username = parsed.BOOMI_USERNAME;
    }
    if (parsed.BOOMI_API_TOKEN) {
      updates.apiToken = parsed.BOOMI_API_TOKEN;
    }
    if (parsed.BOOMI_PROFILE_NAME) {
      updates.profileName = parsed.BOOMI_PROFILE_NAME;
    }

    if (Object.keys(updates).length > 0) {
      setFormData({ ...formData, ...updates });
      setBulkInput("");
      setShowBulkInput(false);
      toast({
        type: "success",
        description: `Parsed and filled ${Object.keys(updates).length} field(s)`,
      });
    } else {
      toast({
        type: "error",
        description: "No valid environment variables found. Expected format: BOOMI_ACCOUNT_ID=value",
      });
    }
  };

  const exportToBulkFormat = () => {
    const envVars = [
      `BOOMI_ACCOUNT_ID=${formData.accountId || ""}`,
      `BOOMI_USERNAME=${formData.username || ""}`,
      `BOOMI_API_TOKEN=${formData.apiToken || ""}`,
      `BOOMI_PROFILE_NAME=${formData.profileName || "default"}`,
    ].join("\n");

    navigator.clipboard.writeText(envVars);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      type: "success",
      description: "Environment variables copied to clipboard",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/boomi-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          type: "success",
          description: "Boomi credentials saved successfully!",
        });
        // Navigate back to home page after a short delay
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        toast({
          type: "error",
          description: data.error || "Failed to save credentials",
        });
      }
    } catch (error) {
      toast({
        type: "error",
        description: "Error saving credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Bulk Input Section */}
      <Collapsible open={showBulkInput} onOpenChange={setShowBulkInput}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Bulk Import (Environment Variables)</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={exportToBulkFormat}
                className="text-xs h-7"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Export
                  </>
                )}
              </Button>
              <CollapsibleTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="text-xs h-7">
                  {showBulkInput ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Hide
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Paste Multiple
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
          <CollapsibleContent>
            <div className="space-y-2">
              <Textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder={`Paste your environment variables here:\n\nBOOMI_ACCOUNT_ID=12345\nBOOMI_USERNAME=BOOMI_TOKEN.user@example.com\nBOOMI_API_TOKEN=your-api-token\nBOOMI_PROFILE_NAME=production`}
                className="font-mono text-xs min-h-[120px]"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Paste environment variables in KEY=value format (one per line)
                </p>
                <Button
                  type="button"
                  onClick={handleBulkPaste}
                  disabled={!bulkInput.trim()}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  Parse & Fill
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <div className="space-y-2">
        <Label htmlFor="accountId">Boomi Account ID</Label>
        <Input
          id="accountId"
          value={formData.accountId}
          onChange={(e) =>
            setFormData({ ...formData, accountId: e.target.value })
          }
          placeholder="Your Boomi Account ID"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Boomi Username</Label>
        <Input
          id="username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          placeholder="BOOMI_TOKEN.email@example.com"
          required
        />
        <p className="text-sm text-muted-foreground">
          Format: BOOMI_TOKEN.your-email@example.com
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="apiToken">Boomi API Token</Label>
        <Input
          id="apiToken"
          type="password"
          value={formData.apiToken}
          onChange={(e) =>
            setFormData({ ...formData, apiToken: e.target.value })
          }
          placeholder="Enter your Boomi API token"
          required
        />
        <p className="text-sm text-muted-foreground">
          Your API token is encrypted and stored securely
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profileName">Profile Name (Optional)</Label>
        <Input
          id="profileName"
          value={formData.profileName}
          onChange={(e) =>
            setFormData({ ...formData, profileName: e.target.value })
          }
          placeholder="default"
        />
        <p className="text-sm text-muted-foreground">
          Optional: Custom name for this credential set
        </p>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : "Save Credentials"}
      </Button>
    </form>
  );
}

