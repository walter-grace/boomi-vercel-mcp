"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo } from "react";
import { useWindowSize } from "usehooks-ts";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { PlusIcon, VercelIcon } from "./icons";
import { useSidebar } from "./ui/sidebar";
import { VisibilitySelector, type VisibilityType } from "./visibility-selector";

function PureChatHeader({
  chatId,
  selectedVisibilityType,
  isReadonly,
}: {
  chatId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const router = useRouter();
  const { open } = useSidebar();

  const { width: windowWidth } = useWindowSize();

  const isMobile = windowWidth && windowWidth < 768;
  const showBranding = isMobile || !open;

  return (
    <header className="sticky top-0 z-10 flex items-center gap-1.5 sm:gap-2 bg-background/95 backdrop-blur-sm border-b border-border px-2 py-2 md:px-4 shadow-sm">
      <SidebarToggle />

      {/* Boomi Assistant Branding - always visible on mobile, visible on desktop when sidebar is closed */}
      {showBranding && (
        <Link
          className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 hover:opacity-80 transition-opacity"
          href="/"
          onClick={() => {
            router.push("/");
            router.refresh();
          }}
        >
          <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-gradient-to-br from-[#0073CF] to-[#00A3E0] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs sm:text-sm">B</span>
          </div>
          <span className="font-bold text-xs sm:text-sm md:text-base bg-gradient-to-r from-[#0073CF] to-[#00A3E0] bg-clip-text text-transparent whitespace-nowrap">
            Boomi Assistant
          </span>
        </Link>
      )}

      {showBranding && (
        <Button
          className="order-2 ml-auto h-8 w-8 p-0 sm:h-8 sm:w-8 md:order-1 md:ml-0 hover:scale-105 transition-transform flex-shrink-0"
          onClick={() => {
            router.push("/");
            router.refresh();
          }}
          variant="outline"
        >
          <PlusIcon size={16} />
          <span className="sr-only">New Chat</span>
        </Button>
      )}

      {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          className="order-1 ml-auto md:order-2 flex-shrink-0"
          selectedVisibilityType={selectedVisibilityType}
        />
      )}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return (
    prevProps.chatId === nextProps.chatId &&
    prevProps.selectedVisibilityType === nextProps.selectedVisibilityType &&
    prevProps.isReadonly === nextProps.isReadonly
  );
});
