import React, { createContext, useState, useEffect, use } from "react";

export interface TryOnGlobalContextValue {
  isTryOnOpen: boolean;
  openTryOn: () => void;
  closeTryOn: () => void;
  hasUnreadResult: boolean;
  setHasUnreadResult: (unread: boolean) => void;
  isTryOnGenerating: boolean;
  setIsTryOnGenerating: (generating: boolean) => void;
}

export const TryOnGlobalContext = createContext<TryOnGlobalContextValue | null>(null);

export function TryOnGlobalProvider({ children }: { children: React.ReactNode }) {
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [hasUnreadResult, setHasUnreadResult] = useState(() => {
    return sessionStorage.getItem("tryon_unread_result") === "true";
  });
  const [isTryOnGenerating, setIsTryOnGenerating] = useState(() => {
    return !!(window as any).__tryon_is_generating;
  });

  const openTryOn = () => setIsTryOnOpen(true);
  const closeTryOn = () => setIsTryOnOpen(false);

  // Sync unread status with session storage
  useEffect(() => {
    sessionStorage.setItem("tryon_unread_result", hasUnreadResult ? "true" : "false");
  }, [hasUnreadResult]);

  // Handle updates from custom events in case legacy parts dispatch them
  useEffect(() => {
    const handleOpen = () => setIsTryOnOpen(true);
    const handleUnread = (e: Event) => {
      const customEvent = e as CustomEvent<{ hasUnread: boolean }>;
      setHasUnreadResult(customEvent.detail?.hasUnread ?? false);
    };
    const handleGenerating = (e: Event) => {
      const customEvent = e as CustomEvent<{ isGenerating: boolean }>;
      setIsTryOnGenerating(customEvent.detail?.isGenerating ?? false);
    };

    window.addEventListener("tryon:open", handleOpen);
    window.addEventListener("tryon:unread-change", handleUnread);
    window.addEventListener("tryon:generating-change", handleGenerating);

    return () => {
      window.removeEventListener("tryon:open", handleOpen);
      window.removeEventListener("tryon:unread-change", handleUnread);
      window.removeEventListener("tryon:generating-change", handleGenerating);
    };
  }, []);

  return (
    <TryOnGlobalContext
      value={{
        isTryOnOpen,
        openTryOn,
        closeTryOn,
        hasUnreadResult,
        setHasUnreadResult,
        isTryOnGenerating,
        setIsTryOnGenerating,
      }}
    >
      {children}
    </TryOnGlobalContext>
  );
}

export function useTryOnGlobal() {
  const context = use(TryOnGlobalContext);
  if (!context) {
    throw new Error("useTryOnGlobal must be used within a TryOnGlobalProvider");
  }
  return context;
}
