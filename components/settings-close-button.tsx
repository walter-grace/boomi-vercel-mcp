"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SettingsCloseButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-8 w-8 shrink-0"
      onClick={() => router.back()}
      aria-label="Close settings"
      type="button"
    >
      <X className="h-4 w-4" />
    </Button>
  );
}
