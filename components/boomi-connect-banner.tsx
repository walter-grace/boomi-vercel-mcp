"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LinkIcon, CheckCircle2 } from "lucide-react";

export function BoomiConnectBanner() {
  const [hasCredentials, setHasCredentials] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkCredentials() {
      try {
        const response = await fetch("/api/boomi-credentials");
        // Handle both 200 OK and other status codes gracefully
        if (response.ok) {
          const data = await response.json();
          setHasCredentials(!!data.credentials);
        } else {
          // If error, assume no credentials (show connect button)
          setHasCredentials(false);
        }
      } catch (error) {
        // On any error, assume no credentials (show connect button)
        console.warn("Failed to check credentials (showing connect option):", error);
        setHasCredentials(false);
      } finally {
        setLoading(false);
      }
    }

    checkCredentials();
  }, []);

  if (loading) {
    return null;
  }

  if (hasCredentials) {
    return (
      <Card className="border-[#0073CF]/20 bg-gradient-to-r from-[#0073CF]/5 to-[#00A3E0]/5">
        <CardContent className="flex items-center justify-between gap-2 p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-[#0073CF] shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold text-xs md:text-sm">Boomi Account Connected</p>
              <p className="text-[10px] md:text-xs text-muted-foreground truncate">
                Your Boomi credentials are configured and ready to use
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0 text-xs h-7 md:h-8">
            <Link href="/settings">Manage</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#0073CF]/30 bg-gradient-to-r from-[#0073CF]/10 to-[#00A3E0]/10">
      <CardContent className="flex items-center justify-between gap-2 p-3 md:p-4">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <LinkIcon className="h-4 w-4 md:h-5 md:w-5 text-[#0073CF] shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-xs md:text-sm">Connect Your Boomi Account</p>
            <p className="text-[10px] md:text-xs text-muted-foreground">
              Connect credentials to use Boomi MCP tools
            </p>
          </div>
        </div>
        <Button asChild className="bg-[#0073CF] hover:bg-[#005fa3] shrink-0 text-xs h-7 md:h-8 px-2.5 md:px-3">
          <Link href="/settings">Connect</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

