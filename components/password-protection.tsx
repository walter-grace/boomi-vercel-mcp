"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEMO_PASSWORD = "HICG";

export function PasswordProtection({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password === DEMO_PASSWORD) {
      // Set a cookie to remember the authentication
      document.cookie = `demo-auth=${DEMO_PASSWORD}; path=/; max-age=86400; SameSite=Lax`; // 24 hours
      toast.success("Access granted!");
      onSuccess();
    } else {
      toast.error("Incorrect password. Please try again.");
      setPassword("");
    }

    setIsLoading(false);
  };

  return (
    <div className="flex h-dvh w-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#0073CF] to-[#00A3E0] bg-clip-text text-transparent">
            Boomi Assistant
          </h1>
          <p className="text-sm text-muted-foreground">
            This is a demo environment. Please enter the password to continue.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              autoFocus
              disabled={isLoading}
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              type="password"
              value={password}
            />
          </div>

          <Button
            className="w-full"
            disabled={isLoading || !password}
            type="submit"
          >
            {isLoading ? "Verifying..." : "Access Demo"}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          Contact your administrator for access
        </p>
      </div>
    </div>
  );
}
