"use client";

import type { ComponentProps } from "react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

type ResponseProps = ComponentProps<typeof Streamdown>;

/**
 * Custom error component for Mermaid diagrams that shows the
 * raw diagram code as a fallback when mermaid can't be loaded.
 */
function MermaidFallback({
  error,
  chart,
}: {
  error: string;
  chart: string;
  retry: () => void;
}) {
  return (
    <div className="rounded-md border border-border bg-muted/50 p-3">
      <pre className="overflow-x-auto text-xs whitespace-pre-wrap">
        <code>{chart}</code>
      </pre>
    </div>
  );
}

export function Response({ className, children, ...props }: ResponseProps) {
  return (
    <Streamdown
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_code]:whitespace-pre-wrap [&_code]:break-words [&_pre]:max-w-full [&_pre]:overflow-x-auto",
        className
      )}
      mermaid={{ errorComponent: MermaidFallback }}
      {...props}
    >
      {children}
    </Streamdown>
  );
}
