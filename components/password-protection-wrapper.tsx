"use client";

import { useEffect, useState } from "react";
import { PasswordProtection } from "./password-protection";
import { useRouter } from "next/navigation";

export function PasswordProtectionWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if cookie exists
    const checkAuth = () => {
      const cookies = document.cookie.split(";");
      const demoAuth = cookies.find((cookie) =>
        cookie.trim().startsWith("demo-auth=")
      );
      const DEMO_PASSWORD = "HICG";
      if (demoAuth && demoAuth.split("=")[1] === DEMO_PASSWORD) {
        setIsAuthenticated(true);
      }
      setIsChecking(false);
    };

    checkAuth();
  }, []);

  const handleSuccess = () => {
    setIsAuthenticated(true);
    router.refresh();
  };

  if (isChecking) {
    return (
      <div className="flex h-dvh w-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PasswordProtection onSuccess={handleSuccess} />;
  }

  return null;
}

